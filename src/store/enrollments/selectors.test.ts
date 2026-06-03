import { configureStore } from '@reduxjs/toolkit';

import type { Enrollment, EnrollmentsState } from '../../types';

import authorsReducer from '../authors/reducer';
import coursesReducer from '../courses/reducer';
import userReducer from '../user/reducer';
import enrollmentsReducer from './reducer';
import {
  selectEnrollments,
  selectEnrollmentsError,
  selectEnrollmentsStatus,
  selectIsEnrolled,
} from './selectors';

const sampleEnrollment: Enrollment = {
  id: 'e1',
  userEmail: 'user@test.com',
  courseId: 'c1',
  enrolledAt: '2024-01-01T00:00:00Z',
};

const buildStore = (enrollmentsState: EnrollmentsState) =>
  configureStore({
    reducer: {
      enrollments: enrollmentsReducer,
      courses: coursesReducer,
      authors: authorsReducer,
      user: userReducer,
    },
    preloadedState: {
      enrollments: enrollmentsState,
    },
  });

describe('Enrollments Selectors', () => {
  describe('selectEnrollments', () => {
    it('returns enrollments array', () => {
      const store = buildStore({
        enrollments: [sampleEnrollment],
        status: 'succeeded',
        error: null,
      });
      expect(selectEnrollments(store.getState())).toEqual([sampleEnrollment]);
    });

    it('returns empty array when no enrollments', () => {
      const store = buildStore({
        enrollments: [],
        status: 'idle',
        error: null,
      });
      expect(selectEnrollments(store.getState())).toEqual([]);
    });
  });

  describe('selectEnrollmentsStatus', () => {
    it('returns current status', () => {
      const store = buildStore({
        enrollments: [],
        status: 'loading',
        error: null,
      });
      expect(selectEnrollmentsStatus(store.getState())).toBe('loading');
    });
  });

  describe('selectEnrollmentsError', () => {
    it('returns error message when present', () => {
      const store = buildStore({
        enrollments: [],
        status: 'failed',
        error: 'Network error',
      });
      expect(selectEnrollmentsError(store.getState())).toBe('Network error');
    });

    it('returns null when no error', () => {
      const store = buildStore({
        enrollments: [],
        status: 'idle',
        error: null,
      });
      expect(selectEnrollmentsError(store.getState())).toBeNull();
    });
  });

  describe('selectIsEnrolled', () => {
    it('returns true when user is enrolled in course', () => {
      const store = buildStore({
        enrollments: [sampleEnrollment],
        status: 'succeeded',
        error: null,
      });
      expect(selectIsEnrolled(store.getState(), 'c1')).toBe(true);
    });

    it('returns false when user is not enrolled in course', () => {
      const store = buildStore({
        enrollments: [sampleEnrollment],
        status: 'succeeded',
        error: null,
      });
      expect(selectIsEnrolled(store.getState(), 'c2')).toBe(false);
    });

    it('returns false when enrollments is empty', () => {
      const store = buildStore({
        enrollments: [],
        status: 'idle',
        error: null,
      });
      expect(selectIsEnrolled(store.getState(), 'c1')).toBe(false);
    });
  });
});
