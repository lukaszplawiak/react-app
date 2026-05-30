import type { Enrollment, EnrollmentsState } from '../../types';

import enrollmentsReducer from './reducer';
import { enrollCourse, fetchEnrollments } from './thunk';

const initialState: EnrollmentsState = {
  enrollments: [],
  status: 'idle',
  error: null,
};

const sampleEnrollment: Enrollment = {
  id: 'e1',
  userEmail: 'user@test.com',
  courseId: 'c1',
  enrolledAt: '2024-01-01T00:00:00Z',
  courseName: 'Test Course',
};

describe('Enrollments Reducer', () => {
  it('should return the initial state', () => {
    expect(enrollmentsReducer(undefined, { type: '@@INIT' })).toEqual(
      initialState
    );
  });

  it('should set status to loading on fetchEnrollments.pending', () => {
    const action = { type: fetchEnrollments.pending.type };
    const state = enrollmentsReducer(initialState, action);
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('should populate enrollments on fetchEnrollments.fulfilled', () => {
    const action = {
      type: fetchEnrollments.fulfilled.type,
      payload: [sampleEnrollment],
    };
    const state = enrollmentsReducer(initialState, action);
    expect(state.status).toBe('succeeded');
    expect(state.enrollments).toEqual([sampleEnrollment]);
  });

  it('should set error on fetchEnrollments.rejected', () => {
    const action = {
      type: fetchEnrollments.rejected.type,
      payload: 'Network error',
    };
    const state = enrollmentsReducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network error');
  });

  it('should append enrollment on enrollCourse.fulfilled', () => {
    const action = {
      type: enrollCourse.fulfilled.type,
      payload: sampleEnrollment,
    };
    const state = enrollmentsReducer(initialState, action);
    expect(state.enrollments).toHaveLength(1);
    expect(state.enrollments[0]).toEqual(sampleEnrollment);
  });

  it('should append to existing enrollments on enrollCourse.fulfilled', () => {
    const existing: Enrollment = {
      ...sampleEnrollment,
      id: 'e0',
      courseId: 'c0',
    };
    const stateWithEnrollment: EnrollmentsState = {
      ...initialState,
      enrollments: [existing],
    };
    const action = {
      type: enrollCourse.fulfilled.type,
      payload: sampleEnrollment,
    };
    const state = enrollmentsReducer(stateWithEnrollment, action);
    expect(state.enrollments).toHaveLength(2);
  });
});