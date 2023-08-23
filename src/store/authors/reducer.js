import {
	FETCH_AUTHORS_SUCCESS,
	FETCH_AUTHORS_FAILURE,
	CREATE_AUTHORS_SUCCESS,
	CREATE_AUTHORS_FAILURE,
} from './types';

const initialState = {
	authors: [],
	error: null,
};

export default function authorsReducer(state = initialState, action) {
	switch (action.type) {
		case FETCH_AUTHORS_SUCCESS:
			return {
				...state,
				authors: action.payload,
				error: null,
			};
		case FETCH_AUTHORS_FAILURE:
			console.error(action.error);
			return {
				...state,
				error: action.error,
			};
		case CREATE_AUTHORS_SUCCESS:
			return {
				...state,
				authors: [...state.authors, action.payload],
				error: null,
			};
		case CREATE_AUTHORS_FAILURE:
			console.error(action.error);
			return {
				...state,
				error: action.error,
			};
		default:
			return state;
	}
}
