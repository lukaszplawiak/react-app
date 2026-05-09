import axios from 'axios';
import { API_BASE_URL } from './config';

const baseURL = API_BASE_URL;

const authHeaders = () => ({
  Authorization: localStorage.getItem('userToken'),
  'Content-Type': 'application/json',
});

// --- Courses ---

export const getCoursesService = () =>
  axios.get(`${baseURL}/courses/all`);

export const createCourseService = (course) =>
  axios.post(`${baseURL}/courses/add`, course, { headers: authHeaders() });

export const deleteCourseService = (courseId) =>
  axios.delete(`${baseURL}/courses/${courseId}`, { headers: authHeaders() });

export const updateCourseService = (course) =>
  axios.put(`${baseURL}/courses/${course.id}`, course, {
    headers: authHeaders(),
  });

// --- Authors ---

export const getAuthorsService = () =>
  axios.get(`${baseURL}/authors/all`);

export const createAuthorService = (author) =>
  axios.post(`${baseURL}/authors/add`, author, { headers: authHeaders() });

// --- User ---

export const registerUserService = (userData) =>
  axios.post(`${baseURL}/register`, userData);

export const loginUserService = (credentials) =>
  axios.post(`${baseURL}/login`, credentials);

export const getUserService = () =>
  axios.get(`${baseURL}/users/me`, { headers: authHeaders() });

export const logoutUserService = () =>
  axios.delete(`${baseURL}/logout`, { headers: authHeaders() });