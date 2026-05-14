import coursesReducer from './reducer';
import { createCourse, fetchCourses, deleteCourse } from './thunk';

const initialState = {
  courses: [],
  status: 'idle',
  error: null,
};

describe('Courses Reducer', () => {
  it('should return the initial state', () => {
    expect(coursesReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle createCourse.fulfilled and add course to state', () => {
    const newCourse = {
      id: '1',
      title: 'Test Course',
      description: 'Test Description',
    };

    const action = {
      type: createCourse.fulfilled,
      payload: newCourse,
    };

    const expectedState = {
      courses: [newCourse],
      status: 'idle',
      error: null,
    };

    expect(coursesReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle fetchCourses.pending and set status to loading', () => {
    const action = { type: fetchCourses.pending };

    const result = coursesReducer(initialState, action);

    expect(result.status).toBe('loading');
    expect(result.error).toBeNull();
  });

  it('should handle fetchCourses.rejected and set error message', () => {
    const action = {
      type: fetchCourses.rejected,
      payload: 'Network error',
    };

    const result = coursesReducer(initialState, action);

    expect(result.status).toBe('failed');
    expect(result.error).toBe('Network error');
  });

  it('should handle deleteCourse.fulfilled and remove course from state', () => {
    const stateWithCourse = {
      courses: [{ id: '1', title: 'To Delete' }],
      status: 'succeeded',
      error: null,
    };

    const action = {
      type: deleteCourse.fulfilled,
      payload: '1',
    };

    const result = coursesReducer(stateWithCourse, action);

    expect(result.courses).toHaveLength(0);
    expect(result.error).toBeNull();
  });
});