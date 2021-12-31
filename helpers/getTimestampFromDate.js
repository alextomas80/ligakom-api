const getTime = require("date-fns/getTime");
const { zonedTimeToUtc, utcToZonedTime, format } = require("date-fns-tz");

const getTimestampFromDate = (date) => {
    const utcDate = zonedTimeToUtc(date, "Europe/Madrid");
    return getTime(new Date(utcDate)) / 1000;
};

module.exports = getTimestampFromDate;
