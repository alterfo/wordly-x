import {Temporal} from "@js-temporal/polyfill";

export const dateUtils = {
    getYYYYMMfromYYYYMMDD: (yyyymmdd) => Temporal.PlainYearMonth.from(yyyymmdd),
    getTodayString: () => Temporal.Now.plainDateISO().toString(),
    getCurrentDate: (prevDate, day) => {
        return prevDate.toPlainDate({day})
    },
    isToday: (yyyymmdd) => yyyymmdd === Temporal.Now.plainDateISO().toString(),
    nowInCurrentMonth: (yyyymm) => yyyymm.equals(Temporal.Now.plainDateISO().toPlainYearMonth()),
    getFirstDateOfMonth: (yyyymm) => yyyymm.toPlainDate({day: 1}).toString(),
    getLastDateOfMonth: (yyyymm) => yyyymm.toPlainDate({day: yyyymm.daysInMonth}).toString(),
    getMonthStringCapitalized: (yyyymm) => {
        const monthString = yyyymm // e.g. Январь
            .toLocaleString('ru-RU', {
                month: 'long',
                year: 'numeric',
                calendar: 'iso8601'
            })

        return monthString.charAt(0).toUpperCase() + monthString.slice(1) // Первую Букву Прописью, e.g. Январь
    }
};
