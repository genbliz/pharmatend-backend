class DateServiceBase {
    getStartOfTheDay(date) {
        return new Date(this.getStartOfTheDay_Iso(date));
    }
    getStartOfTheDay_Iso(date) {
        if (typeof date === "string" && this.isValidFormat_YYYY_MM_DD(date)) {
            return `${date}T00:00:00.000Z`;
        }
        const dt = new Date(date);
        const datePart = this.format_YYYY_MM_DD(dt);
        return `${datePart}T00:00:00.000Z`;
    }
    getStartAndEndTheDayTurple_Iso({ fromDate, toDate }) {
        const [fromDate01, toDate01] = [fromDate, toDate].sort();
        const date01 = this.getStartOfTheDay_Iso(fromDate01);
        const date02 = this.getEndOfTheDay_Iso(toDate01);
        return [date01, date02];
    }
    orderBetweenDateStamps(dateStamps) {
        const [from, to] = dateStamps.sort();
        return [from, this.getEndOfTheDay_Iso(to)];
    }
    order_YYYY_MM_DD(dateStamps) {
        const [from, to] = dateStamps.sort();
        return [from, to];
    }
    getMinMaxFromDateStamps(dateStamps) {
        const sorted = dateStamps.sort();
        return [sorted[0], sorted.slice(-1)[0]];
    }
    getEndOfTheDay(date) {
        return new Date(this.getEndOfTheDay_Iso(date));
    }
    getEndOfTheDay_Iso(date) {
        if (typeof date === "string") {
            if (this.isValidFormat_YYYY_MM_DD(date)) {
                return `${date}T23:59:59.000Z`;
            }
            if (this.isIsoFullDateFormat(date)) {
                const date01 = date.split("T")[0];
                return `${date01}T23:59:59.000Z`;
            }
        }
        const dt = new Date(date);
        const datePart = this.format_YYYY_MM_DD(dt);
        return `${datePart}T23:59:59.000Z`;
    }
    isValidFormat_YYYY_MM_DD(dateString) {
        if (!(dateString && typeof dateString === "string")) {
            return false;
        }
        if (dateString.length !== 10) {
            return false;
        }
        const regEx = /^\d{4}-\d{2}-\d{2}$/;
        if (!regEx.test(dateString)) {
            return false;
        }
        const dateParts = dateString.split("-");
        if (dateParts?.length !== 3) {
            return false;
        }
        const [yyyy, mm, dd] = dateParts.map((dt) => parseInt(dt));
        if (!(mm >= 1 && mm <= 12)) {
            return false;
        }
        const listOfDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const isNonLeapYearMonth = mm === 1 || mm > 2;
        if (isNonLeapYearMonth) {
            if (dd > listOfDays[mm - 1]) {
                return false;
            }
        }
        else {
            let lyear = false;
            if ((!(yyyy % 4) && yyyy % 100) || !(yyyy % 400)) {
                lyear = true;
            }
            if (lyear === false && dd >= 29) {
                return false;
            }
            if (lyear === true && dd > 29) {
                return false;
            }
        }
        const d = new Date(dateString);
        const dNum = d.getTime();
        if (!dNum && dNum !== 0) {
            return false;
        }
        const check1 = d.toISOString().slice(0, 10) === dateString;
        const check2 = d.toISOString().split("T")[0] === dateString;
        return check1 && check2;
    }
    getMonthsNameArray() {
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        return monthNames;
    }
    getTimeStampVariables(date) {
        const now01 = new Date(date);
        return {
            milliseconds: this.padStart({ value: now01.getMilliseconds(), maxLength: 4, fillingValue: 0 }),
            seconds: this.padStart({ value: now01.getSeconds(), maxLength: 2, fillingValue: 0 }),
            minutes: this.padStart({ value: now01.getMinutes(), maxLength: 2, fillingValue: 0 }),
            hours: this.padStart({ value: now01.getHours(), maxLength: 2, fillingValue: 0 }),
            day: this.padStart({ value: now01.getDate(), maxLength: 2, fillingValue: 0 }),
            month: this.padStart({ value: now01.getMonth() + 1, maxLength: 2, fillingValue: 0 }),
            year: `${now01.getFullYear()}`,
        };
    }
    getLastDayOfTheMonth(date) {
        const date01 = new Date(date);
        const lastDayOfMonth = new Date(date01.getFullYear(), date01.getMonth() + 1, 0);
        return lastDayOfMonth;
    }
    getMonthName() {
        return this.getMonthsNameArray();
    }
    getMonthNameByIndex(index) {
        return this.getMonthName()[index];
    }
    getMonthNameShort() {
        return this.getMonthName().map((item) => item.slice(0, 3));
    }
    getMonthNameShortByIndex(index) {
        return this.getMonthNameShort()[index];
    }
    getWeekNames() {
        return [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
    }
    getWeekNamesShort() {
        return this.getWeekNames().map((item) => item.substr(0, 3));
    }
    isDate(date) {
        try {
            if (!date) {
                return false;
            }
            const date01 = new Date(date);
            const check0 = typeof date01.getDate !== "undefined";
            const check1 = !isNaN(Date.parse(date01.toISOString()));
            const check2 = date01 instanceof Date && !isNaN(date01.valueOf());
            const check3 = date01.getFullYear();
            if (check3) {
            }
            const check4 = !isNaN(date01.getDate());
            return check0 && check1 && check2 && check4;
        }
        catch (err) {
            return false;
        }
    }
    addYears({ date, years }) {
        const date01 = new Date(date);
        date01.setFullYear(date01.getFullYear() + years);
        return date01;
    }
    addMonths({ date, months }) {
        const date01 = new Date(date);
        date01.setMonth(date01.getMonth() + months);
        return date01;
    }
    addDays({ date, days }) {
        const date01 = new Date(date);
        date01.setDate(date01.getDate() + days);
        return date01;
    }
    addHours({ date, hours }) {
        const date01 = new Date(date);
        date01.setHours(date01.getHours() + hours);
        return date01;
    }
    addMinutes({ date, minutes }) {
        const date01 = new Date(date);
        date01.setMinutes(date01.getMinutes() + minutes);
        return date01;
    }
    addSeconds({ date, seconds }) {
        const date01 = new Date(date);
        date01.setSeconds(date01.getSeconds() + seconds);
        return date01;
    }
    addMilliseconds({ date, milliseconds }) {
        const date01 = new Date(date);
        const ms = date01.getMilliseconds() + milliseconds;
        date01.setMilliseconds(ms);
        return date01;
    }
    convertDaysToMilliseconds(days) {
        const ms = 1000 * 60 * 60 * 24 * days;
        return ms;
    }
    getDateDiffDays({ date1, date2 }) {
        const oneDay = 24 * 60 * 60 * 1000;
        const date1Val = new Date(this.getStartOfTheDay(date1)).getTime();
        const date2Val = new Date(this.getStartOfTheDay(date2)).getTime();
        const diff = Math.round(Math.abs(date2Val - date1Val)) / oneDay;
        return diff;
    }
    getDateDiffHours({ date1, date2 }) {
        const oneHour = 60 * 60 * 1000;
        const date1Val = new Date(date1).getTime();
        const date2Val = new Date(date2).getTime();
        const diff = Math.floor(Math.abs(date2Val - date1Val)) / oneHour;
        return diff;
    }
    isDatesSameYearMonth({ date1, date2 }) {
        if (this.isDate(date1) && this.isDate(date2)) {
            const date101 = new Date(date1);
            const date201 = new Date(date2);
            return date101.getFullYear() === date201.getFullYear() && date101.getMonth() === date201.getMonth();
        }
        return false;
    }
    getWeeksBetweenTwoDates({ date1, date2 }) {
        if (this.isDate(date1) && this.isDate(date2)) {
            const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
            const date101 = new Date(date1).getTime();
            const date201 = new Date(date2).getTime();
            const diff = Math.abs(date101 - date201);
            return Math.floor(diff / ONE_WEEK);
        }
        return 0;
    }
    caculateAge(birthDate) {
        if (this.isDate(birthDate)) {
            const today = new Date();
            const birthDateVal = new Date(birthDate);
            let age = today.getFullYear() - birthDateVal.getFullYear();
            const month01 = today.getMonth() - birthDateVal.getMonth();
            if (month01 < 0 || (month01 === 0 && today.getDate() < birthDateVal.getDate())) {
                age--;
            }
            return age;
        }
        return null;
    }
    padStart({ value, maxLength, fillingValue, }) {
        const val01 = `${value}`.padStart(maxLength, `${fillingValue}`.toString());
        return val01.toString().trim();
    }
    getDateTimeStampFarm(date) {
        const now01 = new Date(date);
        const monthNameShort = this.getMonthNameShortByIndex(now01.getMonth());
        const monthNameFull = this.getMonthNameByIndex(now01.getMonth());
        return {
            year: this.padStart({ value: now01.getFullYear(), maxLength: 2, fillingValue: 0 }),
            month: this.padStart({ value: now01.getMonth() + 1, maxLength: 2, fillingValue: 0 }),
            day: this.padStart({ value: now01.getDate(), maxLength: 2, fillingValue: 0 }),
            hour: this.padStart({ value: now01.getHours(), maxLength: 2, fillingValue: 0 }),
            minute: this.padStart({ value: now01.getMinutes(), maxLength: 2, fillingValue: 0 }),
            second: this.padStart({ value: now01.getSeconds(), maxLength: 2, fillingValue: 0 }),
            millisecond: this.padStart({ value: now01.getMilliseconds(), maxLength: 4, fillingValue: 0 }),
            monthNameFull,
            monthNameShort,
        };
    }
    extractIsoDateTo_YYYY_MM_DD(date) {
        if (date && typeof date === "string") {
            if (this.isValidFormat_YYYY_MM_DD(date)) {
                return date;
            }
            const datePart = date.split("T")[0];
            if (datePart && this.isValidFormat_YYYY_MM_DD(datePart)) {
                return datePart;
            }
        }
        const d = this.getDateTimeStampFarm(date);
        return [d.year, d.month, d.day].join("-");
    }
    extractIsoTimeTo_HH_MM(date) {
        if (date && typeof date === "string") {
            if (this.isValidTimeFormat_HH_MM(date)) {
                return date;
            }
            const [hh, mm] = date.split("T")[1].split(":");
            const timePart = [hh, mm].join(":");
            if (timePart && this.isValidTimeFormat_HH_MM(timePart)) {
                return timePart;
            }
        }
        throw new Error("Invalid time extract");
    }
    isValidTimeFormat_HH_MM(hh_mm) {
        if (!(hh_mm && typeof hh_mm === "string")) {
            return false;
        }
        if (!/\d{2}:\d{2}/.test(hh_mm)) {
            return false;
        }
        if (hh_mm.split(":").length !== 2) {
            return false;
        }
        const [hh, mm] = hh_mm.split(":").map((f, _, arr) => {
            return Number(f);
        });
        if (!(hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59)) {
            return false;
        }
        const joinedDate = `2021-01-01T${hh_mm}:00.000Z`;
        const d = new Date(joinedDate);
        const isValid = d?.toISOString() === joinedDate;
        if (isValid) {
            return true;
        }
        return false;
    }
    format_YYYY_MM_DD(date) {
        if (date && typeof date === "string") {
            if (this.isValidFormat_YYYY_MM_DD(date)) {
                return date;
            }
            const datePart = date.split("T")[0];
            if (datePart && this.isValidFormat_YYYY_MM_DD(datePart)) {
                return datePart;
            }
        }
        const d = this.getDateTimeStampFarm(date);
        return [d.year, d.month, d.day].join("-");
    }
    format_MM_DD(date) {
        const [_, mm, dd] = this.format_YYYY_MM_DD(date).split("-");
        return [mm, dd].join("-");
    }
    format_YYYY_MM(date) {
        const [yyyy, mm] = this.format_YYYY_MM_DD(date).split("-");
        return [yyyy, mm].join("-");
    }
    format_YYYY(date) {
        const [yyyy] = this.format_YYYY_MM_DD(date).split("-");
        return yyyy;
    }
    format_DD_MMM_YYYY(date) {
        const [yyyy, mm, dd] = this.format_YYYY_MM_DD(date).split("-");
        const mmm = this.getMonthNameShortByIndex(parseInt(mm) - 1);
        return [dd, `${mmm},`, yyyy].join(" ");
    }
    formatTime_HH_MM_AM_PM(time) {
        if (time && typeof time === "string") {
            if (this.isValidTimeFormat_HH_MM(time)) {
                const [hh, mm] = time.split(":").map((f) => parseInt(f));
                if (hh === 0) {
                    return `12 AM`;
                }
                if (hh === 12) {
                    return `${time} PM`;
                }
                if (hh < 12) {
                    return `${time} AM`;
                }
                if (hh > 12) {
                    const hhx = hh - 12;
                    const time01 = [hhx, mm].map((f) => f.toString().padStart(2, "0")).join(":");
                    return `${time01} PM`;
                }
                return time;
            }
        }
        const newDate = new Date(time);
        const time01 = newDate.toLocaleTimeString("en-US");
        const hhmm = time01.split(":").slice(0, 2).join(":");
        const ampm = time01.split(" ")[1];
        return `${hhmm} ${ampm}`;
    }
    getDatesArray_YYYY_MM_DD({ fromDate, toDate }) {
        const isDateFrom = this.isDate(fromDate);
        const isDateTo = this.isDate(toDate);
        if (!(isDateFrom && isDateTo)) {
            throw new Error("Invalid date");
        }
        const days = this.getDateDiffDays({ date1: fromDate, date2: toDate });
        if (!(days >= 0)) {
            throw new Error("Invalid day range");
        }
        const _days = days + 1;
        const datesArray = Array(_days)
            .fill(0)
            .map((_, index) => index)
            .map((add) => this.addDays({ date: fromDate, days: add }))
            .map((date) => this.format_YYYY_MM_DD(date))
            .map((datePart) => datePart);
        return Array.from(new Set(datesArray));
    }
    toEpochTime(date) {
        return Math.floor(new Date(date).getTime() / 1000.0);
    }
    fromEpochTime(epoch) {
        return new Date(epoch * 1000);
    }
    getWeekOfTheYear(date) {
        const day = new Date(date);
        const MILLISECONDS_IN_WEEK = 604800000;
        const firstDayOfWeek = 0;
        const startOfYear = new Date(day.getFullYear(), 0, 1);
        startOfYear.setDate(startOfYear.getDate() + (firstDayOfWeek - (startOfYear.getDay() % 7)));
        const dayWeek = Math.round((day.getTime() - startOfYear.getTime()) / MILLISECONDS_IN_WEEK) + 1;
        return dayWeek;
    }
    isIsoFullDateFormat(str) {
        if (!(str && typeof str === "string")) {
            return false;
        }
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) {
            return false;
        }
        const d = new Date(str);
        return d?.toISOString() === str;
    }
    new_YYYY_MM_DD() {
        return new Date().toISOString().split("T")[0];
    }
    getBusinessDatesCount(startDate, endDate) {
        let count = 0;
        const curDate = new Date(startDate);
        const endDay01 = new Date(endDate);
        while (curDate <= endDay01) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6)
                count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    }
}
export const DateService = new DateServiceBase();
//# sourceMappingURL=date-service.js.map