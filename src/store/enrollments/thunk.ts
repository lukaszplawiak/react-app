import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Enrollment } from '../../types';
import { enrollCourseService, getEnrollmentsService } from '../../services';

export const fetchEnrollments = createAsyncThunk<Enrollment[], void, { rejectValue: string }>(
  'enrollments/fetchEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getEnrollmentsService();
      if (response.data.successful) {
        return response.data.result as Enrollment[];
      }
      throw new Error('Failed to fetch enrollments');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch enrollments.';
      return rejectWithValue(message);
    }
  }
);

export const enrollCourse = createAsyncThunk<Enrollment, string, { rejectValue: string }>(
  'enrollments/enrollCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await enrollCourseService(courseId);
      if (response.data.successful) {
        return response.data.result as Enrollment;
      }
      throw new Error('Failed to enroll in course');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to enroll in course.';
      return rejectWithValue(message);
    }
  }
);