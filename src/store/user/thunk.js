import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUserService,
  getUserService,
  logoutUserService,
} from '../../services';

const LS_KEYS = {
  token: 'userToken',
  name: 'userName',
  email: 'userEmail',
  isAuth: 'isAuth',
  role: 'userRole',
};

const persistUserToStorage = (userData) => {
  localStorage.setItem(LS_KEYS.token, userData.token);
  localStorage.setItem(LS_KEYS.name, userData.name);
  localStorage.setItem(LS_KEYS.email, userData.email);
  localStorage.setItem(LS_KEYS.isAuth, 'true');
  localStorage.setItem(LS_KEYS.role, userData.role);
};

const clearUserFromStorage = () => {
  Object.values(LS_KEYS).forEach((key) => localStorage.removeItem(key));
};

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
        // NOTE: the role should come from the backend (result.user.role).
        // The current backend mock does not return it yet, so for now
        // we keep the fallback. Once the backend starts returning the role,
        // it will be enough to remove this fallback — one place, one change.
        const role = result.user.role || 'user';

        const userData = {
          name: result.user.name,
          token: result.result,
          email: result.user.email,
          isAuth: true,
          role,
        };

        persistUserToStorage(userData);
        return userData;
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
      clearUserFromStorage();
      return null;
    } catch (error) {
      clearUserFromStorage();
      return rejectWithValue(
        error.message || 'An error occurred while logging out.'
      );
    }
  }
);