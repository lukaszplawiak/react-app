import {
	getCoursesService,
	deleteCourseService,
	createCourseService,
} from '../../services';
import {
	FETCH_COURSES_SUCCESS,
	FETCH_COURSES_FAILURE,
	DELETE_COURSES_SUCCESS,
	DELETE_COURSES_FAILURE,
	CREATE_COURSES_SUCCESS,
	CREATE_COURSES_FAILURE,
} from './types';

export const fetchCourses = () => async (dispatch) => {
	try {
		const response = await getCoursesService();

		if (response.data.successful) {
			dispatch({
				type: FETCH_COURSES_SUCCESS,
				payload: response.data.result,
			});
		} else {
			dispatch({
				type: FETCH_COURSES_FAILURE,
				error: 'Application level request failed',
			});
		}
	} catch (error) {
		dispatch({
			type: FETCH_COURSES_FAILURE,
			error: error.message || 'An error occurred while fetching courses',
		});
	}
};

export const deleteCourse = (courseId) => async (dispatch) => {
	try {
		const response = await deleteCourseService(courseId);

		if (response.data.successful) {
			dispatch({
				type: DELETE_COURSES_SUCCESS,
				payload: courseId,
			});
		} else {
			dispatch({
				type: DELETE_COURSES_FAILURE,
				error: 'Application level request failed',
			});
		}
	} catch (error) {
		dispatch({
			type: DELETE_COURSES_FAILURE,
			error: error.message || 'An error occurred while deleting course',
		});
	}
};

export const createCourse = (courses) => async (dispatch) => {
	try {
		const response = await createCourseService(courses);

		if (response.data.successful) {
			dispatch({
				type: CREATE_COURSES_SUCCESS,
				payload: courses,
			});
		} else {
			dispatch({
				type: CREATE_COURSES_FAILURE,
				error: 'Application level request failed',
			});
		}
	} catch (error) {
		dispatch({
			type: CREATE_COURSES_FAILURE,
			error: error.message || 'An error occurred while creating course',
		});
	}
};
