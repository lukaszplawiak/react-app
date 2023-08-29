import { getAuthorsService } from '../../services';
import {
	FETCH_AUTHORS_SUCCESS,
	FETCH_AUTHORS_FAILURE,
	CREATE_AUTHORS_SUCCESS,
} from './types';

export const fetchAuthors = () => async (dispatch) => {
	try {
		const response = await getAuthorsService();

		if (response.data.successful) {
			dispatch({
				type: FETCH_AUTHORS_SUCCESS,
				payload: response.data.result,
			});
		} else {
			dispatch({
				type: FETCH_AUTHORS_FAILURE,
				error: 'Application level request failed',
			});
		}
	} catch (error) {
		dispatch({
			type: FETCH_AUTHORS_FAILURE,
			error: error.message || 'An error occurred while fetching authors',
		});
	}
};

export const createAuthor = (author) => async (dispatch) => {
	dispatch({
		type: CREATE_AUTHORS_SUCCESS,
		payload: author,
	});
};
