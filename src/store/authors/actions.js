import { getAuthorsService, createAuthorService } from '../../services';
import {
	FETCH_AUTHORS_SUCCESS,
	FETCH_AUTHORS_FAILURE,
	CREATE_AUTHORS_SUCCESS,
	CREATE_AUTHORS_FAILURE,
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

export const createAuthor = (author, token) => async (dispatch) => {
	try {
		const response = await createAuthorService(author, token);

		if (response.data.successful) {
			dispatch({
				type: CREATE_AUTHORS_SUCCESS,
				payload: response.data.result,
			});
		} else {
			dispatch({
				type: CREATE_AUTHORS_FAILURE,
				error: 'Application level request failed',
			});
		}
	} catch (error) {
		dispatch({
			type: CREATE_AUTHORS_FAILURE,
			error: error.message || 'An error occurred while creating author',
		});
	}
};
