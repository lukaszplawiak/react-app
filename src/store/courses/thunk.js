import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCoursesService,
  deleteCourseService,
  createCourseService,
  updateCourseService,
} from '../../services';

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async () => {
    const response = await getCoursesService();
    if (response.data.successful) {
      return response.data.result;
    }
    throw new Error('Application level request failed');
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId) => {
    const response = await deleteCourseService(courseId);
    if (response.data.successful) {
      return courseId;
    }
    throw new Error('Application level request failed');
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (course) => {
    const response = await createCourseService(course);
    if (response.data.successful) {
      return response.data.result;
    }
    throw new Error('Application level request failed');
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async (updatedCourse) => {
    const response = await updateCourseService(updatedCourse);
    if (response.data.successful) {
      return response.data.result;
    }
    throw new Error('Application level request failed');
  }
);
