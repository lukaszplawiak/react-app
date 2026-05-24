const formatCreationDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) return '';

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
};

export default formatCreationDate;
