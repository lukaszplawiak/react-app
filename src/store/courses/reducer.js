import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCourses,
  deleteCourse,
  createCourse,
  updateCourse,
} from './thunk';

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(
          (course) => course.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.push(action.payload);
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(
          (course) => course.id === action.payload.id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default coursesSlice.reducer;