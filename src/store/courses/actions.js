import { getCoursesService } from '../../services';
import {
  FETCH_COURSES_SUCCESS,
  FETCH_COURSES_FAILURE,
  DELETE_COURSES_SUCCESS,
  CREATE_COURSES_SUCCESS,
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

export const deleteCourse = (courseId) => (dispatch) => {
  dispatch({
    type: DELETE_COURSES_SUCCESS,
    payload: courseId,
  });
};

export const createCourse = (course) => async (dispatch) => {
  dispatch({
    type: CREATE_COURSES_SUCCESS,
    payload: course,
  });
};
