import { renderHook, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import userReducer from '../../../store/user/reducer';
import coursesReducer from '../../../store/courses/reducer';
import authorsReducer from '../../../store/authors/reducer';
import enrollmentsReducer from '../../../store/enrollments/reducer';
import useLoginForm from './useLoginForm';
import { loginUserService } from '../../../services';
import type { UserState, CoursesState, AuthorsState, EnrollmentsState } from '../../../types';

vi.mock('../../../services');

const mockNavigate = vi.fn();
let mockSearch = '';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: mockSearch, pathname: '/login' }),
  };
});

const buildStore = () =>
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
      } as UserState,
      courses: { courses: [], status: 'idle', error: null } as CoursesState,
      authors: { authors: [], status: 'idle', error: null } as AuthorsState,
      enrollments: { enrollments: [], status: 'idle', error: null } as EnrollmentsState,
    },
  });

const buildWrapper = (store: ReturnType<typeof buildStore>) =>
  ({ children }: { children: ReactNode }) =>
    <Provider store={store}>{children}</Provider>;

const fillAndSubmit = async (
  result: ReturnType<typeof renderHook<ReturnType<typeof useLoginForm>, void>>['result']
) => {
  result.current.handleChange({
    target: { name: 'email', value: 'jan@example.com' },
  } as React.ChangeEvent<HTMLInputElement>);
  await waitFor(() => {
    expect(result.current.formData.email).toBe('jan@example.com');
  });

  result.current.handleChange({
    target: { name: 'password', value: 'secret123' },
  } as React.ChangeEvent<HTMLInputElement>);
  await waitFor(() => {
    expect(result.current.formData.password).toBe('secret123');
  });

  await result.current.handleSubmit({
    preventDefault: vi.fn(),
  } as unknown as React.FormEvent);
};

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch = '';
  });

  describe('initial state', () => {
    it('initializes formData with empty email and password', () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.formData).toEqual({ email: '', password: '' });
    });

    it('isLoading is false on init', () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleChange', () => {
    it('updates email field', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' },
      } as React.ChangeEvent<HTMLInputElement>);

      await waitFor(() => {
        expect(result.current.formData.email).toBe('test@example.com');
      });
    });
  });

  describe('handleSubmit — validation', () => {
    it('sets email error when email is empty', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);

      await waitFor(() => {
        expect(result.current.errors.email).toBe('Email is required');
      });
    });

    it('sets email format error when email is invalid', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      result.current.handleChange({
        target: { name: 'email', value: 'notanemail' },
      } as React.ChangeEvent<HTMLInputElement>);

      await waitFor(() => {
        expect(result.current.formData.email).toBe('notanemail');
      });

      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);

      await waitFor(() => {
        expect(result.current.errors.email).toBe('Please enter a valid email address');
      });
    });
  });

  describe('handleSubmit — success', () => {
    beforeEach(() => {
      vi.mocked(loginUserService).mockResolvedValue({
        data: {
          successful: true,
          result: 'token',
          user: { name: 'Jan', email: 'jan@example.com', role: 'user' },
        },
      } as any);
    });

    it('navigates to /courses by default when no redirect param', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/courses', { replace: true });
      });
    });

    it('falls back to /courses when redirect is an external URL', async () => {
      mockSearch = '?redirect=https://evil.com';
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/courses', { replace: true });
      });
    });

    it('falls back to /courses when redirect contains protocol-relative URL', async () => {
      mockSearch = '?redirect=//evil.com';
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/courses', { replace: true });
      });
    });
  });

  describe('handleSubmit — failure', () => {
    it('sets server error when loginUserService rejects', async () => {
      vi.mocked(loginUserService).mockRejectedValueOnce(
        new Error('Invalid credentials')
      );
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      await waitFor(() => {
        expect(result.current.errors.server).toBeDefined();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});