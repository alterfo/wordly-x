import {DB} from "./storage/DB.mjs";
// import {Recorder} from "./Recorder.mjs";
import {autosizeTextArea} from "./autosizeTextArea.mjs";


const db = new DB()
await db.init()

// const session = {
//     currentDate: getYyyymmdd(),
//     get viewDate() {
//         return this.currentDate
//     },
//     set viewDate(yyyymmdd) {
//         this.currentDate = yyyymmdd
//     },
//     monthString: (new Date())
//         .toLocaleString('ru-RU', {
//             month: 'long',
//             year: 'numeric',
//             calendar: 'iso8601'
//         }),
//     yyyymm: getYyyymm(),
//     todayItem: (await db.viewText())[0],
//     viewTextUUID: (await db.viewText())[0].uuid,
// }

function generateTimelineHTML(timeline) {
    let timelineHTML = ``

    if ("content" in document.createElement("template")) {
        const $template = document.getElementById("template");
        const $day = $template.content.cloneNode(true)
        console.log(document.querySelectorAll(`[data-]`).keys())
    }

    // for (let {word_count, day, is_today} of timeline) {
    //
    //     timelineHTML += `
    //         <div class="my-0.5 mx-0.1 cursor-pointer flex flex-col max-w-[50px]">
    //             <span class="block text-xs text-blue-50 text-center">${day + 1}</span>
    //             <button class='block font-normal text-center py-1' id='${day + 1}'>
    //                 <span class='${"block " + (
    //         word_count === - 1 || word_count === 0 ? "bg-zinc-300"
    //             : word_count > 0 && word_count < 500 ? "bg-yellow-300"
    //                 : word_count > 500 ? "bg-red-300"
    //                     : ""
    //     ) + (
    //         is_today ? " border-4 border-b-blue-50" : ""
    //     ) }'
    //                 >
    //                     ${word_count === -1 ? "—" : word_count}
    //                 </span>
    //             </button>
    //         </div>
    //     `
    // }

    // timelineHTML += ``
    // document.querySelector("#timeline").innerHTML = timelineHTML
    //
    // const buttons = document.querySelectorAll("#timeline button")
    // buttons.forEach((button) => {
    //     button.addEventListener('click', async function () {
    //         const firstDateOfMonthWeAreIn =(new Date((session.yyyymm) + '-01'))
    //         firstDateOfMonthWeAreIn.setDate(parseInt(button.id))
    //         session.viewDate = firstDateOfMonthWeAreIn.toISOString().split('T')[0]
    //
    //         document.querySelector("#area").innerHTML = await textView()
    //     })
    // })
}

// async function editableTextView() {
//     let output = ''
//
//     const [today] = await db.viewText()
//
//     session.todayItem = today
//
//     output += `
//             <h2 class="text-blue-50 text-3xl self-start w-full">
//                 Автор, жги
//             </h2>
//
//             <textarea
//                 class="custom-paper overflow-hidden scroll-smooth w-full text-gray-800 mt-5
//                 text-2xl leading-10 pt-[50px] px-24 pb-9 mb-16 bg-local bg-blue-300
//                 rounded-xl shadow-lg border-t-2 border-b-2 border-white max-w-screen-xl"
//                 title="write something"
//                 cols="30"
//                 rows="10"
//                 name="entry"
//                 id="textarea"
//                 autoFocus>${today.text}
//             </textarea>
//     `
//
//     return output
// }


// async function textView() {
//     let output = ''
//     const [{text, uuid}] = await db.day(session.viewDate)
//
//     session.viewTextUUID = uuid
//
//     // оба whitespace-pre нужны для правильных переносов
//     output = `<pre class="whitespace-pre bg-zinc-300 rounded whitespace-pre-wrap p-10 m-10">
//                         ${text}
//                     </pre>}`
//     return output
// }

// async function generateClipsView(todayUUID) {
//
//     const audios = await db.getAudiosByDate(todayUUID)
//
//     let output = ''
//     for (let {audio} of audios) {
//         if (audio) {
//             const opfsRoot = await navigator.storage.getDirectory()
//             const fileHandle = await opfsRoot.getFileHandle(audio, {create: false})
//             const file = await fileHandle.getFile()
//
//             output += `<article class="clip">
//                             <audio controls="" src="${window.URL.createObjectURL(file)}"></audio>
//                             <span>${audio}</span><button>🗑</button>
//                         </article>`
//
//         }
//     }
//     return output
// }

// document.querySelector('#app').innerHTML = `
//
//         <button class="text-white" id="start">Start</button>
//         <button class="text-white" id="stop">Stop</button>
//         <br>
//         <div id="clips">${await generateClipsView(session.viewTextUUID)}</div>
//
//         <div id="area">
//             ${(new Date(session.viewDate)).toDateString() === (new Date()).toDateString() ?
//                     await editableTextView() :
//                     await textView(session.viewDate)}
//         </div>
// `


/**
 *
 * @returns {string} format "YYYY-MM-DD" e.g. 2024-09-05
 */
export function getYyyymmdd() {
    return (
        new Date()
    ).toISOString().substring(0, 10);
}

generateTimelineHTML(await db.timeline(getYyyymmdd()))
// autosizeTextArea.call(document.querySelector<HTMLTextAreaElement>("#textarea"))

// function getYyyymm() {
//     return (
//         new Date()
//     ).toISOString().substring(0, 7);
// }

// document.querySelector("#textarea")
//     .addEventListener('input', async function () {
//         const text = this.value
//
//         await db.updateText(text)
//
//         generateTimelineHTML(await db.timeline(getYyyymm()))
//
//         autosizeTextArea.call(this);
//     })

// document.querySelector("#textarea")
//     .addEventListener('keydown', function (e) {
//         if (e.key === "Tab") {
//             e.preventDefault()
//             e.stopPropagation()
//             const start = this.selectionStart;
//             const end = this.selectionEnd;
//             this.value = this.value.substring(0, start) + '\t' + this.value.substring(end)
//             this.selectionStart = this.selectionEnd = start + 1;
//         }
//     })

