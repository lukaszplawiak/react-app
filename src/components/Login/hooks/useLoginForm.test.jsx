import { act, renderHook } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import React from 'react';
import userReducer from '../../../store/user/reducer';
import coursesReducer from '../../../store/courses/reducer';
import authorsReducer from '../../../store/authors/reducer';
import useLoginForm from './useLoginForm';
import { loginUserService } from '../../../services';

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

const fillAndSubmit = async (result) => {
  act(() => {
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
    it('updates email field', () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        });
      });
      expect(result.current.formData.email).toBe('test@example.com');
    });

    it('updates password field', () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'password', value: 'secret123' },
        });
      });
      expect(result.current.formData.password).toBe('secret123');
    });

    it('does not overwrite other fields when updating one', () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        });
        result.current.handleChange({
          target: { name: 'password', value: 'secret123' },
        });
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
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(result.current.errors.email).toBe('Email is required');
    });

    it('sets email format error when email is invalid', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
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
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@example.com' },
        });
      });
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(result.current.errors.password).toBe('Password is required');
    });

    it('does not call loginUserService when validation fails', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      expect(loginUserService).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit — success', () => {
    beforeEach(() => {
      loginUserService.mockResolvedValue({
        data: {
          successful: true,
          result: 'token',
          user: { name: 'Jan', email: 'jan@example.com', role: 'user' },
        },
      });
    });

    it('navigates to /courses by default when no redirect param', async () => {
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      expect(mockNavigate).toHaveBeenCalledWith('/courses', { replace: true });
    });

    it('navigates to safe relative redirect path from query string', async () => {
      mockSearch = '?redirect=/courses/add';
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      expect(mockNavigate).toHaveBeenCalledWith('/courses/add', {
        replace: true,
      });
    });

    it('falls back to /courses when redirect is an external URL', async () => {
      mockSearch = '?redirect=https://evil.com';
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      expect(mockNavigate).toHaveBeenCalledWith('/courses', { replace: true });
    });

    it('falls back to /courses when redirect contains protocol-relative URL', async () => {
      mockSearch = '?redirect=//evil.com';
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      expect(mockNavigate).toHaveBeenCalledWith('/courses', { replace: true });
    });
  });

  describe('handleSubmit — failure', () => {
    it('sets server error when loginUserService rejects', async () => {
      loginUserService.mockRejectedValueOnce(new Error('Invalid credentials'));
      const { result } = renderHook(() => useLoginForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillAndSubmit(result);
      expect(result.current.errors.server).toBeDefined();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});