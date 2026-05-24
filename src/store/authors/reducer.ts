import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { Author, AuthorsState } from '../../types';

import { createAuthor, fetchAuthors } from './thunk';

const initialState: AuthorsState = {
  authors: [],
  status: 'idle',
  error: null,
};

const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchAuthors.fulfilled,
        (state, action: PayloadAction<Author[]>) => {
          state.status = 'succeeded';
          state.authors = action.payload;
        }
      )
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      })
      .addCase(
        createAuthor.fulfilled,
        (state, action: PayloadAction<Author>) => {
          state.authors.push(action.payload);
        }
      )
      .addCase(createAuthor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      });
  },
});

export default authorsSlice.reducer;
