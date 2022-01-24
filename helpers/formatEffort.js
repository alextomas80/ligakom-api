const formatEffort = (effort, league_id) => {
  const {
    id: effort_id,
    elapsed_time,
    moving_time,
    start_date,
    start_date_local,
    average_cadence,
    device_watts,
    average_watts,
    average_heartrate,
    max_heartrate,
    athlete: { id: athlete_id },
    segment: { id: segment_id },
  } = effort;

  return {
    effort_id,
    athlete_id,
    segment_id,
    elapsed_time,
    moving_time,
    start_date,
    start_date_local,
    average_cadence,
    device_watts,
    average_watts,
    average_heartrate,
    max_heartrate,
    league_id,
  };
};

module.exports = formatEffort;
