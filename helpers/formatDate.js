const moment = require("moment");

const formatDate = (value, mask = "YYYY-MM-DD") => {
  return moment(value).format(mask);
};

module.exports = { formatDate };
