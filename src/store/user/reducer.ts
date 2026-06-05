import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { User, UserState } from '../../types';

import { fetchUser, loginUser, logoutUser } from './thunk';

const initialState: UserState = {
  name: null,
  email: null,
  isAuth: false,
  role: null,
  status: 'idle',
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
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.isAuth = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'idle';
        state.isAuth = false;
        state.name = null;
        state.email = null;
        state.role = null;
        state.error = action.payload ?? null;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.isAuth = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.name = null;
        state.email = null;
        state.isAuth = false;
        state.role = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'idle';
        state.name = null;
        state.email = null;
        state.isAuth = false;
        state.role = null;
        state.error = action.payload ?? null;
      });
  },
});

export default userSlice.reducer;
