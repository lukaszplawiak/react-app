import { createSlice } from '@reduxjs/toolkit';
import { fetchUser, loginUser, logoutUser } from './thunk';

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
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.name = action.payload.name;
				state.token = action.payload.token;
				state.email = action.payload.email;
				state.isAuth = true;
			})
			.addCase(logoutUser.fulfilled, (state) => {
				state.status = 'succeeded';
				Object.assign(state, {
					name: null,
					token: null,
					email: null,
					isAuth: false,
					role: null,
				});
				localStorage.clear();
			});
	},
});

export const { setUser, setError } = userSlice.actions;

export default userSlice.reducer;
