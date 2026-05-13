import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter as Router } from 'react-router-dom';
import userReducer from '../../../store/user/reducer';
import coursesReducer from '../../../store/courses/reducer';
import authorsReducer from '../../../store/authors/reducer';
import Header from '../Header';
import { logoutUserService } from '../../../services';

vi.mock('../../../services');

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

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderHeader = (state = initialState) =>
  render(
    <Provider store={buildStore(state)}>
      <Router>
        <Header />
      </Router>
    </Provider>
  );

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logoutUserService.mockResolvedValue({ data: { successful: true } });
  });

  it('should contain a logo', () => {
    renderHeader();
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
  });

  it('should display the username when user is logged in', () => {
    renderHeader();
    expect(screen.getByText('Hello, username')).toBeInTheDocument();
  });

  it('should display Logout button when user is authenticated', () => {
    renderHeader();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should display Login button when user is not authenticated', () => {
    const guestState = {
      ...initialState,
      user: { ...initialState.user, isAuth: false, name: null },
    };

    renderHeader(guestState);

    expect(screen.getByText('LOGIN')).toBeInTheDocument();
  });

  it('should call logoutUserService and navigate to /login on logout', async () => {
    renderHeader();

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(logoutUserService).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});