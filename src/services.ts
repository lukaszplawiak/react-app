import axios from 'axios';
import type { AxiosResponse } from 'axios';

import { API_BASE_URL } from './config';
import type {
  ApiResponse,
  Author,
  Course,
  Enrollment,
  LoginApiResponse,
  RegisterApiResponse,
  User,
} from './types';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? '';

    // Redirect to login on 401 for all requests except session check.
    // A 401 on /users/me simply means the user is not authenticated —
    // it is the expected response during app bootstrapping.
    if (status === 401 && !url.includes('/users/me')) {
      window.location.href = '/login';
    }

    // Log API errors in development only.
    // In production, errors should be sent to a monitoring service
    // (e.g. Sentry, Datadog) — not logged to the browser console
    // where they are visible to anyone with DevTools open.
    if (import.meta.env.DEV) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${url} — ${status ?? 'network error'}`,
        error.message
      );
    }

    return Promise.reject(error);
  }
);

// --- Courses ---

export const getCoursesService = (): Promise<
  AxiosResponse<ApiResponse<Course[]>>
> => apiClient.get('/courses/all');

export const createCourseService = (
  course: Omit<Course, 'id' | 'creationDate'>
): Promise<AxiosResponse<ApiResponse<Course>>> =>
  apiClient.post('/courses/add', course);

export const deleteCourseService = (
  courseId: string
): Promise<AxiosResponse<ApiResponse<null>>> =>
  apiClient.delete(`/courses/${courseId}`);

export const updateCourseService = (
  course: Course
): Promise<AxiosResponse<ApiResponse<Course>>> =>
  apiClient.put(`/courses/${course.id}`, course);

// --- Authors ---

export const getAuthorsService = (): Promise<
  AxiosResponse<ApiResponse<Author[]>>
> => apiClient.get('/authors/all');

export const createAuthorService = (
  author: Pick<Author, 'name'>
): Promise<AxiosResponse<ApiResponse<Author>>> =>
  apiClient.post('/authors/add', author);

// --- User ---

export const registerUserService = (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<AxiosResponse<RegisterApiResponse>> =>
  apiClient.post('/register', userData);

export const loginUserService = (credentials: {
  email: string;
  password: string;
}): Promise<AxiosResponse<LoginApiResponse>> =>
  apiClient.post('/login', credentials);

export const getUserService = (): Promise<AxiosResponse<ApiResponse<User>>> =>
  apiClient.get('/users/me');

export const logoutUserService = (): Promise<
  AxiosResponse<ApiResponse<null>>
> => apiClient.delete('/logout');

// --- Enrollments ---

export const enrollCourseService = (
  courseId: string
): Promise<AxiosResponse<ApiResponse<Enrollment>>> =>
  apiClient.post('/enrollments', { courseId });

export const getEnrollmentsService = (): Promise<
  AxiosResponse<ApiResponse<Enrollment[]>>
> => apiClient.get('/enrollments');
