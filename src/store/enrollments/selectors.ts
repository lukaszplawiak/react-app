import type { RootState } from '../index';

export const selectEnrollments = (state: RootState) =>
  state.enrollments.enrollments;

export const selectEnrollmentsStatus = (state: RootState) =>
  state.enrollments.status;

export const selectEnrollmentsError = (state: RootState) =>
  state.enrollments.error;

// Parametric selector — takes (state, courseId) instead of curried (courseId)(state).
//
// The curried factory pattern — selectIsEnrolled(courseId) called inside render —
// returns a new function reference on every render. useSelector uses referential
// equality to decide whether to re-run, so a new reference forces a re-run on
// every store update, even unrelated ones. With a list of 50+ courses this is
// a measurable performance issue.
//
// Usage: useSelector((state) => selectIsEnrolled(state, courseId))
export const selectIsEnrolled = (state: RootState, courseId: string): boolean =>
  state.enrollments.enrollments.some(
    (enrollment) => enrollment.courseId === courseId
  );
