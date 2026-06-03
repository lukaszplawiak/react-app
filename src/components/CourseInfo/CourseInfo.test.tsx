import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import authorsReducer from '../../store/authors/reducer';
import coursesReducer from '../../store/courses/reducer';
import enrollmentsReducer from '../../store/enrollments/reducer';
import userReducer from '../../store/user/reducer';

import { enrollCourseService, getCoursesService } from '../../services';
import type {
  Author,
  AuthorsState,
  Course,
  CoursesState,
  EnrollmentsState,
  UserState,
} from '../../types';

import CourseInfo from './CourseInfo';

vi.mock('../../services');

const sampleCourse: Course = {
  id: 'c1',
  title: 'React Fundamentals',
  description: 'Learn React from scratch',
  duration: 90,
  authors: ['a1'],
  creationDate: '2024-01-15T00:00:00Z',
};

const sampleAuthor: Author = { id: 'a1', name: 'Ada Lovelace' };

interface BuildStoreOptions {
  user?: Partial<UserState>;
  courses?: Partial<CoursesState>;
  authors?: Partial<AuthorsState>;
  enrollments?: Partial<EnrollmentsState>;
}

const buildStore = ({
  user = {},
  courses = {},
  authors = {},
  enrollments = {},
}: BuildStoreOptions = {}) =>
  configureStore({
    reducer: {
      user: userReducer,
      courses: coursesReducer,
      authors: authorsReducer,
      enrollments: enrollmentsReducer,
    },
    preloadedState: {
      user: {
        isAuth: true,
        role: 'user',
        name: 'Test User',
        email: 'user@test.com',
        status: 'succeeded',
        error: null,
        ...user,
      } as UserState,
      courses: {
        courses: [sampleCourse],
        status: 'succeeded',
        error: null,
        ...courses,
      } as CoursesState,
      authors: {
        authors: [sampleAuthor],
        status: 'succeeded',
        error: null,
        ...authors,
      } as AuthorsState,
      enrollments: {
        enrollments: [],
        status: 'idle',
        error: null,
        ...enrollments,
      } as EnrollmentsState,
    },
  });

const renderCourseInfo = (
  store: ReturnType<typeof buildStore>,
  courseId = 'c1'
) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/courses/${courseId}`]}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseInfo />} />
          <Route path="/courses" element={<div>Courses list</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

describe('CourseInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading message when courses are loading', () => {
      const store = buildStore({
        courses: { courses: [], status: 'loading', error: null },
      });
      renderCourseInfo(store);
      expect(screen.getByText('Loading course...')).toBeInTheDocument();
    });

    it('shows loading message when authors are loading', () => {
      const store = buildStore({
        authors: { authors: [], status: 'loading', error: null },
      });
      renderCourseInfo(store);
      expect(screen.getByText('Loading course...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when courses fetch failed', () => {
      const store = buildStore({
        courses: { courses: [], status: 'failed', error: 'Network error' },
      });
      renderCourseInfo(store);
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      vi.mocked(getCoursesService).mockResolvedValue({
        data: { successful: true, result: [] },
      } as any);

      const store = buildStore({
        courses: { courses: [], status: 'failed', error: 'Network error' },
      });
      renderCourseInfo(store);
      expect(
        screen.getByRole('button', { name: 'Try again' })
      ).toBeInTheDocument();
    });
  });

  describe('not found state', () => {
    it('shows not found message when course does not exist', () => {
      const store = buildStore();
      renderCourseInfo(store, 'nonexistent-id');
      expect(screen.getByText('Course not found.')).toBeInTheDocument();
    });

    it('shows Back to Courses link when course not found', () => {
      const store = buildStore();
      renderCourseInfo(store, 'nonexistent-id');
      expect(
        screen.getByRole('link', { name: 'Back to Courses' })
      ).toBeInTheDocument();
    });
  });

  describe('course detail view', () => {
    it('renders course title', () => {
      const store = buildStore();
      renderCourseInfo(store);
      expect(
        screen.getByRole('heading', { name: 'React Fundamentals' })
      ).toBeInTheDocument();
    });

    it('renders course description', () => {
      const store = buildStore();
      renderCourseInfo(store);
      expect(screen.getByText('Learn React from scratch')).toBeInTheDocument();
    });

    it('renders formatted duration', () => {
      const store = buildStore();
      renderCourseInfo(store);
      expect(screen.getByText(/01:30 hour/i)).toBeInTheDocument();
    });

    it('renders author names', () => {
      const store = buildStore();
      renderCourseInfo(store);
      expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
    });

    it('renders Back to Courses link', () => {
      const store = buildStore();
      renderCourseInfo(store);
      expect(
        screen.getByRole('link', { name: 'Back to Courses' })
      ).toBeInTheDocument();
    });

    it('shows No authors assigned when course has no authors', () => {
      const store = buildStore({
        courses: {
          courses: [{ ...sampleCourse, authors: [] }],
          status: 'succeeded',
          error: null,
        },
      });
      renderCourseInfo(store);
      expect(screen.getByText(/No authors assigned/)).toBeInTheDocument();
    });
  });

  describe('enroll button — regular user', () => {
    it('shows Enroll button for non-admin user', () => {
      const store = buildStore({ user: { role: 'user' } });
      renderCourseInfo(store);
      expect(
        screen.getByRole('button', { name: 'Enroll in this course' })
      ).toBeInTheDocument();
    });

    it('shows Enrolled when user is already enrolled', () => {
      const store = buildStore({
        enrollments: {
          enrollments: [
            {
              id: 'e1',
              userEmail: 'user@test.com',
              courseId: 'c1',
              enrolledAt: '2024-01-01T00:00:00Z',
            },
          ],
          status: 'succeeded',
          error: null,
        },
      });
      renderCourseInfo(store);
      expect(screen.getByText('Enrolled ✓')).toBeInTheDocument();
    });

    it('disables button when already enrolled', () => {
      const store = buildStore({
        enrollments: {
          enrollments: [
            {
              id: 'e1',
              userEmail: 'user@test.com',
              courseId: 'c1',
              enrolledAt: '2024-01-01T00:00:00Z',
            },
          ],
          status: 'succeeded',
          error: null,
        },
      });
      renderCourseInfo(store);
      expect(screen.getByRole('button', { name: 'Enrolled ✓' })).toBeDisabled();
    });

    it('shows enroll error when enrollCourse fails', async () => {
      vi.mocked(enrollCourseService).mockRejectedValueOnce(
        new Error('Enroll failed')
      );

      const store = buildStore({ user: { role: 'user' } });
      renderCourseInfo(store);

      await userEvent.click(
        screen.getByRole('button', { name: 'Enroll in this course' })
      );

      await waitFor(() => {
        expect(screen.getByText('Enroll failed')).toBeInTheDocument();
      });
    });
  });

  describe('admin view', () => {
    it('does not show Enroll button for admin', () => {
      const store = buildStore({ user: { role: 'admin' } });
      renderCourseInfo(store);
      expect(
        screen.queryByRole('button', { name: /Enroll/i })
      ).not.toBeInTheDocument();
    });
  });
});
