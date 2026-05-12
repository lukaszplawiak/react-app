const DATE_FORMAT_OPTIONS = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
};

const formatCreationDate = (date) => {
  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-GB', DATE_FORMAT_OPTIONS).format(parsed);
};

export default formatCreationDate;