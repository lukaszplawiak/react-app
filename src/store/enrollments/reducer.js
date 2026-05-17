import { createSlice } from '@reduxjs/toolkit';
import { fetchEnrollments, enrollCourse } from './thunk';

const initialState = {
  enrollments: [],
  status: 'idle',
  error: null,
};

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(enrollCourse.fulfilled, (state, action) => {
        state.enrollments.push(action.payload);
      });
  },
});

export default enrollmentsSlice.reducer;