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
import {
  createCourse,
  deleteCourse,
  fetchCourses,
  updateCourse,
} from './thunk';

vi.mock('../../services');

// vi.mocked() wraps the service function with Vitest mock types.
// Without it TypeScript does not know that getCoursesService
// has .mockResolvedValueOnce() method — it would show a type error.
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

// buildStore returns a fully typed store.
// TypeScript infers its type from configureStore — no manual typing needed.
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
    it('should dispatch fulfilled and populate courses on success', async () => {
      const mockCourses: Course[] = [sampleCourse];
      mockedGetCourses.mockResolvedValueOnce({
        data: { successful: true, result: mockCourses },
      } as any);

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(fetchCourses());

      const state = store.getState().courses;
      expect(state.status).toBe('succeeded');
      expect(state.courses).toEqual(mockCourses);
    });

    it('should dispatch rejected and set error on service failure', async () => {
      mockedGetCourses.mockRejectedValueOnce(new Error('Network error'));

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(fetchCourses());

      const state = store.getState().courses;
      expect(state.status).toBe('failed');
      expect(state.error).toBeDefined();
    });

    it('should dispatch rejected when successful flag is false', async () => {
      mockedGetCourses.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(fetchCourses());

      const state = store.getState().courses;
      expect(state.status).toBe('failed');
    });
  });

  describe('createCourse', () => {
    it('should add course to state on success', async () => {
      const newCourse: Course = {
        ...sampleCourse,
        id: '2',
        title: 'New Course',
      };
      mockedCreateCourse.mockResolvedValueOnce({
        data: { successful: true, result: newCourse },
      } as any);

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(
        createCourse({
          title: 'New Course',
          description: 'Description',
          duration: 60,
          authors: [],
        })
      );

      const state = store.getState().courses;
      expect(state.courses).toHaveLength(1);
      expect(state.courses[0].title).toBe('New Course');
    });

    it('should set error on failure', async () => {
      mockedCreateCourse.mockRejectedValueOnce(new Error('Create failed'));

      const store = buildStore({ courses: [], status: 'idle', error: null });
      await store.dispatch(
        createCourse({
          title: 'New Course',
          description: 'Description',
          duration: 60,
          authors: [],
        })
      );

      const state = store.getState().courses;
      expect(state.error).toBeDefined();
    });
  });

  describe('deleteCourse', () => {
    it('should remove course from state on success', async () => {
      mockedDeleteCourse.mockResolvedValueOnce({
        data: { successful: true },
      } as any);

      const store = buildStore();
      await store.dispatch(deleteCourse('1'));

      const state = store.getState().courses;
      expect(state.courses).toHaveLength(0);
    });
  });

  describe('updateCourse', () => {
    it('should update course in state on success', async () => {
      const updatedCourse: Course = { ...sampleCourse, title: 'Updated Title' };
      mockedUpdateCourse.mockResolvedValueOnce({
        data: { successful: true, result: updatedCourse },
      } as any);

      const store = buildStore();
      await store.dispatch(updateCourse(updatedCourse));

      const state = store.getState().courses;
      expect(state.courses[0].title).toBe('Updated Title');
    });
  });
});
