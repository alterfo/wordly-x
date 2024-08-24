import {SQLocal} from "sqlocal";
import {dateUtils} from "./date-utils.ts";
import {Temporal} from "@js-temporal/polyfill";
import {DayData} from "./types.ts";
import {getWordCount} from "./getWordCount.ts";

export class DB {
    db: SQLocal

    constructor() {
        this.db = new SQLocal('database.sqlite3')
    }

    async init() {
        await this.db.sql`
            CREATE TABLE IF NOT EXISTS diaries (
                uuid TEXT PRIMARY KEY NOT NULL UNIQUE,
                text TEXT NOT NULL,
                date DATE NOT NULL UNIQUE,
                word_count INTEGER NOT NULL DEFAULT 0          
            )
        `
        await this.db.sql`
            CREATE TABLE IF NOT EXISTS audios (
                uuid TEXT PRIMARY KEY NOT NULL UNIQUE,
                audio BLOB NOT NULL UNIQUE,
                diary TEXT NOT NULL,
                FOREIGN KEY(diary) REFERENCES diaries(uuid)
            )
        `

        await this.db.sql`
            INSERT INTO diaries (uuid, text, date, word_count) VALUES (
                ${crypto.randomUUID()},
                ${""},
                ${dateUtils.getTodayString()},
                ${0}
            )
            ON CONFLICT(date) DO NOTHING;
        `
    }

    async today() {
        return await this.db.sql`SELECT * FROM diaries WHERE date = ${dateUtils.getTodayString()}`
    }

    async timeline(yyyymm: Temporal.PlainYearMonth) {
        const timeline: DayData[] = []
        const isCurrentMonth: boolean = dateUtils.nowInCurrentMonth(yyyymm)
        const todayDayNumber: number = Temporal.Now.plainDateISO().day - 1
        const timelineData = await this.db.sql`SELECT date, word_count FROM diaries WHERE date >= ${dateUtils.getFirstDateOfMonth(yyyymm)} AND date <= ${dateUtils.getLastDateOfMonth(yyyymm)}`

        DB.fulfillTimeline(yyyymm, timeline, isCurrentMonth, todayDayNumber, timelineData);

        return timeline
    }

    private static fulfillTimeline(yyyymm: Temporal.PlainYearMonth, timeline: DayData[], isCurrentMonth: boolean, todayDayNumber: number, timelineData: Record<string, any>[]) {
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

        for (const {date, word_count} of timelineData) {
            const day = Temporal.PlainDate.from(date).day - 1

            timeline[timeline.findIndex((tlDay) => (tlDay.day === day))] = {
                day,
                word_count,
                is_today: todayDayNumber === day
            }
        }
    }

    async day(yyyymmdd: string) {
        return await this.db.sql`SELECT * FROM diaries WHERE date = ${yyyymmdd}`
    }

    async updateText(text: string) {
        await this.db.sql`UPDATE diaries SET text = ${text}, word_count = ${getWordCount(text)} WHERE date = ${dateUtils.getTodayString()}`
    }

    async insertAudio(todayUUID: string, audioFileName: string) {
        await this.db.sql`INSERT INTO audios (uuid, audio, diary) VALUES (${crypto.randomUUID()}, ${audioFileName}, ${todayUUID})`
    }

    async getAudiosByDate(todayUUID: string) {
        return await this.db.sql`SELECT * FROM audios WHERE diary = ${todayUUID}`
    }
}
