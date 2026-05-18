import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { EnrollmentsState, Enrollment } from '../../types';
import { fetchEnrollments, enrollCourse } from './thunk';

const initialState: EnrollmentsState = {
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
      .addCase(fetchEnrollments.fulfilled, (state, action: PayloadAction<Enrollment[]>) => {
        state.status = 'succeeded';
        state.enrollments = action.payload;
      })
      .addCase(fetchEnrollments.rejected, (state, action: PayloadAction<unknown>) => {
        state.status = 'failed';
        state.error = action.payload as string | null;
      })
      .addCase(enrollCourse.fulfilled, (state, action: PayloadAction<Enrollment>) => {
        state.enrollments.push(action.payload);
      });
  },
});

export default enrollmentsSlice.reducer;