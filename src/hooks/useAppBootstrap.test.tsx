import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';

import authorsReducer from '../store/authors/reducer';
import coursesReducer from '../store/courses/reducer';
import enrollmentsReducer from '../store/enrollments/reducer';
import userReducer from '../store/user/reducer';
import type { UserState } from '../types';
import { useAppBootstrap } from './useAppBootstrap';

// Mock services — not thunks. Mocking thunks would strip .pending/.fulfilled/.rejected
// from createAsyncThunk results, breaking reducer's addCase() calls.
vi.mock('../services', () => ({
  getUserService: vi.fn().mockResolvedValue({
    data: { successful: true, result: { name: 'Test', email: 'test@test.com', role: 'user' } },
  }),
  loginUserService: vi.fn(),
  logoutUserService: vi.fn(),
  registerUserService: vi.fn(),
  getCoursesService: vi.fn().mockResolvedValue({ data: { successful: true, result: [] } }),
  createCourseService: vi.fn(),
  deleteCourseService: vi.fn(),
  updateCourseService: vi.fn(),
  getAuthorsService: vi.fn().mockResolvedValue({ data: { successful: true, result: [] } }),
  createAuthorService: vi.fn(),
  getEnrollmentsService: vi.fn().mockResolvedValue({ data: { successful: true, result: [] } }),
  enrollCourseService: vi.fn(),
}));

import { getCoursesService, getAuthorsService, getEnrollmentsService, getUserService } from '../services';

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

const buildWrapper =
  (store: ReturnType<typeof buildStore>) =>
  ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

describe('useAppBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchUser', () => {
    it('calls getUserService on mount regardless of auth state', async () => {
      const store = buildStore({ isAuth: false });
      renderHook(() => useAppBootstrap(), { wrapper: buildWrapper(store) });
      await vi.waitFor(() => {
        expect(vi.mocked(getUserService)).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('fetchCourses and fetchAuthors', () => {
    it('does not call getCoursesService or getAuthorsService when not authenticated', () => {
      const store = buildStore({ isAuth: false });
      renderHook(() => useAppBootstrap(), { wrapper: buildWrapper(store) });
      expect(vi.mocked(getCoursesService)).not.toHaveBeenCalled();
      expect(vi.mocked(getAuthorsService)).not.toHaveBeenCalled();
    });

    it('calls getCoursesService and getAuthorsService when authenticated', async () => {
      const store = buildStore({
        isAuth: true,
        role: 'user',
        status: 'succeeded',
      });
      renderHook(() => useAppBootstrap(), { wrapper: buildWrapper(store) });
      await vi.waitFor(() => {
        expect(vi.mocked(getCoursesService)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(getAuthorsService)).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('fetchEnrollments', () => {
    it('does not call getEnrollmentsService when not authenticated', () => {
      const store = buildStore({ isAuth: false });
      renderHook(() => useAppBootstrap(), { wrapper: buildWrapper(store) });
      expect(vi.mocked(getEnrollmentsService)).not.toHaveBeenCalled();
    });

    it('does not call getEnrollmentsService when authenticated but not admin', () => {
      const store = buildStore({
        isAuth: true,
        role: 'user',
        status: 'succeeded',
      });
      renderHook(() => useAppBootstrap(), { wrapper: buildWrapper(store) });
      expect(vi.mocked(getEnrollmentsService)).not.toHaveBeenCalled();
    });

    it('calls getEnrollmentsService when authenticated and admin', async () => {
      const store = buildStore({
        isAuth: true,
        role: 'admin',
        status: 'succeeded',
      });
      renderHook(() => useAppBootstrap(), { wrapper: buildWrapper(store) });
      await vi.waitFor(() => {
        expect(vi.mocked(getEnrollmentsService)).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('isBootstrapping', () => {
    it('returns true while fetchUser is in flight', async () => {
      // getUserService never resolves — fetchUser stays pending → bootstrapping
      vi.mocked(getUserService).mockReturnValue(new Promise(() => {}));
      const store = buildStore({ status: 'idle' });
      const { result } = renderHook(() => useAppBootstrap(), {
        wrapper: buildWrapper(store),
      });
      await vi.waitFor(() => {
        expect(result.current.isBootstrapping).toBe(true);
      });
    });

    it('returns false after fetchUser resolves successfully', async () => {
      vi.mocked(getUserService).mockResolvedValue({
        data: {
          successful: true,
          result: { name: 'Test', email: 'test@test.com', role: 'user' },
        },
      } as any);
      const store = buildStore({ status: 'idle' });
      const { result } = renderHook(() => useAppBootstrap(), {
        wrapper: buildWrapper(store),
      });
      await vi.waitFor(() => {
        expect(result.current.isBootstrapping).toBe(false);
      });
    });

    it('returns false after fetchUser rejects', async () => {
      vi.mocked(getUserService).mockRejectedValue(new Error('Unauthorized'));
      const store = buildStore({ status: 'idle' });
      const { result } = renderHook(() => useAppBootstrap(), {
        wrapper: buildWrapper(store),
      });
      await vi.waitFor(() => {
        expect(result.current.isBootstrapping).toBe(false);
      });
    });
  });
});