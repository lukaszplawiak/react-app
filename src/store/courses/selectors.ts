import type { RootState } from '../index';

export const selectCourses = (state: RootState) => state.courses.courses;
export const selectCoursesStatus = (state: RootState) => state.courses.status;
export const selectCoursesError = (state: RootState) => state.courses.error;