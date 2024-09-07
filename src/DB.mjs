import {getWordCount} from "./getWordCount.mjs";

import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import path from "node:path";
import {format, getDay, lastDayOfMonth} from "date-fns";


export class DB {
    db;

    constructor() {
        sqlite3InitModule({print: console.log, printErr: console.error})
            .then((sqlite3Static) => {
                this.db =
                    'opfs' in sqlite3Static
                        ? new sqlite3Static.oo1.OpfsDb('/mydb.sqlite3')
                        : new sqlite3Static.oo1.DB('/mydb.sqlite3', 'ct');


                this.init()
            });


        this.getDatabaseFile('/mydb.sqlite3').then(databaseFile => {
            const fileUrl = URL.createObjectURL(databaseFile);

            const a = document.createElement('a');
            a.href = fileUrl;
            a.download = 'database.sqlite3';
            a.click();
            a.remove();

            URL.revokeObjectURL(fileUrl);
        })
    }

    async getDatabaseFile(fileName) {
        const tempFileName = `backup-${ Date.now() }--${ fileName }`;
        await this.db.sql`VACUUM INTO ${ path.join('/') }/${ tempFileName }`;

        let dirHandle = await navigator.storage.getDirectory();
        for (let dirName of path)
            dirHandle = await dirHandle.getDirectoryHandle(dirName);


        const fileHandle = await dirHandle.getFileHandle(tempFileName);
        const file = await fileHandle.getFile();
        const fileBuffer = await file.arrayBuffer();
        await dirHandle.removeEntry(tempFileName);

        return new File([fileBuffer], fileName, {
            type: 'application/x-sqlite3',
        });
    }

    init() {
        this.db.exec({
            sql: `
            CREATE TABLE IF NOT EXISTS diaries (
                uuid TEXT PRIMARY KEY NOT NULL UNIQUE,
                text TEXT NOT NULL,
                date DATE NOT NULL UNIQUE,
                word_count INTEGER NOT NULL DEFAULT 0          
            )`
        })

        this.db.exec({
            sql: `
            CREATE TABLE IF NOT EXISTS audios (
                uuid TEXT PRIMARY KEY NOT NULL UNIQUE,
                audio BLOB NOT NULL UNIQUE,
                diary TEXT NOT NULL,
                FOREIGN KEY(diary) REFERENCES diaries(uuid)
            )`
        })

        this.db.exec({
            sql: `
            INSERT INTO diaries (uuid, text, date, word_count) VALUES (
                ${crypto.randomUUID()},
                ${""},
                ${format(new Date(), "yyyy-MM-dd")},
                ${0}
            )
            ON CONFLICT(date) DO NOTHING;
        `
        })
    }

    async today() {
        return await this.db.exec({sql: `SELECT * FROM diaries WHERE date = ${format(new Date(), "yyyy-MM-dd")}`})
    }

    async timeline(yyyymm) {
        const timeline = []
        const isCurrentMonth = true
        const todayDayNumber = getDay(new Date()) - 1

        const today = new Date()
        const firstDateOfMonth = format(today, 'yyyy-MM-01')
        const lastDateOfMonth = format(lastDayOfMonth(today), 'yyyy-MM-dd')
        const timelineData = await this.db.exec({sql: `SELECT date, word_count FROM diaries WHERE date >= ${firstDateOfMonth} AND date <= ${lastDateOfMonth}`})

        this._fulfillTimeline(yyyymm, timeline, isCurrentMonth, todayDayNumber, timelineData);

        return timeline
    }

    _fulfillTimeline(yyyymm, timeline, isCurrentMonth, todayDayNumber, timelineData) {
        for (let i = 0; i < yyyymm.daysInMonth; i ++) {
            timeline[i] = {
                day: i,
                word_count: 0
            };
        }

        if (isCurrentMonth) {
            for (let i = todayDayNumber; i < yyyymm.daysInMonth; i ++) {
                timeline[i].word_count = - 1;
            }
        }

        for (const {date, word_count} of timelineData) {
            const day = Temporal.PlainDate.from(date).day - 1

            timeline[timeline.findIndex((tlDay) => (
                tlDay.day === day
            ))] = {
                day,
                word_count,
                is_today: todayDayNumber === day
            }
        }
    }

    async day(yyyymmdd) {
        return await this.db.exec({sql: `SELECT * FROM diaries WHERE date = ${yyyymmdd}`})
    }

    async updateText(text) {
        await this.db.exec({sql: `UPDATE diaries SET text = ${text}, word_count = ${getWordCount(text)} WHERE date = ${format(new Date(), "yyyy-MM-dd")}`})
    }

    async insertAudio(todayUUID, audioFileName) {
        await this.db.exec({sql: `INSERT INTO audios (uuid, audio, diary) VALUES (${crypto.randomUUID()}, ${audioFileName}, ${todayUUID})`})
    }

    async getAudiosByDate(todayUUID) {
        return await this.db.exec({sql: `SELECT * FROM audios WHERE diary = ${todayUUID}`})
    }
}
