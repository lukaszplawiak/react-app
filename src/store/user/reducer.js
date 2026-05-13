import { createSlice } from '@reduxjs/toolkit';
import { fetchUser, loginUser, logoutUser } from './thunk';

const initialState = {
  name: null,
  email: null,
  isAuth: false,
  role: null,
  status: 'bootstrapping',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'bootstrapping';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.isAuth = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.status = 'idle';
        state.isAuth = false;
        state.name = null;
        state.email = null;
        state.role = null;
        state.error = null;
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
      })
      .addCase(logoutUser.rejected, (state) => {
        state.status = 'idle';
        state.name = null;
        state.email = null;
        state.isAuth = false;
        state.role = null;
      });
  },
});

export default userSlice.reducer;