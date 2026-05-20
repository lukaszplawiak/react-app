import coursesReducer from './reducer';
import { fetchCourses, createCourse, deleteCourse } from './thunk';
import type { CoursesState, Course } from '../../types';

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

describe('Courses Reducer', () => {
  it('should return the initial state', () => {
    expect(coursesReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should set status to loading on fetchCourses.pending', () => {
    const action = { type: fetchCourses.pending.type };
    const state = coursesReducer(initialState, action);
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('should populate courses on fetchCourses.fulfilled', () => {
    const courses: Course[] = [sampleCourse];
    const action = { type: fetchCourses.fulfilled.type, payload: courses };
    const state = coursesReducer(initialState, action);
    expect(state.status).toBe('succeeded');
    expect(state.courses).toEqual(courses);
  });

  it('should set error on fetchCourses.rejected', () => {
    const action = {
      type: fetchCourses.rejected.type,
      payload: 'Network error',
    };
    const state = coursesReducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network error');
  });

  it('should add course on createCourse.fulfilled', () => {
    const action = { type: createCourse.fulfilled.type, payload: sampleCourse };
    const state = coursesReducer(initialState, action);
    expect(state.courses).toHaveLength(1);
    expect(state.courses[0]).toEqual(sampleCourse);
  });

  it('should remove course on deleteCourse.fulfilled', () => {
    const stateWithCourse: CoursesState = {
      ...initialState,
      courses: [sampleCourse],
    };
    const action = { type: deleteCourse.fulfilled.type, payload: '1' };
    const state = coursesReducer(stateWithCourse, action);
    expect(state.courses).toHaveLength(0);
  });
});