import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../store/user/reducer';
import coursesReducer from '../../store/courses/reducer';
import authorsReducer from '../../store/authors/reducer';
import enrollmentsReducer from '../../store/enrollments/reducer';
import Header from './Header';
import { logoutUserService } from '../../services';
import type { UserState, CoursesState, AuthorsState, EnrollmentsState } from '../../types';

vi.mock('../../services');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Typed preloaded state — TypeScript verifies shape matches slice interfaces.
// This catches errors where test data is missing required fields.
interface TestPreloadedState {
  user: UserState;
  courses: CoursesState;
  authors: AuthorsState;
  enrollments: EnrollmentsState;
}

const initialState: TestPreloadedState = {
  user: {
    isAuth: true,
    name: 'username',
    role: 'user',
    email: 'user@test.com',
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
  enrollments: {
    enrollments: [],
    status: 'idle',
    error: null,
  },
};

const buildStore = (state: TestPreloadedState = initialState) =>
  configureStore({
    reducer: {
      user: userReducer,
      courses: coursesReducer,
      authors: authorsReducer,
      enrollments: enrollmentsReducer,
    },
    preloadedState: state,
  });

const renderHeader = (state: TestPreloadedState = initialState) =>
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
    vi.mocked(logoutUserService).mockResolvedValue({ data: { successful: true } } as any);
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
    const guestState: TestPreloadedState = {
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
      expect(vi.mocked(logoutUserService)).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});