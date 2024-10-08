import './style.css'
import {dateUtils} from "./date-utils.ts";
import {DayData} from "./types.ts";
import {DB} from "./DB.ts";
import {Recorder} from "./Recorder.ts";
import {autosizeTextArea} from "./autosizeTextArea.ts";

const db = new DB()
await db.init()

const session = {
    currentDate: dateUtils.getTodayString(),
    get currentViewDate() {
        return this.currentDate
    },
    set currentViewDate(yyyymmdd: string) {
        this.currentDate = yyyymmdd
    },
    monthString: dateUtils.getMonthStringCapitalized(dateUtils.getYYYYMMfromYYYYMMDD(dateUtils.getTodayString())),
    currentMonth: dateUtils.getYYYYMMfromYYYYMMDD(dateUtils.getTodayString()),
    today: (await db.today())[0],
    currentDayUUID: (await db.today())[0].uuid,
}

function generateTimelineHTML(timeline: DayData[]) {
    let timelineHTML = `
            <div class="grid grid-cols-[repeat(auto-fill,_minmax(1.7em,_1fr))] grid-rows-[50px] gap-2">
    `
    for (let {word_count, day, is_today} of timeline) {
        timelineHTML += `
            <div class="my-0.5 mx-0.1 cursor-pointer flex flex-col max-w-[50px]">
                <span class="block text-xs text-blue-50 text-center">${day + 1}</span>
                <button class='block font-normal text-center py-1' id='${day + 1}'>
                    <span class='${"block " + (
            word_count === -1 || word_count === 0 ? "bg-zinc-300"
                : word_count > 0 && word_count < 500 ? "bg-yellow-300"
                    : word_count > 500 ? "bg-red-300"
                        : ""
        ) + (is_today ? " border-4 border-b-blue-50" : "")}'
                    >
                        ${word_count === -1 ? "—" : word_count}
                    </span>
                </button>
            </div>
        `
    }

    timelineHTML += `</div>`
    document.querySelector("#timeline")!.innerHTML = timelineHTML

    const buttons = document.querySelectorAll("#timeline button")
    buttons.forEach((button) => {
        button.addEventListener('click', async function () {
            session.currentViewDate = dateUtils.getCurrentDate(session.currentMonth, parseInt(button.id)).toString()
            document.querySelector("#area")!.innerHTML = await generateTextView(session.currentViewDate)
        })
    })
}

async function generateTextView(yyyymmdd: string) {
    let output = ''

    if (dateUtils.isToday(yyyymmdd)) {
        const [today] = await db.today()
        session.today = today
        output += `
            <h2 class="text-blue-50 text-3xl self-start w-full">Автор, жги!</h2>
            <textarea
                class="custom-paper overflow-hidden scroll-smooth w-full text-gray-800 mt-5
                text-2xl leading-10 pt-[50px] px-24 pb-9 mb-16 bg-local bg-blue-300
                rounded-xl shadow-lg border-t-2 border-b-2 border-white max-w-screen-xl"
                title="write something"
                cols="30"
                rows="10"
                name="entry"
                id="textarea"
                autoFocus>${today.text}</textarea>
        `
    } else {
        const [entry] = await db.day(yyyymmdd)
        session.currentDayUUID = entry.uuid
        output = `<pre class="whitespace-pre bg-zinc-300 rounded whitespace-pre-wrap p-10 m-10">${entry.text}</pre>}`
    }
    return output
}

async function generateClipsView(todayUUID: string) {

    const audios = await db.getAudiosByDate(todayUUID)

    let output = ''
    for (let {audio} of audios) {
        if (audio) {
            const opfsRoot = await navigator.storage.getDirectory()
            const fileHandle = await opfsRoot.getFileHandle(audio, {create: false})
            const file = await fileHandle.getFile()

            output += `<article class="clip">
                            <audio controls="" src="${window.URL.createObjectURL(file)}"></audio>
                            <span>${audio}</span><button>🗑</button>
                        </article>`

        }
    }
    return output
}


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <div class="grid grid-cols-3 text-blue-50 align-middle justify-center items-center h-20">
            <button><<</button>

            <h2 class="text-3xl font-bold text-blue-50 text-center">${session.monthString}</h2>

            <button
                disabled="${dateUtils.nowInCurrentMonth(dateUtils.getYYYYMMfromYYYYMMDD.call(this, session.currentViewDate))}"
            >
                >>
            </button>
        </div>

        <div id="timeline"></div>

        <button class="text-white" id="start">Start</button>
        <button class="text-white" id="stop">Stop</button>
        <br>
        <div id="clips">${await generateClipsView(session.currentDayUUID)}</div>

        <div id="area">
            ${await generateTextView(session.currentViewDate)}
        </div>
`

generateTimelineHTML(await db.timeline(dateUtils.getYYYYMMfromYYYYMMDD(dateUtils.getTodayString())))
autosizeTextArea.call(document.querySelector<HTMLTextAreaElement>("#textarea")!)

document.querySelector<HTMLTextAreaElement>("#textarea")!
    .addEventListener('input', async function () {
        const text = this.value

        await db.updateText(text)

        generateTimelineHTML(await db.timeline(dateUtils.getYYYYMMfromYYYYMMDD(dateUtils.getTodayString())))

        autosizeTextArea.call(this);
    })

document.querySelector<HTMLTextAreaElement>("#textarea")!
    .addEventListener('keydown', function (e) {
        if (e.key === "Tab") {
            e.preventDefault()
            e.stopPropagation()
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '\t' + this.value.substring(end)
            this.selectionStart = this.selectionEnd = start + 1;
        }
    })

new Recorder({
    soundClips: document.getElementById('clips')!,
    startButton: document.getElementById('start')!,
    stopButton: document.getElementById('stop')!,
})

window.addEventListener('audio-saved', async ({detail: {clipName}}: any) => {
    await db.insertAudio(session.today.uuid, clipName)
})
