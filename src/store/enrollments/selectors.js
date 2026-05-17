export const selectEnrollments = (state) => state.enrollments.enrollments;
export const selectEnrollmentsStatus = (state) => state.enrollments.status;
export const selectEnrollmentsError = (state) => state.enrollments.error;

export const selectIsEnrolled = (courseId) => (state) =>
  state.enrollments.enrollments.some(
    (enrollment) => enrollment.courseId === courseId
  );