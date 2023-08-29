import {
	FETCH_COURSES_SUCCESS,
	FETCH_COURSES_FAILURE,
	DELETE_COURSES_SUCCESS,
	DELETE_COURSES_FAILURE,
	CREATE_COURSES_SUCCESS,
	CREATE_COURSES_FAILURE,
} from './types';

const initialState = {
	courses: [],
	error: null,
};

const coursesReducer = (state = initialState, action) => {
	switch (action.type) {
		case FETCH_COURSES_SUCCESS:
			return {
				...state,
				courses: action.payload,
				error: null,
			};
		case FETCH_COURSES_FAILURE:
			return {
				...state,
				error: action.error,
			};
		case DELETE_COURSES_SUCCESS:
			return {
				...state,
				courses: state.courses.filter((course) => course.id !== action.payload),
				error: null,
			};
		case DELETE_COURSES_FAILURE:
			return {
				...state,
				error: action.error,
			};
		case CREATE_COURSES_SUCCESS:
			return {
				...state,
				courses: [...state.courses, action.payload],
				error: null,
			};
		case CREATE_COURSES_FAILURE:
			return {
				...state,
				error: action.error,
			};
		default:
			return state;
	}
};

export default coursesReducer;
