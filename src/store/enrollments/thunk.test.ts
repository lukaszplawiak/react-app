import { configureStore } from '@reduxjs/toolkit';

import { enrollCourseService, getEnrollmentsService } from '../../services';
import type { Enrollment, EnrollmentsState } from '../../types';

import authorsReducer from '../authors/reducer';
import coursesReducer from '../courses/reducer';
import userReducer from '../user/reducer';
import enrollmentsReducer from './reducer';
import { enrollCourse, fetchEnrollments } from './thunk';

vi.mock('../../services');

const mockedGetEnrollments = vi.mocked(getEnrollmentsService);
const mockedEnrollCourse = vi.mocked(enrollCourseService);

const sampleEnrollment: Enrollment = {
  id: 'e1',
  userEmail: 'user@test.com',
  courseId: 'c1',
  enrolledAt: '2024-01-01T00:00:00Z',
  courseName: 'Test Course',
};

const buildStore = (
  preloadedEnrollments: EnrollmentsState = {
    enrollments: [],
    status: 'idle',
    error: null,
  }
) =>
  configureStore({
    reducer: {
      enrollments: enrollmentsReducer,
      courses: coursesReducer,
      authors: authorsReducer,
      user: userReducer,
    },
    preloadedState: {
      enrollments: preloadedEnrollments,
    },
  });

describe('Enrollments Thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchEnrollments', () => {
    it('dispatches fulfilled and populates enrollments on success', async () => {
      mockedGetEnrollments.mockResolvedValueOnce({
        data: { successful: true, result: [sampleEnrollment] },
      } as any);

      const store = buildStore();
      await store.dispatch(fetchEnrollments());

      const state = store.getState().enrollments;
      expect(state.status).toBe('succeeded');
      expect(state.enrollments).toEqual([sampleEnrollment]);
    });

    it('dispatches rejected and sets error on service failure', async () => {
      mockedGetEnrollments.mockRejectedValueOnce(new Error('Network error'));

      const store = buildStore();
      await store.dispatch(fetchEnrollments());

      const state = store.getState().enrollments;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Network error');
    });

    it('dispatches rejected when successful flag is false', async () => {
      mockedGetEnrollments.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      await store.dispatch(fetchEnrollments());

      expect(store.getState().enrollments.status).toBe('failed');
    });
  });

  describe('enrollCourse', () => {
    it('appends enrollment to state on success', async () => {
      mockedEnrollCourse.mockResolvedValueOnce({
        data: { successful: true, result: sampleEnrollment },
      } as any);

      const store = buildStore();
      await store.dispatch(enrollCourse('c1'));

      expect(store.getState().enrollments.enrollments).toHaveLength(1);
      expect(store.getState().enrollments.enrollments[0]).toEqual(
        sampleEnrollment
      );
    });

    it('returns rejected action on service failure', async () => {
      mockedEnrollCourse.mockRejectedValueOnce(new Error('Enroll failed'));

      const store = buildStore();
      const result = await store.dispatch(enrollCourse('c1'));

      expect(enrollCourse.rejected.match(result)).toBe(true);
      expect(store.getState().enrollments.enrollments).toHaveLength(0);
    });

    it('returns rejected action when successful flag is false', async () => {
      mockedEnrollCourse.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      const result = await store.dispatch(enrollCourse('c1'));

      expect(enrollCourse.rejected.match(result)).toBe(true);
    });

    it('passes courseId to service', async () => {
      mockedEnrollCourse.mockResolvedValueOnce({
        data: { successful: true, result: sampleEnrollment },
      } as any);

      const store = buildStore();
      await store.dispatch(enrollCourse('c1'));

      expect(mockedEnrollCourse).toHaveBeenCalledWith('c1');
    });
  });
});
