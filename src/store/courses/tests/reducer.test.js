import coursesReducer from '../reducer';
import { createCourse } from '../thunk';

const initialState = { courses: [], error: null };

describe('Courses Reducer', () => {
  test('should return the initial state', () => {
    expect(coursesReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle createCourse and return new state', () => {
    const newCourse = {
      id: 1,
      title: 'Test Course',
      description: 'Test Description',
    };

    const action = {
      type: createCourse.fulfilled,
      payload: newCourse,
    };

    const newState = {
      courses: [newCourse],
      error: null,
    };

    expect(coursesReducer(initialState, action)).toEqual(newState);
  });
});
