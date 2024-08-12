import {Temporal} from "@js-temporal/polyfill";

export const dateUtils = {
    getYYYYMMfromYYYYMMDD: (yyyymmdd: string) => Temporal.PlainYearMonth.from(yyyymmdd),
    getTodayString: () => Temporal.Now.plainDateISO().toString(),
    isToday: (yyyymmdd: string) => yyyymmdd === Temporal.Now.plainDateISO().toString(),
    nowInCurrentMonth: (yyyymm: Temporal.PlainYearMonth) => yyyymm.equals(Temporal.Now.plainDateISO().toPlainYearMonth()),
    getFirstDateOfMonth: (yyyymm: Temporal.PlainYearMonth) => yyyymm.toPlainDate({day: 1}).toString(),
    getLastDateOfMonth: (yyyymm: Temporal.PlainYearMonth) => yyyymm.toPlainDate({day: yyyymm.daysInMonth}).toString(),
    getMonthStringCapitalized: (yyyymm: Temporal.PlainYearMonth) => {
        const monthString = yyyymm // e.g. Январь
            .toLocaleString('ru-RU', {
                month: 'long',
                year: 'numeric',
                calendar: 'iso8601'
            })

        return monthString.charAt(0).toUpperCase() + monthString.slice(1)
    }
}
