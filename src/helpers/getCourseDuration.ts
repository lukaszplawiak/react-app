const getCourseDuration = (duration: number | null | undefined): string => {
  const value = Number(duration);

  if (!Number.isFinite(value) || value <= 0) {
    return 'N/A';
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const totalHours = value / 60;
  const label = totalHours === 1 ? 'hour' : 'hours';

  return `${formattedHours}:${formattedMinutes} ${label}`;
};

export default getCourseDuration;
