import axios from 'axios';

export const getCoursesService = () =>
	axios.get('http://localhost:4000/courses/all');
export const createCourseService = (course) =>
	axios.post('http://localhost:4000/courses/add', course);
export const deleteCourseService = (courseId) =>
	axios.delete(`http://localhost:4000/courses/${courseId}`);

export const getAuthorsService = () =>
	axios.get('http://localhost:4000/authors/all');
export const createAuthorService = (author, token) =>
	axios.post('http://localhost:4000/authors/add', author, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	});

export const loginUserService = (user) =>
	axios.post('http://localhost:4000/login', user);
