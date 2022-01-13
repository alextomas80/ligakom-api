const axios = require("axios");
const { formatDate } = require("../helpers/isDate");

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
  const user = await axios.get(`${STRAVA_URL}/athlete`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  return user.data;
};

const refreshToken = async (refresh_token) => {
  const response = await axios.post(`${STRAVA_URL}/oauth/token`, {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token,
  });
  return response.data;
};

const getSegmentEfforts = async (
  access_token,
  segments,
  startDate,
  endDate
) => {
  const efforts = await Promise.all(
    segments.map(async (segment) => {
      const mockedDate = "2021-09-01";

      const startDateParam = `&start_date_local=${mockedDate}`;
      const endDateParam = `&end_date_local=${formatDate(endDate)}`;
      console.log(access_token);
      const effort = await axios.get(
        `${STRAVA_URL}/segment_efforts?segment_id=${segment}}${startDateParam}${endDateParam}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      return effort.data;
    })
  );
  return efforts;
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
  getSegmentInformation,
  getCurrentUser,
  refreshToken,
  getSegmentEfforts,
  getActivity,
};
