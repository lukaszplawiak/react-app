import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { Enrollment, EnrollmentsState } from '../../types';

import { enrollCourse, fetchEnrollments } from './thunk';

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
      .addCase(
        fetchEnrollments.fulfilled,
        (state, action: PayloadAction<Enrollment[]>) => {
          state.status = 'succeeded';
          state.enrollments = action.payload;
        }
      )
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      })
      .addCase(
        enrollCourse.fulfilled,
        (state, action: PayloadAction<Enrollment>) => {
          state.enrollments.push(action.payload);
        }
      );
  },
});

export default enrollmentsSlice.reducer;
