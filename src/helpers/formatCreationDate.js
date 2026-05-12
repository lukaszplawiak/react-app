const DATE_FORMAT_OPTIONS = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
};

const formatCreationDate = (date) => {
  if (date === null || date === undefined) {
    return 'Invalid date';
  }

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    return 'Invalid date';
  }

  const parts = new Intl.DateTimeFormat('en-GB', DATE_FORMAT_OPTIONS)
    .formatToParts(parsed)
    .reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.day}.${parts.month}.${parts.year}`;
};

export default formatCreationDate;