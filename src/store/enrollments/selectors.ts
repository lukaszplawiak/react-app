import type { RootState } from '../index';

export const selectEnrollments = (state: RootState) =>
  state.enrollments.enrollments;
export const selectEnrollmentsStatus = (state: RootState) =>
  state.enrollments.status;
export const selectEnrollmentsError = (state: RootState) =>
  state.enrollments.error;

export const selectIsEnrolled =
  (courseId: string) =>
  (state: RootState): boolean =>
    state.enrollments.enrollments.some(
      (enrollment) => enrollment.courseId === courseId
    );
