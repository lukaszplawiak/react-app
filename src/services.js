import axios from 'axios';
import { API_BASE_URL } from './config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      window.location.href = '/login';
    }

    /**
     * Log API errors in development only.
     * In production, errors should be sent to a monitoring service
     * (e.g. Sentry, Datadog) — not logged to the browser console
     * where they are visible to anyone with DevTools open.
     *
     * Production example:
     *   Sentry.captureException(error);
     */
    if (import.meta.env.MODE === 'development') {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} — ${status ?? 'network error'}`,
        error.message
      );
    }

    return Promise.reject(error);
  }
);

// --- Courses ---

export const getCoursesService = () =>
  apiClient.get('/courses/all');

export const createCourseService = (course) =>
  apiClient.post('/courses/add', course);

export const deleteCourseService = (courseId) =>
  apiClient.delete(`/courses/${courseId}`);

export const updateCourseService = (course) =>
  apiClient.put(`/courses/${course.id}`, course);

// --- Authors ---

export const getAuthorsService = () =>
  apiClient.get('/authors/all');

export const createAuthorService = (author) =>
  apiClient.post('/authors/add', author);

// --- User ---

export const registerUserService = (userData) =>
  apiClient.post('/register', userData);

export const loginUserService = (credentials) =>
  apiClient.post('/login', credentials);

export const getUserService = () =>
  apiClient.get('/users/me');

export const logoutUserService = () =>
  apiClient.delete('/logout');