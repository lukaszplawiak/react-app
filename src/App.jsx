import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Header from './components/Header/Header';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';
import Registration from './components/Registration/Registration';
import Login from './components/Login/Login';
import CreateCourse from './components/CreateCourse/CreateCourse';
import { fetchCourses } from './store/courses/actions';
import { fetchAuthors } from './store/authors/actions';

import './App.css';

function App() {
	const dispatch = useDispatch();
	const { user, courses, authors } = useSelector((state) => ({
		user: state.user,
		courses: state.courses.courses,
		authors: state.authors.authors,
	}));
	const userToken = localStorage.getItem('userToken');
	const defaultPath = userToken ? '/courses' : '/login';

	useEffect(() => {
		dispatch(fetchCourses());
		dispatch(fetchAuthors());
	}, [dispatch]);

	return (
		<div className='App'>
			<div className='Rectangle'>
				<Header />
			</div>
			<Routes>
				<Route path='/' element={<Navigate to={defaultPath} />} />
				<Route path='/registration' element={<Registration />} />
				<Route path='/login' element={<Login />} />
				<Route
					path='/courses'
					element={
						user.isAuth ? (
							<Courses
								courses={courses}
								authors={authors}
								isAdmin={user.email === 'admin@email.com'}
							/>
						) : (
							<Navigate to='/login' />
						)
					}
				/>
				<Route
					path='/courses/add'
					element={
						user.isAuth && user.isAdmin ? (
							<CreateCourse />
						) : (
							<Navigate to='/login' />
						)
					}
				/>
				<Route
					path='/courses/:courseId'
					element={
						user.isAuth ? (
							<CourseInfo courses={courses} authorsList={authors} />
						) : (
							<Navigate to='/login' />
						)
					}
				/>
			</Routes>
		</div>
	);
}

export default App;
