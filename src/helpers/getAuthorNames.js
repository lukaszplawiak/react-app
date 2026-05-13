import { MAX_AUTHORS_DISPLAY_LENGTH } from '../constants/validation';

const getAuthorNames = (authorIds, authors, { truncate = false } = {}) => {
  if (!authorIds?.length || !authors?.length) return '';

  const names = authorIds
    .map((id) => authors.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  if (truncate && names.length > MAX_AUTHORS_DISPLAY_LENGTH) {
    return `${names.substring(0, MAX_AUTHORS_DISPLAY_LENGTH - 3)}...`;
  }

  return names;
};

export default getAuthorNames;