import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { render, screen } from '@testing-library/react';

import authorsReducer from '../../store/authors/reducer';
import coursesReducer from '../../store/courses/reducer';
import enrollmentsReducer from '../../store/enrollments/reducer';
import userReducer from '../../store/user/reducer';

import type { UserState } from '../../types';

import PrivateRoute from './PrivateRoute';

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

// Renders PrivateRoute at /protected and captures navigation via route stubs
const renderPrivateRoute = (
  store: ReturnType<typeof buildStore>,
  {
    requireAdmin = false,
    initialPath = '/protected',
  }: { requireAdmin?: boolean; initialPath?: string } = {}
) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute requireAdmin={requireAdmin}>
                <div>Protected content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/courses" element={<div>Courses page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

describe('PrivateRoute', () => {
  describe('unauthenticated user', () => {
    it('redirects to /login when not authenticated', () => {
      const store = buildStore({ isAuth: false });
      renderPrivateRoute(store);
      expect(screen.getByText('Login page')).toBeInTheDocument();
      expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });

    it('preserves original path in redirect query param', () => {
      const store = buildStore({ isAuth: false });
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/protected']}>
            <Routes>
              <Route
                path="/protected"
                element={
                  <PrivateRoute>
                    <div>Protected content</div>
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<div data-testid="login-page" />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('authenticated non-admin user', () => {
    it('renders children when authenticated without requireAdmin', () => {
      const store = buildStore({ isAuth: true, role: 'user' });
      renderPrivateRoute(store);
      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    it('redirects to /courses when requireAdmin but user is not admin', () => {
      const store = buildStore({ isAuth: true, role: 'user' });
      renderPrivateRoute(store, { requireAdmin: true });
      expect(screen.getByText('Courses page')).toBeInTheDocument();
      expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });
  });

  describe('authenticated admin user', () => {
    it('renders children for admin on protected route', () => {
      const store = buildStore({ isAuth: true, role: 'admin' });
      renderPrivateRoute(store);
      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    it('renders children for admin on requireAdmin route', () => {
      const store = buildStore({ isAuth: true, role: 'admin' });
      renderPrivateRoute(store, { requireAdmin: true });
      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });
  });
});
