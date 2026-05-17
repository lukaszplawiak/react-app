import { createAsyncThunk } from '@reduxjs/toolkit';
import { enrollCourseService, getEnrollmentsService } from '../../services';

export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getEnrollmentsService();
      if (response.data.successful) {
        return response.data.result;
      }
      throw new Error('Failed to fetch enrollments');
    } catch (error) {
      return rejectWithValue(
        error.message || 'Failed to fetch enrollments.'
      );
    }
  }
);

export const enrollCourse = createAsyncThunk(
  'enrollments/enrollCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await enrollCourseService(courseId);
      if (response.data.successful) {
        return response.data.result;
      }
      throw new Error('Failed to enroll in course');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.errors?.[0] ||
          error.message ||
          'Failed to enroll in course.'
      );
    }
  }
);