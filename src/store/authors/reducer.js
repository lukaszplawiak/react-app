import { createSlice } from '@reduxjs/toolkit';
import { fetchAuthors, createAuthor } from './thunk';

const authorsSlice = createSlice({
  name: 'authors',
  initialState: {
    authors: [],
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authors = action.payload;
        state.error = null;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createAuthor.fulfilled, (state, action) => {
        state.authors.push(action.payload);
        state.error = null;
      })
      .addCase(createAuthor.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default authorsSlice.reducer;