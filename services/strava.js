const axios = require("axios");

const STRAVA_URL = "https://www.strava.com/api/v3";

const getSegmentInformation = async ({ sid, access_token }) => {
  const responseSegment = await axios.get(`${STRAVA_URL}/segments/${sid}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const {
    id,
    name,
    activity_type,
    distance,
    average_grade,
    start_latlng,
    end_latlng,
  } = responseSegment.data;

  const segment = {
    idStrava: id,
    name,
    activity_type,
    distance,
    average_grade,
    start_latlng,
    end_latlng,
  };

  return segment;
};

const getCurrentUser = async (access_token) => {
  console.log(access_token);
  const user = await axios.get(`${STRAVA_URL}/athlete`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  return user.data;
};

module.exports = {
  getSegmentInformation,
  getCurrentUser,
};
