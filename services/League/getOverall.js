const getLeague = require("./getLeague");
const getSegmentEfforts = require("./getSegmentEfforts");

async function getOverall(leagueId) {
  let classification = [];

  const league = await getLeague(leagueId);
  const points = league.points;

  function generateGeneral(data) {
    return data.filter((value, index, self) => {
      return self.findIndex((v) => v.athlete_id === value.athlete_id) === index;
    });
  }

  function addPoints(athlete_id, index, points) {
    const pointsToAdd = +points[index] || 1;

    const athletIndex = classification.findIndex(
      (item) => item.athlete_id === athlete_id
    );
    classification[athletIndex].points += pointsToAdd;
  }

  classification = league.athletes.map((athlete) => {
    return {
      athlete_id: athlete.strava_id,
      name: `${athlete.firstname} ${athlete.lastname}`,
      photo_url: athlete.photo_url,
      points: 0,
      sex: athlete.sex,
    };
  });

  const segments = league.segments.map((segment) => segment.id);

  // obtenemos la información de los esfuerzos por cada segmento
  const start_date = league.start_date;
  const end_date = league.end_date;
  const arrayDataEfforts = await Promise.all(
    segments.map((segment) =>
      getSegmentEfforts(start_date, end_date, segment, league.id)
    )
  );

  arrayDataEfforts.forEach((effortsData) => {
    const classificationEffort = generateGeneral(effortsData);
    classificationEffort.forEach((item, index) => {
      addPoints(item.athlete_id, index, points);
    });
  });

  return classification;
}

module.exports = { getOverall };
