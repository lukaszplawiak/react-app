import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Course } from '../../types';
import {
  getCoursesService,
  createCourseService,
  deleteCourseService,
  updateCourseService,
} from '../../services';

export const fetchCourses = createAsyncThunk<Course[], void, { rejectValue: string }>(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCoursesService();
      if (response.data.successful) {
        return response.data.result as Course[];
      }
      throw new Error('Failed to fetch courses');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses.';
      return rejectWithValue(message);
    }
  }
);

export const createCourse = createAsyncThunk<Course, Omit<Course, 'id' | 'creationDate'>, { rejectValue: string }>(
  'courses/createCourse',
  async (course, { rejectWithValue }) => {
    try {
      const response = await createCourseService(course);
      if (response.data.successful) {
        return response.data.result as Course;
      }
      throw new Error('Failed to create course');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create course.';
      return rejectWithValue(message);
    }
  }
);

export const deleteCourse = createAsyncThunk<string, string, { rejectValue: string }>(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await deleteCourseService(courseId);
      if (response.data.successful) {
        return courseId;
      }
      throw new Error('Failed to delete course');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete course.';
      return rejectWithValue(message);
    }
  }
);

export const updateCourse = createAsyncThunk<Course, Course, { rejectValue: string }>(
  'courses/updateCourse',
  async (course, { rejectWithValue }) => {
    try {
      const response = await updateCourseService(course);
      if (response.data.successful) {
        return response.data.result as Course;
      }
      throw new Error('Failed to update course');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update course.';
      return rejectWithValue(message);
    }
  }
);