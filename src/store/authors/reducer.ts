import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthorsState, Author } from '../../types';
import { fetchAuthors, createAuthor } from './thunk';

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
      .addCase(fetchAuthors.fulfilled, (state, action: PayloadAction<Author[]>) => {
        state.status = 'succeeded';
        state.authors = action.payload;
      })
      .addCase(fetchAuthors.rejected, (state, action: PayloadAction<unknown>) => {
        state.status = 'failed';
        state.error = action.payload as string | null;
      })
      .addCase(createAuthor.fulfilled, (state, action: PayloadAction<Author>) => {
        state.authors.push(action.payload);
      })
      .addCase(createAuthor.rejected, (state, action: PayloadAction<unknown>) => {
        state.status = 'failed';
        state.error = action.payload as string | null;
      });
  },
});

export default authorsSlice.reducer;