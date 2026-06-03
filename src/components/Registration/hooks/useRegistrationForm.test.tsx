import { act } from 'react';
import type { ReactNode } from 'react';

import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { renderHook, waitFor } from '@testing-library/react';

import { registerUserService } from '../../../services';
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
import useRegistrationForm from './useRegistrationForm';

vi.mock('../../../services');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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

type HookResult = { current: ReturnType<typeof useRegistrationForm> };

const fillFields = async (
  result: HookResult,
  fields: Partial<Record<'name' | 'email' | 'password', string>>
) => {
  act(() => {
    Object.entries(fields).forEach(([name, value]) => {
      result.current.handleChange({
        target: { name, value },
      } as React.ChangeEvent<HTMLInputElement>);
    });
  });

  await waitFor(() => {
    Object.entries(fields).forEach(([name, value]) => {
      expect(
        result.current.userData[name as keyof typeof result.current.userData]
      ).toBe(value);
    });
  });
};

const submitForm = async (result: HookResult) => {
  await result.current.handleSubmit({
    preventDefault: vi.fn(),
  } as unknown as React.FormEvent);
};

describe('useRegistrationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('initializes userData with empty name, email and password', () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.userData).toEqual({
        name: '',
        email: '',
        password: '',
      });
    });

    it('initializes errors as empty object', () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.errors).toEqual({});
    });

    it('isLoading is false on init', () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleChange', () => {
    it('updates name field', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, { name: 'Jan Kowalski' });
      expect(result.current.userData.name).toBe('Jan Kowalski');
    });

    it('updates email field without touching other fields', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
      });
      expect(result.current.userData.name).toBe('Jan Kowalski');
      expect(result.current.userData.email).toBe('jan@example.com');
    });
  });

  describe('handleSubmit — validation', () => {
    it('sets name error when name is empty', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await submitForm(result);
      await waitFor(() => {
        expect(result.current.errors.name).toBe('Name is required');
      });
    });

    it('sets email error when email is empty', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, { name: 'Jan Kowalski' });
      await submitForm(result);
      await waitFor(() => {
        expect(result.current.errors.email).toBe('Email is required');
      });
    });

    it('sets email format error when email is invalid', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, { name: 'Jan Kowalski', email: 'notanemail' });
      await submitForm(result);
      await waitFor(() => {
        expect(result.current.errors.email).toBe(
          'Please enter a valid email address'
        );
      });
    });

    it('sets password error when password is empty', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
      });
      await submitForm(result);
      await waitFor(() => {
        expect(result.current.errors.password).toBe('Password is required');
      });
    });

    it('sets password length error when password is too short', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillFields(result, {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        password: 'abc',
      });
      await submitForm(result);
      await waitFor(() => {
        expect(result.current.errors.password).toBe(
          'Password must be at least 6 characters'
        );
      });
    });

    it('does not call registerUserService when validation fails', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await submitForm(result);
      expect(vi.mocked(registerUserService)).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit — success', () => {
    it('calls registerUserService with userData', async () => {
      vi.mocked(registerUserService).mockResolvedValueOnce({
        data: {
          successful: true,
          user: {
            name: 'Jan Kowalski',
            email: 'jan@example.com',
            role: 'user',
          },
        },
      } as any);

      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      await fillFields(result, {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        password: 'secret123',
      });
      await submitForm(result);

      expect(vi.mocked(registerUserService)).toHaveBeenCalledWith({
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        password: 'secret123',
      });
    });

    it('navigates to /login after successful registration', async () => {
      vi.mocked(registerUserService).mockResolvedValueOnce({
        data: {
          successful: true,
          user: { name: 'Jan', email: 'jan@example.com', role: 'user' },
        },
      } as any);

      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      await fillFields(result, {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        password: 'secret123',
      });
      await submitForm(result);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('does not navigate to /courses — registration always goes to /login', async () => {
      vi.mocked(registerUserService).mockResolvedValueOnce({
        data: {
          successful: true,
          user: { name: 'Jan', email: 'jan@example.com', role: 'user' },
        },
      } as any);

      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      await fillFields(result, {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        password: 'secret123',
      });
      await submitForm(result);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalledWith('/courses');
      });
    });
  });

  describe('handleSubmit — failure', () => {
    it('sets server error when registerUserService rejects', async () => {
      vi.mocked(registerUserService).mockRejectedValueOnce(
        new Error('Email already taken')
      );

      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      await fillFields(result, {
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        password: 'secret123',
      });
      await submitForm(result);

      await waitFor(() => {
        expect(result.current.errors.server).toBeDefined();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
