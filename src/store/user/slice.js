import { createSlice } from '@reduxjs/toolkit';

const userName = localStorage.getItem('userName');
const userToken = localStorage.getItem('userToken');
const userEmail = localStorage.getItem('userEmail');
const userIsAuth = localStorage.getItem('isAuth') === 'true';
const userIsAdmin = localStorage.getItem('isAdmin') === 'true';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    name: userName || null,
    token: userToken || null,
    email: userEmail || null,
    isAuth: userIsAuth || false,
    isAdmin: userIsAdmin || false,
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
