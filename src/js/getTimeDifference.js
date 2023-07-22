export function calculateTimeDifference(startTime, endTime) {
  const startParts = startTime.split(':');
  const endParts = endTime.split(':');

  const start = new Date();
  start.setHours(startParts[0], startParts[1], 0, 0);

  const end = new Date();
  end.setHours(endParts[0], endParts[1], 0, 0);

  const timeZoneOffset = end.getTimezoneOffset() - start.getTimezoneOffset();
  const timeDiff = end.getTime() - start.getTime() + timeZoneOffset * 60 * 1000;

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  // Add leading zero if minutes is less than 10
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  return { hours, minutes };
}
