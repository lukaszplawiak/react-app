import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAuthorsService, createAuthorService } from '../../services';

export const fetchAuthors = createAsyncThunk(
  'authors/fetchAuthors',
  async () => {
    const response = await getAuthorsService();
    if (response.data.successful) {
      return response.data.result;
    }
    throw new Error('Application level request failed');
  }
);

export const createAuthor = createAsyncThunk(
  'authors/createAuthor',
  async (author, thunkAPI) => {
    const user = thunkAPI.getState().user;
    const response = await createAuthorService(author, user.token);
    if (response.data.successful) {
      return response.data.result;
    }
    throw new Error('Application level request failed');
  }
);
