import { createAsyncThunk } from '@reduxjs/toolkit';
import {
	getCoursesService,
	deleteCourseService,
	createCourseService,
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
	async (courseId, thunkAPI) => {
		const user = thunkAPI.getState().user;
		const response = await deleteCourseService(courseId, user.token);
		if (response.data.successful) {
			return courseId;
		}
		throw new Error('Application level request failed');
	}
);

export const createCourse = createAsyncThunk(
	'courses/createCourse',
	async (course, thunkAPI) => {
		const user = thunkAPI.getState().user;
		const response = await createCourseService(course, user.token);
		if (response.data.successful) {
			return response.data.result;
		}
		throw new Error('Application level request failed');
	}
);
