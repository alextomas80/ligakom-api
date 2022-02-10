const axios = require("axios");

const sendNotification = async (messages) => {
  console.log("messages", messages);
  try {
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      messages
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

module.exports = sendNotification;
