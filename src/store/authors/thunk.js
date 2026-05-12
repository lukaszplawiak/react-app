import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAuthorsService, createAuthorService } from '../../services';

export const fetchAuthors = createAsyncThunk(
  'authors/fetchAuthors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAuthorsService();
      if (response.data.successful) {
        return response.data.result;
      }
      throw new Error('Application level request failed');
    } catch (error) {
      return rejectWithValue(
        error.message || 'An error occurred while fetching authors'
      );
    }
  }
);

export const createAuthor = createAsyncThunk(
  'authors/createAuthor',
  async (author, { rejectWithValue }) => {
    try {
      const response = await createAuthorService(author);
      if (response.data.successful) {
        return response.data.result;
      }
      throw new Error('Application level request failed');
    } catch (error) {
      return rejectWithValue(
        error.message || 'An error occurred while creating the author'
      );
    }
  }
);