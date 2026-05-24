import type { ReactNode } from 'react';

import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { renderHook, waitFor } from '@testing-library/react';

import { loginUserService } from '../../../services';
import authorsReducer from '../../../store/authors/reducer';
import coursesReducer from '../../../store/courses/reducer';
import enrollmentsReducer from '../../../store/enrollments/reducer';
import userReducer from '../../../store/user/reducer';
import type {
  AuthorsState,
  CoursesState,
  EnrollmentsState,
  UserState,
} from '../../../types';
import useLoginForm from './useLoginForm';

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
      enrollments: {
        enrollments: [],
        status: 'idle',
        error: null,
      } as EnrollmentsState,
    },
  });

const buildWrapper =
  (store: ReturnType<typeof buildStore>) =>
  ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

type HookResult = { current: ReturnType<typeof useLoginForm> };

const fillFields = async (
  result: HookResult,
  fields: Partial<Record<'email' | 'password', string>>
) => {
  Object.entries(fields).forEach(([name, value]) => {
    result.current.handleChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement>);
  });

  await waitFor(() => {
    Object.entries(fields).forEach(([name, value]) => {
      expect(
        result.current.formData[name as keyof typeof result.current.formData]
      ).toBe(value);
    });
  });
};

const fillAndSubmit = async (result: HookResult) => {
  await fillFields(result, {
    email: 'jan@example.com',
    password: 'secret123',
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

    it('initializes errors as empty object', () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.errors).toEqual({});
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
      await fillFields(result, { email: 'test@example.com' });
      expect(result.current.formData.email).toBe('test@example.com');
    });

    it('updates password field', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, { password: 'secret123' });
      expect(result.current.formData.password).toBe('secret123');
    });

    it('does not overwrite other fields when updating one', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, {
        email: 'test@example.com',
        password: 'secret123',
      });
      expect(result.current.formData.email).toBe('test@example.com');
      expect(result.current.formData.password).toBe('secret123');
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
      await fillFields(result, { email: 'notanemail' });
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
      await waitFor(() => {
        expect(result.current.errors.email).toBe(
          'Please enter a valid email address'
        );
      });
    });

    it('sets password error when password is empty', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, { email: 'test@example.com' });
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
      await waitFor(() => {
        expect(result.current.errors.password).toBe('Password is required');
      });
    });

    it('does not call loginUserService when validation fails', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
      expect(vi.mocked(loginUserService)).not.toHaveBeenCalled();
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
        expect(mockNavigate).toHaveBeenCalledWith('/courses', {
          replace: true,
        });
      });
    });

    it('navigates to safe relative redirect path from query string', async () => {
      mockSearch = '?redirect=/courses/add';
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/courses/add', {
          replace: true,
        });
      });
    });

    it('falls back to /courses when redirect is an external URL', async () => {
      mockSearch = '?redirect=https://evil.com';
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/courses', {
          replace: true,
        });
      });
    });

    it('falls back to /courses when redirect contains protocol-relative URL', async () => {
      mockSearch = '?redirect=//evil.com';
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/courses', {
          replace: true,
        });
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
