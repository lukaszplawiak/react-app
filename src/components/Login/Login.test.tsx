import { MemoryRouter } from 'react-router-dom';

import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { render, screen } from '@testing-library/react';

import authorsReducer from '../../store/authors/reducer';
import coursesReducer from '../../store/courses/reducer';
import enrollmentsReducer from '../../store/enrollments/reducer';
import userReducer from '../../store/user/reducer';

import type { UserState } from '../../types';

import Login from './Login';

vi.mock('../../services');

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
    },
  });

const renderLogin = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );

describe('Login', () => {
  it('renders email input', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Your Email')).toBeInTheDocument();
  });

  it('renders password input', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Your Password')).toBeInTheDocument();
  });

  it('renders Login submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('renders Click to register link', () => {
    renderLogin();
    expect(
      screen.getByRole('link', { name: 'Click to register' })
    ).toBeInTheDocument();
  });

  it('renders a form element', () => {
    renderLogin();
    expect(document.querySelector('form')).toBeInTheDocument();
  });
});
