const { format } = require("date-fns");

const getDateFromTimestamp = (timestamp) => {
    return format(+timestamp * 1000, "yyyy-MM-dd");
};

module.exports = getDateFromTimestamp;
