import './style.css'
import {SQLocal} from 'sqlocal'
import {Temporal} from "@js-temporal/polyfill";
import {dateUtils} from "./date-utils.ts";
import {DayData} from "./types.ts";


export const db = new SQLocal('database.sqlite3')

await db.sql`
CREATE TABLE IF NOT EXISTS diaries (
    uuid TEXT PRIMARY KEY NOT NULL,
    text TEXT NOT NULL,
    date DATE NOT NULL UNIQUE,
    word_count INTEGER NOT NULL DEFAULT 0
)
`

await db.sql`
INSERT INTO diaries (uuid, text, date, word_count) VALUES (
    ${crypto.randomUUID()},
    ${""},
    ${dateUtils.getTodayString()},
    ${0}
)
ON CONFLICT(date) DO NOTHING;
`

const session = {
    currentDate: dateUtils.getTodayString(),
    get currentViewDate() {
        return this.currentDate
    },
    set currentViewDate(yyyymmdd: string) {
        this.currentDate = yyyymmdd
    },
    saving: false,
}
Object.defineProperty(window, "currentViewDate", {
    get() {
    },
    set(yyyymmdd: string) {
        this.currentViewDate = yyyymmdd
    }
})

const [today] = await db.sql`SELECT * FROM diaries WHERE date = ${dateUtils.getTodayString()}`

console.log(today)

function getWordCount(text: string): number {
    const wordsArr = text.trim().split(/[\s,.;]+/);
    for (let i = 0; i < wordsArr.length; i++) {
        if (wordsArr[i] === '') wordsArr.splice(i, 1) && i--;
    }
    return wordsArr.length;
}

async function getTimeline(yyyymm: Temporal.PlainYearMonth) {
    const timeline: DayData[] = []
    const isCurrentMonth: boolean = dateUtils.nowInCurrentMonth(yyyymm)
    const todayDayNumber: number = Temporal.Now.plainDateISO().day - 1

    const timelineData = await db.sql`SELECT date, word_count FROM diaries WHERE date >= ${dateUtils.getFirstDateOfMonth(yyyymm)} AND date <= ${dateUtils.getLastDateOfMonth(yyyymm)}`

    for (let i = 0; i < yyyymm.daysInMonth; i++) {
        timeline[i] = {
            day: i,
            word_count: 0
        };
    }

    if (isCurrentMonth) {
        for (let i = todayDayNumber; i < yyyymm.daysInMonth; i++) {
            timeline[i].word_count = -1;
        }
    }

    timelineData.forEach(({date, word_count}) => {
        const day = Temporal.PlainDate.from(date).day - 1

        timeline[timeline.findIndex((tlDay) => (tlDay.day === day))] = {
            day,
            word_count,
            is_today: todayDayNumber === day
        }
    })

    return timeline
}

function generateTimelineHTML(timeline: DayData[]) {
    let timelineHTML = `
            <div class="grid grid-cols-[repeat(auto-fill,_minmax(1.7em,_1fr))] grid-rows-[50px] gap-2">
    `
    for (let {word_count, day, is_today} of timeline) {
        timelineHTML += `
            <div class="my-0.5 mx-0.1 cursor-pointer flex flex-col max-w-[50px]">
                <span class="block text-xs text-blue-50 text-center">${day + 1}</span>
                <button class='block font-normal text-center py-1'>
                    <span class='${"block " + (
            word_count === -1 || word_count === 0 ? "bg-zinc-300"
                : word_count > 0 && word_count < 500 ? "bg-yellow-300"
                    : word_count > 500 ? "bg-red-300"
                        : ""
        ) + (is_today ? " border-4 border-b-blue-50" : "")}'>
                        ${word_count === -1 ? "—" : word_count}
                    </span>
                </button>
            </div>
        `
    }

    timelineHTML += `</div>`
    document.querySelector("#timeline")!.innerHTML = timelineHTML
}

async function generateTextView(yyyymmdd: string) {
    let output = ''

    if (dateUtils.isToday(yyyymmdd)) {
        output += `
            <h2 class="text-blue-50 text-3xl self-start w-full">Автор, жги!</h2>
            <textarea
                class="custom-paper overflow-hidden w-full text-gray-800 mt-5
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
        const [entry] = await db.sql`SELECT * FROM diaries WHERE date = ${yyyymmdd}`
        console.log(entry, yyyymmdd)
        output = `<pre class="whitespace-pre bg-zinc-300 rounded p-10 m-10">${entry.text}</pre>}`
    }
    return output
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <div class="grid grid-cols-3 text-blue-50 align-middle justify-center items-center h-20">
            <button><<</button>
            <h2 class="text-3xl font-bold text-blue-50 text-center">${dateUtils.getMonthStringCapitalized(dateUtils.getYYYYMMfromYYYYMMDD(dateUtils.getTodayString()))}</h2>
            <button>>></button>
        </div>
        
        <div id="timeline">
        
        </div>
        <div id="area">
            ${await generateTextView(session.currentViewDate)}
        </div>
`

generateTimelineHTML(await getTimeline(dateUtils.getYYYYMMfromYYYYMMDD(dateUtils.getTodayString())))

document.querySelector<HTMLTextAreaElement>("#textarea")!
    .addEventListener('input', async function () {
        const text = this.value

        await db.sql`UPDATE diaries SET text = ${text}, word_count = ${getWordCount(text)} WHERE date = ${dateUtils.getTodayString()}`

        generateTimelineHTML(await getTimeline(dateUtils.getYYYYMMfromYYYYMMDD(dateUtils.getTodayString())))

        const scrollLeft = window.scrollX;
        const scrollTop = window.scrollY;
        if (this) {
            this.style.overflow = 'hidden';
            this.style.height = "auto";
            this.style.height = `${Math.max(
                this.scrollHeight,
                160
            )}px`;
        }
        window.scrollTo(scrollLeft, scrollTop);
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

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
})
