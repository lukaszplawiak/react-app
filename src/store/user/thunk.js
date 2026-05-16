import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUserService,
  getUserService,
  logoutUserService,
  registerUserService,
} from '../../services';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserService();
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

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUserService(userData);
      const result = response.data;

      if (result.successful) {
        return result.user;
      }

      throw new Error(result.message || 'An error occurred while registering.');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Registration failed. Please try again.'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUserService(credentials);
      const result = response.data;

      // Session is maintained via HttpOnly cookie set by the server.
      // Token from result.result is intentionally not stored in Redux —
      // it is only used server-side for cookie-based authentication.
      if (result.successful) {
        return {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        };
      }

      throw new Error(result.message || 'An error occurred while logging in.');
    } catch (error) {
      return rejectWithValue(
        error.message || 'An error occurred while logging in.'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUserService();
      return null;
    } catch (error) {
      return rejectWithValue(
        error.message || 'An error occurred while logging out.'
      );
    }
  }
);