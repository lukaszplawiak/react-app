import { createSlice } from '@reduxjs/toolkit';
import { fetchUser, loginUser, logoutUser } from './thunk';

const loadUserFromStorage = () => ({
  name: localStorage.getItem('userName') || null,
  email: localStorage.getItem('userEmail') || null,
  isAuth: localStorage.getItem('isAuth') === 'true',
  role: localStorage.getItem('userRole') || null,
  status: 'idle',
  error: null,
});

const userSlice = createSlice({
  name: 'user',
  initialState: loadUserFromStorage,
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name;
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
        state.email = action.payload.email;
        state.role = action.payload.role;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.isAuth = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.name = null;
        state.email = null;
        state.isAuth = false;
        state.role = null;
        state.error = null;
      });
  },
});

export const { setUser, setError } = userSlice.actions;
export default userSlice.reducer;