import { createSlice } from '@reduxjs/toolkit';
import { fetchCourses, deleteCourse, createCourse } from '../courses/thunk';

const coursesSlice = createSlice({
	name: 'courses',
	initialState: { courses: [], error: null },
	extraReducers: (builder) => {
		builder
			.addCase(fetchCourses.fulfilled, (state, action) => {
				state.courses = action.payload;
				state.error = null;
			})
			.addCase(fetchCourses.rejected, (state, action) => {
				state.error =
					action.error.message || 'An error occurred while fetching courses';
			})
			.addCase(deleteCourse.fulfilled, (state, action) => {
				state.courses = state.courses.filter(
					(course) => course.id !== action.payload
				);
				state.error = null;
			})
			.addCase(deleteCourse.rejected, (state, action) => {
				state.error =
					action.error.message || 'An error occurred while deleting the course';
			})
			.addCase(createCourse.fulfilled, (state, action) => {
				state.courses.push(action.payload);
				state.error = null;
			});
	},
});

export default coursesSlice.reducer;
