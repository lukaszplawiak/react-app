import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter as Router } from 'react-router-dom';
import userReducer from '../../../store/user/reducer';
import coursesReducer from '../../../store/courses/reducer';
import authorsReducer from '../../../store/authors/reducer';
import Header from '../Header';

const initialState = {
  user: {
    isAuth: true,
    name: 'username',
    role: 'user',
    status: 'succeeded',
    error: null,
  },
  courses: {
    courses: [],
    status: 'idle',
    error: null,
  },
  authors: {
    authors: [],
    status: 'idle',
    error: null,
  },
};

const buildStore = (state = initialState) =>
  configureStore({
    reducer: {
      user: userReducer,
      courses: coursesReducer,
      authors: authorsReducer,
    },
    preloadedState: state,
  });

describe('Header Component', () => {
  beforeEach(() => {
    render(
      <Provider store={buildStore()}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
  });

  it('should contain a logo', () => {
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
  });

  it('should display the username when user is logged in', () => {
    expect(screen.getByText('Hello, username')).toBeInTheDocument();
  });

  it('should display Logout button when user is authenticated', () => {
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});