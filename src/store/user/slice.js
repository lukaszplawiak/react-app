import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
	name: 'user',
	initialState: {
		name: null,
		token: null,
		email: null,
		isAuth: false,
		isAdmin: false,
		error: null,
	},
	reducers: {
		setUser: (state, action) => {
			state.name = action.payload.name;
			state.token = action.payload.token;
			state.email = action.payload.email;
			state.isAuth = action.payload.isAuth;
			state.isAdmin = action.payload.isAdmin;
		},
		setError: (state, action) => {
			state.error = action.payload;
		},
		logoutUser: (state) => {
			state.name = null;
			state.token = null;
			state.email = null;
			state.isAuth = false;
			state.isAdmin = false;
		},
	},
});

export const { setUser, setError, logoutUser } = userSlice.actions;

export default userSlice.reducer;
