import { createAsyncThunk } from '@reduxjs/toolkit';
import {
	loginUserService,
	getUserService,
	logoutUserService,
} from '../../services';

export const fetchUser = createAsyncThunk(
	'user/fetchUser',
	async (token, { rejectWithValue }) => {
		try {
			const response = await getUserService({ token });
			if (response.data.successful) {
				return response.data.result;
			}
			throw new Error('Application level request failed');
		} catch (error) {
			return rejectWithValue(
				error.message || 'An error occurred while fetching user data.'
			);
		}
	}
);

export const loginUser = createAsyncThunk(
	'user/loginUser',
	async (user, { rejectWithValue }) => {
		try {
			const response = await loginUserService(user);
			const result = response.data;

			if (result.successful && result.result) {
				var userRole = 'user';
				if (result.user.email === 'admin@email.com') {
					userRole = 'admin';
				}
				const userData = {
					name: result.user.name,
					token: result.result,
					email: result.user.email,
					isAuth: true,
					role: userRole,
				};
				localStorage.setItem('userToken', result.result);
				localStorage.setItem('userName', result.user.name);
				localStorage.setItem('userEmail', result.user.email);
				localStorage.setItem('isAuth', 'true');
				localStorage.setItem('userRole', userRole);
				return userData;
			} else {
				throw new Error(
					result.message || 'An error occurred while logging in.'
				);
			}
		} catch (error) {
			return rejectWithValue(
				error.message || 'An error occurred while logging in.'
			);
		}
	}
);

export const logoutUser = createAsyncThunk(
	'user/logoutUser',
	async ({ rejectWithValue }) => {
		try {
			await logoutUserService();

			localStorage.removeItem('userToken');
			localStorage.removeItem('userName');
			localStorage.removeItem('userEmail');
			localStorage.removeItem('isAuth');
			localStorage.removeItem('userRole');
			return null;
		} catch (error) {
			return rejectWithValue(
				error.message || 'An error occurred while logging out.'
			);
		}
	}
);
