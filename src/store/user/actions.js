import { loginUserService } from '../../services';
import { setUser, setError, logoutUser } from '../../store/user/slice';

export const loginUser = (user) => async (dispatch) => {
	try {
		const response = await loginUserService(user);
		const result = response.data;

		if (result.successful && result.result) {
			dispatch(
				setUser({
					name: result.user.name,
					token: result.result,
					email: result.user.email,
					isAuth: true,
					isAdmin: result.user.email === 'admin@email.com',
				})
			);
			localStorage.setItem('userToken', result.result);
			localStorage.setItem('userName', result.user.name);
			localStorage.setItem('email', result.user.email);
		} else {
			throw new Error(result.message || 'An error occurred while logging in.');
		}
	} catch (error) {
		dispatch(
			setError({
				server: error.message || 'An error occurred while logging in.',
			})
		);
	}
};

export const logout = () => async (dispatch) => {
	localStorage.removeItem('userToken');
	localStorage.removeItem('userName');
	localStorage.removeItem('email');
	dispatch(logoutUser());
};
