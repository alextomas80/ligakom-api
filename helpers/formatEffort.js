const formatEffort = (effort) => {
  const {
    id,
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
    id,
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
  };
};

module.exports = formatEffort;
