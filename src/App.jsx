import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Header from './components/Header/Header';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';
import Registration from './components/Registration/Registration';
import Login from './components/Login/Login';
import CourseForm from './components/CourseForm/CourseForm';
import { fetchCourses } from './store/courses/thunk';
import { fetchAuthors } from './store/authors/thunk';

import './App.css';

function App() {
	const dispatch = useDispatch();
	const { user, courses, authors } = useSelector((state) => ({
		user: state.user,
		courses: state.courses.courses,
		authors: state.authors.authors,
	}));

	const defaultPath = user && user.isAuth ? '/courses' : '/login';

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
					element={user.isAuth ? <Courses /> : <Navigate to='/login' />}
				/>
				<Route
					path='/courses/add'
					element={
						<PrivateRoute>
							<CourseForm />
						</PrivateRoute>
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
