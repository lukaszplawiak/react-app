import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  getUserService,
  loginUserService,
  logoutUserService,
  registerUserService,
} from '../../services';
import type { User } from '../../types';

export const fetchUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserService();
      if (response.data.successful) {
        return response.data.result as User;
      }
      throw new Error('Application level request failed');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An error occurred while fetching user data.';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('user/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await registerUserService(userData);
    const result = response.data;

    if (result.successful) {
      return result.user;
    }

    throw new Error('An error occurred while registering.');
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.';
    return rejectWithValue(message);
  }
});

export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>('user/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginUserService(credentials);
    const result = response.data;

    if (result.successful) {
      return result.user;
    }

    throw new Error('An error occurred while logging in.');
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An error occurred while logging in.';
    return rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUserService();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An error occurred while logging out.';
      return rejectWithValue(message);
    }
  }
);
