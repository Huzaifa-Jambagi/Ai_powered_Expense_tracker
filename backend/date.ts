import { TZDate } from "@date-fns/tz";

export const getMonthDateRange = (month: string, timezone: string) => {
    const [year, monthNumber] = month.split("-").map(Number);

    return {
        startDate: new TZDate(year, monthNumber - 1, 1, timezone),
        endDate: new TZDate(year, monthNumber, 1, timezone),
    };
};