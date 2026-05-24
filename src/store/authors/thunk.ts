import { createAsyncThunk } from '@reduxjs/toolkit';

import { createAuthorService, getAuthorsService } from '../../services';
import type { Author } from '../../types';

export const fetchAuthors = createAsyncThunk<
  Author[],
  void,
  { rejectValue: string }
>('authors/fetchAuthors', async (_, { rejectWithValue }) => {
  try {
    const response = await getAuthorsService();
    if (response.data.successful) {
      return response.data.result as Author[];
    }
    throw new Error('Failed to fetch authors');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch authors.';
    return rejectWithValue(message);
  }
});

export const createAuthor = createAsyncThunk<
  Author,
  { name: string },
  { rejectValue: string }
>('authors/createAuthor', async (author, { rejectWithValue }) => {
  try {
    const response = await createAuthorService(author);
    if (response.data.successful) {
      return response.data.result as Author;
    }
    throw new Error('Failed to create author');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create author.';
    return rejectWithValue(message);
  }
});
