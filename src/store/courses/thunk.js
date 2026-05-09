import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCoursesService,
  deleteCourseService,
  createCourseService,
  updateCourseService,
} from '../../services';

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCoursesService();
      if (response.data.successful) {
        return response.data.result;
      }
      throw new Error('Application level request failed');
    } catch (error) {
      return rejectWithValue(
        error.message || 'An error occurred while fetching courses'
      );
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await deleteCourseService(courseId);
      if (response.data.successful) {
        return courseId;
      }
      throw new Error('Application level request failed');
    } catch (error) {
      return rejectWithValue(
        error.message || 'An error occurred while deleting the course'
      );
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (course, { rejectWithValue }) => {
    try {
      const response = await createCourseService(course);
      if (response.data.successful) {
        return response.data.result;
      }
      throw new Error('Application level request failed');
    } catch (error) {
      return rejectWithValue(
        error.message || 'An error occurred while creating the course'
      );
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async (updatedCourse, { rejectWithValue }) => {
    try {
      const response = await updateCourseService(updatedCourse);
      if (response.data.successful) {
        return response.data.result;
      }
      throw new Error('Application level request failed');
    } catch (error) {
      return rejectWithValue(
        error.message || 'An error occurred while updating the course'
      );
    }
  }
);