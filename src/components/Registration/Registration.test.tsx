import { MemoryRouter } from 'react-router-dom';

import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { render, screen } from '@testing-library/react';

import authorsReducer from '../../store/authors/reducer';
import coursesReducer from '../../store/courses/reducer';
import enrollmentsReducer from '../../store/enrollments/reducer';
import userReducer from '../../store/user/reducer';

import type { UserState } from '../../types';

import Registration from './Registration';

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

const renderRegistration = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <Registration />
      </MemoryRouter>
    </Provider>
  );

describe('Registration', () => {
  it('renders name input', () => {
    renderRegistration();
    expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderRegistration();
    expect(screen.getByPlaceholderText('Your Email')).toBeInTheDocument();
  });

  it('renders password input', () => {
    renderRegistration();
    expect(screen.getByPlaceholderText('Your Password')).toBeInTheDocument();
  });

  it('renders Register submit button', () => {
    renderRegistration();
    expect(
      screen.getByRole('button', { name: 'Register' })
    ).toBeInTheDocument();
  });

  it('renders Click to login link', () => {
    renderRegistration();
    expect(
      screen.getByRole('link', { name: 'Click to login' })
    ).toBeInTheDocument();
  });

  it('renders a form element', () => {
    renderRegistration();
    expect(document.querySelector('form')).toBeInTheDocument();
  });
});
