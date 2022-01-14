const axios = require("axios");

const STRAVA_URL = "https://www.strava.com/api/v3";

const refreshToken = async (refresh_token) => {
  const response = await axios.post(`${STRAVA_URL}/oauth/token`, {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  });
  return response.data;
};

const getActivity = async (access_token, id) => {
  return await axios
    .get(`${STRAVA_URL}/activities/${id}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    .then((response) => response.data)
    .catch((error) => error.response.data);
};

module.exports = {
  refreshToken,
  getActivity,
};
