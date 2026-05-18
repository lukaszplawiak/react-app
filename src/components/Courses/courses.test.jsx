import React from 'react';
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

vi.mock('../../services');

const initialState = {
  user: {
    isAuth: true,
    name: 'Test Name',
    role: 'admin',
    status: 'succeeded',
    error: null,
  },
  courses: {
    courses: [
      {
        id: '1',
        title: 'Course 1',
        description: 'Description 1',
        duration: 125,
        authors: ['11', '22'],
      },
      {
        id: '2',
        title: 'Course 2',
        description: 'Description 2',
        duration: 125,
        authors: ['11', '22'],
      },
    ],
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

const buildStore = (state = initialState) =>
  configureStore({
    reducer: {
      user: userReducer,
      courses: coursesReducer,
      authors: authorsReducer,
      enrollments: enrollmentsReducer,
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

const renderCourses = (state = initialState) =>
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
    getCoursesService.mockResolvedValue({
      data: { successful: true, result: [] },
    });
    getAuthorsService.mockResolvedValue({
      data: { successful: true, result: [] },
    });
    getUserService.mockResolvedValue({
      data: { successful: true, result: { name: 'Test Name', role: 'admin' } },
    });
  });

  it('should display a CourseCard for each course in the store', () => {
    renderCourses();
    expect(screen.getByText('Course 1')).toBeInTheDocument();
    expect(screen.getByText('Course 2')).toBeInTheDocument();
  });

  it('should display loading message when courses are loading', () => {
    const loadingState = {
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
    const userState = {
      ...initialState,
      user: { ...initialState.user, role: 'user' },
    };
    renderCourses(userState);
    expect(screen.queryByText(/ADD NEW COURSE/i)).not.toBeInTheDocument();
  });
});