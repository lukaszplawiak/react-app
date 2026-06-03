import type { Course, CoursesState } from '../../types';

import coursesReducer from './reducer';
import {
  createCourse,
  deleteCourse,
  fetchCourses,
  updateCourse,
} from './thunk';

const initialState: CoursesState = {
  courses: [],
  status: 'idle',
  error: null,
};

const sampleCourse: Course = {
  id: '1',
  title: 'Test Course',
  description: 'Test Description',
  duration: 60,
  authors: [],
  creationDate: '2024-01-01T00:00:00Z',
};

const sampleCourse2: Course = {
  id: '2',
  title: 'Another Course',
  description: 'Another Description',
  duration: 90,
  authors: [],
  creationDate: '2024-02-01T00:00:00Z',
};

describe('Courses Reducer', () => {
  it('should return the initial state', () => {
    expect(coursesReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('fetchCourses', () => {
    it('should set status to loading on pending', () => {
      const state = coursesReducer(initialState, {
        type: fetchCourses.pending.type,
      });
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should populate courses on fulfilled', () => {
      const state = coursesReducer(initialState, {
        type: fetchCourses.fulfilled.type,
        payload: [sampleCourse],
      });
      expect(state.status).toBe('succeeded');
      expect(state.courses).toEqual([sampleCourse]);
    });

    it('should set error on rejected', () => {
      const state = coursesReducer(initialState, {
        type: fetchCourses.rejected.type,
        payload: 'Network error',
      });
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Network error');
    });

    it('should set error to null when rejected payload is undefined', () => {
      const state = coursesReducer(initialState, {
        type: fetchCourses.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });

  describe('createCourse', () => {
    it('should add course on fulfilled', () => {
      const state = coursesReducer(initialState, {
        type: createCourse.fulfilled.type,
        payload: sampleCourse,
      });
      expect(state.courses).toHaveLength(1);
      expect(state.courses[0]).toEqual(sampleCourse);
    });

    it('should set status to failed and store error on rejected', () => {
      const state = coursesReducer(initialState, {
        type: createCourse.rejected.type,
        payload: 'Create failed',
      });
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Create failed');
    });

    it('should set error to null when rejected payload is undefined', () => {
      const state = coursesReducer(initialState, {
        type: createCourse.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });

  describe('deleteCourse', () => {
    it('should remove course on fulfilled', () => {
      const stateWithCourse: CoursesState = {
        ...initialState,
        courses: [sampleCourse],
      };
      const state = coursesReducer(stateWithCourse, {
        type: deleteCourse.fulfilled.type,
        payload: '1',
      });
      expect(state.courses).toHaveLength(0);
    });

    it('should not remove other courses when deleting one', () => {
      const stateWithCourses: CoursesState = {
        ...initialState,
        courses: [sampleCourse, sampleCourse2],
      };
      const state = coursesReducer(stateWithCourses, {
        type: deleteCourse.fulfilled.type,
        payload: '1',
      });
      expect(state.courses).toHaveLength(1);
      expect(state.courses[0].id).toBe('2');
    });

    it('should set status to failed and store error on rejected', () => {
      const state = coursesReducer(initialState, {
        type: deleteCourse.rejected.type,
        payload: 'Delete failed',
      });
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Delete failed');
    });

    it('should set error to null when rejected payload is undefined', () => {
      const state = coursesReducer(initialState, {
        type: deleteCourse.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });

  describe('updateCourse', () => {
    it('should update existing course on fulfilled', () => {
      const stateWithCourse: CoursesState = {
        ...initialState,
        courses: [sampleCourse],
      };
      const updatedCourse = { ...sampleCourse, title: 'Updated Title' };
      const state = coursesReducer(stateWithCourse, {
        type: updateCourse.fulfilled.type,
        payload: updatedCourse,
      });
      expect(state.courses[0].title).toBe('Updated Title');
    });

    it('should not modify state when course id not found', () => {
      const stateWithCourse: CoursesState = {
        ...initialState,
        courses: [sampleCourse],
      };
      const nonExistentCourse = { ...sampleCourse, id: 'nonexistent' };
      const state = coursesReducer(stateWithCourse, {
        type: updateCourse.fulfilled.type,
        payload: nonExistentCourse,
      });
      // index === -1 branch — original course unchanged
      expect(state.courses[0]).toEqual(sampleCourse);
    });

    it('should set status to failed and store error on rejected', () => {
      const state = coursesReducer(initialState, {
        type: updateCourse.rejected.type,
        payload: 'Update failed',
      });
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Update failed');
    });

    it('should set error to null when rejected payload is undefined', () => {
      const state = coursesReducer(initialState, {
        type: updateCourse.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });
});
