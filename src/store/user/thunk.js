import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUserService,
  getUserService,
  logoutUserService,
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

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUserService(credentials);
      const result = response.data;

      if (result.successful && result.result) {

        return {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role
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
      // Backend czyści httpOnly cookie przez Set-Cookie z maxAge: 0
      await logoutUserService();
      return null;
    } catch (error) {
      // Nawet jeśli request się nie powiedzie, czyścimy stan Redux.
      // Cookie po stronie serwera wygaśnie samoistnie po maxAge.
      return rejectWithValue(
        error.message || 'An error occurred while logging out.'
      );
    }
  }
);