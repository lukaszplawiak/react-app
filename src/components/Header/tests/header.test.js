import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Header';
import { MemoryRouter as Router } from 'react-router-dom';
import rootReducer from '../../../store/rootReducer';

const initialState = {
  user: {
    isAuth: true,
    name: 'username',
  },
  courses: [],
  authors: [],
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});

describe('Header Component', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
  });

  it('should contain a logo', () => {
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
  });

  it('should display the username', () => {
    expect(screen.getByText('Hello, username')).toBeInTheDocument();
  });
});
