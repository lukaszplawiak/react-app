import axios from 'axios';
import { API_BASE_URL } from './config';

const baseURL = API_BASE_URL;

export const getCoursesService = () => axios.get(`${baseURL}/courses/all`);

export const createCourseService = (course) =>
  axios.post(`${baseURL}/courses/add`, course, {
    headers: {
      Authorization: localStorage.getItem('userToken'),
      'Content-Type': 'application/json',
    },
  });

export const deleteCourseService = (courseId) =>
  axios.delete(`${baseURL}/courses/${courseId}`, {
    headers: {
      Authorization: localStorage.getItem('userToken'),
      'Content-Type': 'application/json',
    },
  });

export const updateCourseService = (course) =>
  axios.put(`${baseURL}/courses/${course.id}`, course, {
    headers: {
      Authorization: localStorage.getItem('userToken'),
      'Content-Type': 'application/json',
    },
  });

export const getAuthorsService = () => axios.get(`${baseURL}/authors/all`);

export const createAuthorService = (author) =>
  axios.post(`${baseURL}/authors/add`, author, {
    headers: {
      Authorization: localStorage.getItem('userToken'),
      'Content-Type': 'application/json',
    },
  });

export const loginUserService = (user) => axios.post(`${baseURL}/login`, user);

export const getUserService = () =>
  axios.get(`${baseURL}/users/me`, {
    headers: {
      Authorization: localStorage.getItem('userToken'),
      'Content-Type': 'application/json',
    },
  });

export const logoutUserService = () =>
  axios.delete(`${baseURL}/logout`, {
    headers: {
      Authorization: localStorage.getItem('userToken'),
      'Content-Type': 'application/json',
    },
  });
