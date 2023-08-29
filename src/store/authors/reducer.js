import { createSlice } from '@reduxjs/toolkit';
import { fetchAuthors, createAuthor } from './thunk';

const authorsSlice = createSlice({
	name: 'authors',
	initialState: { authors: [], error: null },
	extraReducers: (builder) => {
		builder
			.addCase(fetchAuthors.fulfilled, (state, action) => {
				state.authors = action.payload;
				state.error = null;
			})
			.addCase(fetchAuthors.rejected, (state, action) => {
				state.error =
					action.error.message || 'An error occurred while fetching authors';
			})
			.addCase(createAuthor.fulfilled, (state, action) => {
				state.authors.push(action.payload);
			})
			.addCase(createAuthor.rejected, (state, action) => {
				state.error = action.error.message || 'Failed to create author';
			});
	},
});

export default authorsSlice.reducer;
