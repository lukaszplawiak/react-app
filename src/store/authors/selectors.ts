import type { RootState } from '../index';

export const selectAuthors = (state: RootState) => state.authors.authors;
export const selectAuthorsStatus = (state: RootState) => state.authors.status;
export const selectAuthorsError = (state: RootState) => state.authors.error;