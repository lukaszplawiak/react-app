import axios from 'axios';

const baseURL = 'http://localhost:4000';

export const getCoursesService = () => axios.get(`${baseURL}/courses/all`);

export const createCourseService = (course, token) =>
	axios.post(`${baseURL}/courses/add`, course, {
		headers: {
			Authorization: `${token}`,
			'Content-Type': 'application/json',
		},
	});

export const deleteCourseService = (courseId, token) =>
	axios.delete(`${baseURL}/courses/${courseId}`, {
		headers: {
			Authorization: `${token}`,
			'Content-Type': 'application/json',
		},
	});

export const getAuthorsService = () => axios.get(`${baseURL}/authors/all`);

export const createAuthorService = (author, token) =>
	axios.post(`${baseURL}/authors/add`, author, {
		headers: {
			Authorization: `${token}`,
			'Content-Type': 'application/json',
		},
	});

export const loginUserService = (user) => axios.post(`${baseURL}/login`, user);

export const getUserService = (user) =>
	axios.get(`${baseURL}/users/me`, {
		headers: {
			Authorization: `Bearer ${user.token}`,
			'Content-Type': 'application/json',
		},
	});

export const logoutUserService = (token) =>
	axios.post(`${baseURL}/logout`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	});
