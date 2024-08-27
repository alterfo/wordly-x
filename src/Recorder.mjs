import {Temporal} from "@js-temporal/polyfill";

export class Recorder {
    soundClips
    startButton
    stopButton
    mediaRecorder
    writableFileStream

    chunks = [];
    clipName = ""

    constructor({soundClips, startButton, stopButton}) {
        this.soundClips = soundClips
        this.startButton = startButton
        this.stopButton = stopButton

        this.startButton.onclick = this.startButtonClick();

        this.stopButton.onclick = this.stopButtonClick();

        this.initAudioStream().then(() => {
            this.mediaRecorder.onstop = this.onRecorderStop(this.soundClips)
        })
    }

    onRecorderStop(soundClips) {
        return async () => {
            const blob = new Blob(this.chunks, {type: "audio/ogg; codecs=opus"});
            this.generateClipsContainer(soundClips, blob);
            this.chunks = [];
            window.dispatchEvent(new CustomEvent("audio-saved", {
                detail: {
                    clipName: this.clipName
                }
            }))
            await this.writableFileStream.close();
        };
    }

    generateClipsContainer(soundClips, blob) {
        const clipContainer = document.createElement("article");
        const clipLabel = document.createElement("span");
        const audio = document.createElement("audio");
        const deleteButton = document.createElement("button");

        clipContainer.classList.add("clip");
        audio.setAttribute("controls", "");
        deleteButton.textContent = "🗑";
        clipLabel.textContent = this.clipName

        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        soundClips.appendChild(clipContainer);

        audio.src = window.URL.createObjectURL(blob);
    }

    startButtonClick() {
        return async () => {
            if (this.mediaRecorder) {
                // this.mediaRecorder.start(300) // save every 300ms in buffer memory
                this.mediaRecorder.start() // save only when Stop is clicked
                this.startButton.style.background = "red";
                this.startButton.style.color = "black";

                await this.initWritableFileStream()
            }
        };
    }

    stopButtonClick() {
        return () => {
            if (this.mediaRecorder) {
                this.mediaRecorder.stop();
                console.log(this.mediaRecorder.state);
                console.log("recorder stopped");
                this.startButton.style.background = "";
                this.startButton.style.color = "";
            }
        };
    }

    async initWritableFileStream() {
        const opfsRoot = await navigator.storage.getDirectory();
        const fileHandle = await opfsRoot
            .getFileHandle(this.generateClipName(), {create: true});
        this.writableFileStream = await fileHandle.createWritable();
    }

    generateClipName() {
        this.clipName = Recorder.getTodayString() +"---" + crypto.randomUUID().toString();
        return this.clipName
    }

    static getTodayString() {
        return Temporal.Now.plainDate('iso8601').toString();
    }

    async initAudioStream() {
        const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true
            }
        });
        this.mediaRecorder = new MediaRecorder(audioStream)

        this.mediaRecorder.ondataavailable = async ({data}) => {
            this.chunks.push(data);
            await this.writableFileStream.write(data);
        };
    }
}


