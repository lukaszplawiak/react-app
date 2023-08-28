import { createSlice } from '@reduxjs/toolkit';
import { fetchUser } from './thunk';

const userName = localStorage.getItem('userName');
const userToken = localStorage.getItem('userToken');
const userEmail = localStorage.getItem('userEmail');
const userIsAuth = localStorage.getItem('isAuth') === 'true';
const userRole = localStorage.getItem('userRole');

const userSlice = createSlice({
	name: 'user',
	initialState: {
		name: userName || null,
		token: userToken || null,
		email: userEmail || null,
		isAuth: userIsAuth || false,
		role: userRole || null,
		status: 'idle',
		error: null,
	},
	reducers: {
		setUser: (state, action) => {
			state.name = action.payload.name;
			state.token = action.payload.token;
			state.email = action.payload.email;
			state.isAuth = action.payload.isAuth;
			state.role = action.payload.role;
		},
		setError: (state, action) => {
			state.error = action.payload;
		},
		logoutUser: (state) => {
			Object.assign(state, {
				name: null,
				token: null,
				email: null,
				isAuth: false,
				role: null,
			});

			localStorage.clear();
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUser.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.name = action.payload.name;
				state.token = action.payload.token;
				state.email = action.payload.email;
				state.isAuth = action.payload.isAuth;
				state.role = action.payload.role;
			})
			.addCase(fetchUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			});
	},
});

export const { setUser, setError, logoutUser } = userSlice.actions;

export default userSlice.reducer;
