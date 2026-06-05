import { MemoryRouter } from 'react-router-dom';

import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { render, screen } from '@testing-library/react';

import authorsReducer from '../../store/authors/reducer';
import coursesReducer from '../../store/courses/reducer';
import enrollmentsReducer from '../../store/enrollments/reducer';
import userReducer from '../../store/user/reducer';

import type { Enrollment, EnrollmentsState } from '../../types';

import Enrolled from './Enrolled';

const sampleEnrollment: Enrollment = {
  id: 'e1',
  userEmail: 'student@test.com',
  courseId: 'c1',
  courseName: 'React Fundamentals',
  enrolledAt: '2024-03-15T10:00:00Z',
};

const buildStore = (enrollmentsState: Partial<EnrollmentsState> = {}) =>
  configureStore({
    reducer: {
      user: userReducer,
      courses: coursesReducer,
      authors: authorsReducer,
      enrollments: enrollmentsReducer,
    },
    preloadedState: {
      enrollments: {
        enrollments: [],
        status: 'succeeded',
        error: null,
        ...enrollmentsState,
      } as EnrollmentsState,
    },
  });

const renderEnrolled = (store: ReturnType<typeof buildStore>) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Enrolled />
      </MemoryRouter>
    </Provider>
  );

describe('Enrolled', () => {
  describe('loading state', () => {
    it('shows loading message when status is loading', () => {
      const store = buildStore({ status: 'loading' });
      renderEnrolled(store);
      expect(screen.getByText('Loading enrollments...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when status is failed', () => {
      const store = buildStore({ status: 'failed', error: 'Network error' });
      renderEnrolled(store);
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no enrollments', () => {
      const store = buildStore({ enrollments: [] });
      renderEnrolled(store);
      expect(screen.getByText('No students enrolled yet.')).toBeInTheDocument();
    });

    it('renders Enrolled Students heading', () => {
      const store = buildStore({ enrollments: [] });
      renderEnrolled(store);
      expect(
        screen.getByRole('heading', { name: 'Enrolled Students' })
      ).toBeInTheDocument();
    });

    it('renders Back to Courses link', () => {
      const store = buildStore({ enrollments: [] });
      renderEnrolled(store);
      expect(
        screen.getByRole('link', { name: 'Back to Courses' })
      ).toBeInTheDocument();
    });
  });

  describe('data state', () => {
    it('renders enrollment table when enrollments exist', () => {
      const store = buildStore({ enrollments: [sampleEnrollment] });
      renderEnrolled(store);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('shows student email in table', () => {
      const store = buildStore({ enrollments: [sampleEnrollment] });
      renderEnrolled(store);
      expect(screen.getByText('student@test.com')).toBeInTheDocument();
    });

    it('shows course name in table', () => {
      const store = buildStore({ enrollments: [sampleEnrollment] });
      renderEnrolled(store);
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    it('shows table headers', () => {
      const store = buildStore({ enrollments: [sampleEnrollment] });
      renderEnrolled(store);
      expect(screen.getByText('Student Email')).toBeInTheDocument();
      expect(screen.getByText('Course')).toBeInTheDocument();
      expect(screen.getByText('Enrolled At')).toBeInTheDocument();
    });
  });
});
