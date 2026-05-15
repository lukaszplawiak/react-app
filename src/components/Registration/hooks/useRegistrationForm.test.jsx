import { act, renderHook } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import React from 'react';
import userReducer from '../../../store/user/reducer';
import coursesReducer from '../../../store/courses/reducer';
import authorsReducer from '../../../store/authors/reducer';
import useRegistrationForm from './useRegistrationForm';
import { registerUserService } from '../../../services';

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
    },
    preloadedState: {
      user: { isAuth: false, role: null, status: 'idle', error: null },
      courses: { courses: [], status: 'idle', error: null },
      authors: { authors: [], status: 'idle', error: null },
    },
  });

const buildWrapper =
  (store) =>
  ({ children }) =>
    <Provider store={store}>{children}</Provider>;

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
    it('updates name field', () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Jan Kowalski' },
        });
      });
      expect(result.current.userData.name).toBe('Jan Kowalski');
    });

    it('updates email field without touching other fields', () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Jan Kowalski' },
        });
        result.current.handleChange({
          target: { name: 'email', value: 'jan@example.com' },
        });
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
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(result.current.errors.name).toBe('Name is required');
    });

    it('sets email error when email is empty', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Jan Kowalski' },
        });
      });
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(result.current.errors.email).toBe('Email is required');
    });

    it('sets email format error when email is invalid', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Jan Kowalski' },
        });
        result.current.handleChange({
          target: { name: 'email', value: 'notanemail' },
        });
      });
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(result.current.errors.email).toBe(
        'Please enter a valid email address'
      );
    });

    it('sets password error when password is empty', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Jan Kowalski' },
        });
        result.current.handleChange({
          target: { name: 'email', value: 'jan@example.com' },
        });
      });
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(result.current.errors.password).toBe('Password is required');
    });

    it('does not call registerUserService when validation fails', async () => {
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(registerUserService).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit — success', () => {
    const fillValidForm = (result) => {
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Jan Kowalski' },
        });
        result.current.handleChange({
          target: { name: 'email', value: 'jan@example.com' },
        });
        result.current.handleChange({
          target: { name: 'password', value: 'secret123' },
        });
      });
    };

    it('calls registerUserService with userData', async () => {
      registerUserService.mockResolvedValueOnce({
        data: { successful: true, user: { name: 'Jan Kowalski' } },
      });
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      fillValidForm(result);
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(registerUserService).toHaveBeenCalledWith({
        name: 'Jan Kowalski',
        email: 'jan@example.com',
        password: 'secret123',
      });
    });

    it('navigates to /login after successful registration', async () => {
      registerUserService.mockResolvedValueOnce({
        data: { successful: true, user: { name: 'Jan Kowalski' } },
      });
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      fillValidForm(result);
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('does not navigate to /courses — registration always goes to /login', async () => {
      registerUserService.mockResolvedValueOnce({
        data: { successful: true, user: { name: 'Jan Kowalski' } },
      });
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      fillValidForm(result);
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(mockNavigate).not.toHaveBeenCalledWith('/courses');
    });
  });

  describe('handleSubmit — failure', () => {
    it('sets server error when registerUserService rejects', async () => {
      registerUserService.mockRejectedValueOnce(
        new Error('Email already taken')
      );
      const { result } = renderHook(() => useRegistrationForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'Jan Kowalski' },
        });
        result.current.handleChange({
          target: { name: 'email', value: 'jan@example.com' },
        });
        result.current.handleChange({
          target: { name: 'password', value: 'secret123' },
        });
      });
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(result.current.errors.server).toBeDefined();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});