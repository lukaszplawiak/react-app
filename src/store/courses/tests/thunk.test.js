import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from '../reducer';
import { fetchCourses, createCourse, deleteCourse, updateCourse } from '../thunk';
import {
  getCoursesService,
  createCourseService,
  deleteCourseService,
  updateCourseService,
} from '../../../services';

vi.mock('../../../services');

const buildStore = (preloadedState) =>
  configureStore({
    reducer: { courses: coursesReducer },
    preloadedState,
  });

describe('Courses Thunks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCourses', () => {
    it('should dispatch fulfilled and populate courses on success', async () => {
      const mockCourses = [{ id: '1', title: 'Course 1' }];
      getCoursesService.mockResolvedValueOnce({
        data: { successful: true, result: mockCourses },
      });

      const store = buildStore();
      await store.dispatch(fetchCourses());

      const state = store.getState().courses;
      expect(state.status).toBe('succeeded');
      expect(state.courses).toEqual(mockCourses);
      expect(state.error).toBeNull();
    });

    it('should dispatch rejected and set error on service failure', async () => {
      getCoursesService.mockRejectedValueOnce(new Error('Network error'));

      const store = buildStore();
      await store.dispatch(fetchCourses());

      const state = store.getState().courses;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Network error');
    });

    it('should dispatch rejected when successful flag is false', async () => {
      getCoursesService.mockResolvedValueOnce({
        data: { successful: false },
      });

      const store = buildStore();
      await store.dispatch(fetchCourses());

      const state = store.getState().courses;
      expect(state.status).toBe('failed');
    });
  });

  describe('createCourse', () => {
    it('should add course to state on success', async () => {
      const newCourse = { id: '2', title: 'New Course' };
      createCourseService.mockResolvedValueOnce({
        data: { successful: true, result: newCourse },
      });

      const store = buildStore();
      await store.dispatch(createCourse({ title: 'New Course' }));

      const state = store.getState().courses;
      expect(state.courses).toContainEqual(newCourse);
    });

    it('should set error on failure', async () => {
      createCourseService.mockRejectedValueOnce(new Error('Create failed'));

      const store = buildStore();
      await store.dispatch(createCourse({ title: 'New Course' }));

      const state = store.getState().courses;
      expect(state.error).toBe('Create failed');
    });
  });

  describe('deleteCourse', () => {
    it('should remove course from state on success', async () => {
      deleteCourseService.mockResolvedValueOnce({
        data: { successful: true },
      });

      const preloadedState = {
        courses: {
          courses: [{ id: '1', title: 'To Delete' }],
          status: 'succeeded',
          error: null,
        },
      };

      const store = buildStore(preloadedState);
      await store.dispatch(deleteCourse('1'));

      const state = store.getState().courses;
      expect(state.courses).toHaveLength(0);
    });
  });

  describe('updateCourse', () => {
    it('should update course in state on success', async () => {
      const updatedCourse = { id: '1', title: 'Updated Title' };
      updateCourseService.mockResolvedValueOnce({
        data: { successful: true, result: updatedCourse },
      });

      const preloadedState = {
        courses: {
          courses: [{ id: '1', title: 'Old Title' }],
          status: 'succeeded',
          error: null,
        },
      };

      const store = buildStore(preloadedState);
      await store.dispatch(updateCourse(updatedCourse));

      const state = store.getState().courses;
      expect(state.courses[0].title).toBe('Updated Title');
    });
  });
});