import { configureStore } from '@reduxjs/toolkit';

import {
  getUserService,
  loginUserService,
  logoutUserService,
  registerUserService,
} from '../../services';
import type { User, UserState } from '../../types';

import authorsReducer from '../authors/reducer';
import coursesReducer from '../courses/reducer';
import enrollmentsReducer from '../enrollments/reducer';
import userReducer from './reducer';
import { fetchUser, loginUser, logoutUser, registerUser } from './thunk';

vi.mock('../../services');

const mockedGetUser = vi.mocked(getUserService);
const mockedLoginUser = vi.mocked(loginUserService);
const mockedLogoutUser = vi.mocked(logoutUserService);
const mockedRegisterUser = vi.mocked(registerUserService);

const sampleUser: User = {
  name: 'Jan Kowalski',
  email: 'jan@test.com',
  role: 'user',
};

const buildStore = (userState: Partial<UserState> = {}) =>
  configureStore({
    reducer: {
      user: userReducer,
      courses: coursesReducer,
      authors: authorsReducer,
      enrollments: enrollmentsReducer,
    },
    preloadedState: {
      user: {
        isAuth: false,
        role: null,
        name: null,
        email: null,
        status: 'idle',
        error: null,
        ...userState,
      } as UserState,
    },
  });

describe('User Thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchUser', () => {
    it('populates user data and sets isAuth on success', async () => {
      mockedGetUser.mockResolvedValueOnce({
        data: { successful: true, result: sampleUser },
      } as any);

      const store = buildStore();
      await store.dispatch(fetchUser());

      const state = store.getState().user;
      expect(state.isAuth).toBe(true);
      expect(state.name).toBe('Jan Kowalski');
      expect(state.email).toBe('jan@test.com');
      expect(state.status).toBe('succeeded');
    });

    it('dispatches rejected when successful flag is false', async () => {
      mockedGetUser.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      await store.dispatch(fetchUser());

      const state = store.getState().user;
      expect(state.isAuth).toBe(false);
      expect(state.status).toBe('idle');
    });

    it('dispatches rejected on service failure', async () => {
      mockedGetUser.mockRejectedValueOnce(new Error('Unauthorized'));

      const store = buildStore();
      await store.dispatch(fetchUser());

      const state = store.getState().user;
      expect(state.isAuth).toBe(false);
      expect(state.error).toBe('Unauthorized');
    });

    it('sets error to fallback message when non-Error is thrown', async () => {
      mockedGetUser.mockRejectedValueOnce('string error');

      const store = buildStore();
      await store.dispatch(fetchUser());

      expect(store.getState().user.error).toBe(
        'An error occurred while fetching user data.'
      );
    });
  });

  describe('loginUser', () => {
    it('populates user data and sets isAuth on success', async () => {
      mockedLoginUser.mockResolvedValueOnce({
        data: { successful: true, user: sampleUser },
      } as any);

      const store = buildStore();
      await store.dispatch(
        loginUser({ email: 'jan@test.com', password: 'secret' })
      );

      const state = store.getState().user;
      expect(state.isAuth).toBe(true);
      expect(state.name).toBe('Jan Kowalski');
      expect(state.status).toBe('succeeded');
    });

    it('dispatches rejected when successful flag is false', async () => {
      mockedLoginUser.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      await store.dispatch(
        loginUser({ email: 'jan@test.com', password: 'wrong' })
      );

      const state = store.getState().user;
      expect(state.isAuth).toBe(false);
      expect(state.status).toBe('failed');
    });

    it('dispatches rejected on service failure', async () => {
      mockedLoginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

      const store = buildStore();
      await store.dispatch(
        loginUser({ email: 'jan@test.com', password: 'wrong' })
      );

      const state = store.getState().user;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Invalid credentials');
    });

    it('passes credentials to service', async () => {
      mockedLoginUser.mockResolvedValueOnce({
        data: { successful: true, user: sampleUser },
      } as any);

      const store = buildStore();
      await store.dispatch(
        loginUser({ email: 'jan@test.com', password: 'secret' })
      );

      expect(mockedLoginUser).toHaveBeenCalledWith({
        email: 'jan@test.com',
        password: 'secret',
      });
    });
  });

  describe('logoutUser', () => {
    it('resets user state on success', async () => {
      mockedLogoutUser.mockResolvedValueOnce(undefined as any);

      const store = buildStore({
        isAuth: true,
        name: 'Jan Kowalski',
        email: 'jan@test.com',
        role: 'user',
        status: 'succeeded',
      });
      await store.dispatch(logoutUser());

      const state = store.getState().user;
      expect(state.isAuth).toBe(false);
      expect(state.name).toBeNull();
      expect(state.role).toBeNull();
      expect(state.status).toBe('idle');
    });

    it('dispatches rejected on service failure', async () => {
      mockedLogoutUser.mockRejectedValueOnce(new Error('Logout failed'));

      const store = buildStore({
        isAuth: true,
        role: 'user',
        status: 'succeeded',
      });
      await store.dispatch(logoutUser());

      const state = store.getState().user;
      expect(state.isAuth).toBe(false);
      expect(state.error).toBe('Logout failed');
    });
  });

  describe('registerUser', () => {
    it('returns fulfilled action with user on success', async () => {
      mockedRegisterUser.mockResolvedValueOnce({
        data: { successful: true, user: sampleUser },
      } as any);

      const store = buildStore();
      const result = await store.dispatch(
        registerUser({ name: 'Jan', email: 'jan@test.com', password: 'secret' })
      );

      expect(registerUser.fulfilled.match(result)).toBe(true);
    });

    it('returns rejected action when successful flag is false', async () => {
      mockedRegisterUser.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      const result = await store.dispatch(
        registerUser({ name: 'Jan', email: 'jan@test.com', password: 'secret' })
      );

      expect(registerUser.rejected.match(result)).toBe(true);
    });

    it('returns rejected action on service failure', async () => {
      mockedRegisterUser.mockRejectedValueOnce(
        new Error('Email already taken')
      );

      const store = buildStore();
      const result = await store.dispatch(
        registerUser({ name: 'Jan', email: 'jan@test.com', password: 'secret' })
      );

      expect(registerUser.rejected.match(result)).toBe(true);
      expect(result.payload).toBe('Email already taken');
    });

    it('passes user data to service', async () => {
      mockedRegisterUser.mockResolvedValueOnce({
        data: { successful: true, user: sampleUser },
      } as any);

      const store = buildStore();
      await store.dispatch(
        registerUser({ name: 'Jan', email: 'jan@test.com', password: 'secret' })
      );

      expect(mockedRegisterUser).toHaveBeenCalledWith({
        name: 'Jan',
        email: 'jan@test.com',
        password: 'secret',
      });
    });
  });
});
