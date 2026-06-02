import { configureStore } from '@reduxjs/toolkit';

import {
  createCourseService,
  deleteCourseService,
  getCoursesService,
  updateCourseService,
} from '../../services';
import type { Course, CoursesState } from '../../types';

import authorsReducer from '../authors/reducer';
import enrollmentsReducer from '../enrollments/reducer';
import userReducer from '../user/reducer';
import coursesReducer from './reducer';
import { createCourse, deleteCourse, fetchCourses, updateCourse } from './thunk';

vi.mock('../../services');

const mockedGetCourses = vi.mocked(getCoursesService);
const mockedCreateCourse = vi.mocked(createCourseService);
const mockedDeleteCourse = vi.mocked(deleteCourseService);
const mockedUpdateCourse = vi.mocked(updateCourseService);

const sampleCourse: Course = {
  id: '1',
  title: 'Test Course',
  description: 'Test Description',
  duration: 60,
  authors: [],
  creationDate: '2024-01-01T00:00:00Z',
};

const initialCoursesState: CoursesState = {
  courses: [sampleCourse],
  status: 'succeeded',
  error: null,
};

const buildStore = (preloadedCourses: CoursesState = initialCoursesState) =>
  configureStore({
    reducer: {
      courses: coursesReducer,
      authors: authorsReducer,
      user: userReducer,
      enrollments: enrollmentsReducer,
    },
    preloadedState: {
      courses: preloadedCourses,
    },
  });

describe('Courses Thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCourses', () => {
    it('dispatches fulfilled and populates courses on success', async () => {
      mockedGetCourses.mockResolvedValueOnce({
        data: { successful: true, result: [sampleCourse] },
      } as any);

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(fetchCourses());

      const state = store.getState().courses;
      expect(state.status).toBe('succeeded');
      expect(state.courses).toEqual([sampleCourse]);
    });

    it('dispatches rejected on service failure', async () => {
      mockedGetCourses.mockRejectedValueOnce(new Error('Network error'));

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(fetchCourses());

      expect(store.getState().courses.status).toBe('failed');
      expect(store.getState().courses.error).toBe('Network error');
    });

    it('dispatches rejected when successful flag is false', async () => {
      mockedGetCourses.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(fetchCourses());

      expect(store.getState().courses.status).toBe('failed');
    });

    it('uses fallback message when non-Error is thrown', async () => {
      mockedGetCourses.mockRejectedValueOnce('string error');

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(fetchCourses());

      expect(store.getState().courses.error).toBe('Failed to fetch courses.');
    });
  });

  describe('createCourse', () => {
    it('adds course to state on success', async () => {
      const newCourse: Course = { ...sampleCourse, id: '2', title: 'New Course' };
      mockedCreateCourse.mockResolvedValueOnce({
        data: { successful: true, result: newCourse },
      } as any);

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(
        createCourse({ title: 'New Course', description: 'Desc', duration: 60, authors: [] })
      );

      expect(store.getState().courses.courses).toHaveLength(1);
    });

    it('dispatches rejected on failure', async () => {
      mockedCreateCourse.mockRejectedValueOnce(new Error('Create failed'));

      const store = buildStore({ courses: [], status: 'idle', error: null });
      const result = await store.dispatch(
        createCourse({ title: 'New Course', description: 'Desc', duration: 60, authors: [] })
      );

      expect(createCourse.rejected.match(result)).toBe(true);
      expect(store.getState().courses.error).toBe('Create failed');
    });

    it('uses fallback message when non-Error is thrown', async () => {
      mockedCreateCourse.mockRejectedValueOnce('string error');

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(
        createCourse({ title: 'New', description: 'Desc', duration: 60, authors: [] })
      );

      expect(store.getState().courses.error).toBe('Failed to create course.');
    });
  });

  describe('deleteCourse', () => {
    it('removes course from state on success', async () => {
      mockedDeleteCourse.mockResolvedValueOnce({
        data: { successful: true },
      } as any);

      const store = buildStore();
      await store.dispatch(deleteCourse('1'));

      expect(store.getState().courses.courses).toHaveLength(0);
    });

    it('dispatches rejected when successful flag is false', async () => {
      mockedDeleteCourse.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      const result = await store.dispatch(deleteCourse('1'));

      expect(deleteCourse.rejected.match(result)).toBe(true);
    });

    it('dispatches rejected on service failure', async () => {
      mockedDeleteCourse.mockRejectedValueOnce(new Error('Delete failed'));

      const store = buildStore();
      const result = await store.dispatch(deleteCourse('1'));

      expect(deleteCourse.rejected.match(result)).toBe(true);
      expect(store.getState().courses.error).toBe('Delete failed');
    });

    it('uses fallback message when non-Error is thrown', async () => {
      mockedDeleteCourse.mockRejectedValueOnce('string error');

      const store = buildStore();
      await store.dispatch(deleteCourse('1'));

      expect(store.getState().courses.error).toBe('Failed to delete course.');
    });
  });

  describe('updateCourse', () => {
    it('updates course in state on success', async () => {
      const updatedCourse = { ...sampleCourse, title: 'Updated Title' };
      mockedUpdateCourse.mockResolvedValueOnce({
        data: { successful: true, result: updatedCourse },
      } as any);

      const store = buildStore();
      await store.dispatch(updateCourse(updatedCourse));

      expect(store.getState().courses.courses[0].title).toBe('Updated Title');
    });

    it('dispatches rejected when successful flag is false', async () => {
      mockedUpdateCourse.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      const result = await store.dispatch(updateCourse(sampleCourse));

      expect(updateCourse.rejected.match(result)).toBe(true);
    });

    it('dispatches rejected on service failure', async () => {
      mockedUpdateCourse.mockRejectedValueOnce(new Error('Update failed'));

      const store = buildStore();
      const result = await store.dispatch(updateCourse(sampleCourse));

      expect(updateCourse.rejected.match(result)).toBe(true);
      expect(store.getState().courses.error).toBe('Update failed');
    });

    it('uses fallback message when non-Error is thrown', async () => {
      mockedUpdateCourse.mockRejectedValueOnce('string error');

      const store = buildStore();
      await store.dispatch(updateCourse(sampleCourse));

      expect(store.getState().courses.error).toBe('Failed to update course.');
    });
  });
});