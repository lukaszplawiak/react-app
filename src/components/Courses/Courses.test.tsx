import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter as Router } from 'react-router-dom';
import userReducer from '../../store/user/reducer';
import coursesReducer from '../../store/courses/reducer';
import authorsReducer from '../../store/authors/reducer';
import enrollmentsReducer from '../../store/enrollments/reducer';
import Courses from './Courses';
import {
  getCoursesService,
  getAuthorsService,
  getUserService,
} from '../../services';
import type { UserState, CoursesState, AuthorsState, EnrollmentsState, Course } from '../../types';

vi.mock('../../services');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const sampleCourses: Course[] = [
  {
    id: '1',
    title: 'Course 1',
    description: 'Description 1',
    duration: 125,
    authors: ['11', '22'],
    creationDate: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Course 2',
    description: 'Description 2',
    duration: 125,
    authors: ['11', '22'],
    creationDate: '2024-01-02T00:00:00Z',
  },
];

interface TestPreloadedState {
  user: UserState;
  courses: CoursesState;
  authors: AuthorsState;
  enrollments: EnrollmentsState;
}

const initialState: TestPreloadedState = {
  user: {
    isAuth: true,
    name: 'Test Name',
    email: 'admin@test.com',
    role: 'admin',
    status: 'succeeded',
    error: null,
  },
  courses: {
    courses: sampleCourses,
    status: 'succeeded',
    error: null,
  },
  authors: {
    authors: [],
    status: 'succeeded',
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

const renderCourses = (state: TestPreloadedState = initialState) =>
  render(
    <Provider store={buildStore(state)}>
      <Router>
        <Courses />
      </Router>
    </Provider>
  );

describe('Courses Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCoursesService).mockResolvedValue({
      data: { successful: true, result: [] },
    } as any);
    vi.mocked(getAuthorsService).mockResolvedValue({
      data: { successful: true, result: [] },
    } as any);
    vi.mocked(getUserService).mockResolvedValue({
      data: { successful: true, result: { name: 'Test Name', role: 'admin' } },
    } as any);
  });

  it('should display a CourseCard for each course in the store', () => {
    renderCourses();
    expect(screen.getByText('Course 1')).toBeInTheDocument();
    expect(screen.getByText('Course 2')).toBeInTheDocument();
  });

  it('should display loading message when courses are loading', () => {
    const loadingState: TestPreloadedState = {
      ...initialState,
      courses: { ...initialState.courses, status: 'loading' },
    };
    renderCourses(loadingState);
    expect(screen.getByText('Loading courses...')).toBeInTheDocument();
  });

  it('should navigate to /courses/add after clicking "Add new course"', async () => {
    renderCourses();
    const addButton = screen.getByText(/ADD NEW COURSE/i);
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/courses/add');
    });
  });

  it('should not display "Add new course" button for non-admin user', () => {
    const userState: TestPreloadedState = {
      ...initialState,
      user: { ...initialState.user, role: 'user' },
    };
    renderCourses(userState);
    expect(screen.queryByText(/ADD NEW COURSE/i)).not.toBeInTheDocument();
  });
});