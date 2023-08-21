import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import Header from './components/Header/Header';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';
import { mockedCoursesList, mockedAuthorsList } from './components/mockedData';
import Registration from './components/Registration/Registration';
import Login from './components/Login/Login';
import CreateCourse from './components/CreateCourse/CreateCourse';

import './App.css';

function App() {
	const defaultPath = localStorage.getItem('userToken') ? '/courses' : '/login';

	const [isLoggedIn, setIsLoggedIn] = useState(
		!!localStorage.getItem('userToken')
	);

	const handleLogin = (email) => {
		setIsLoggedIn(true);
		setIsAdmin(email === 'admin@email.com');
	};

	const [isAdmin, setIsAdmin] = useState(
		localStorage.getItem('email') === 'admin@email.com'
	);

	useEffect(() => {
		setIsAdmin(localStorage.getItem('email') === 'admin@email.com');
	}, [isLoggedIn]);

	const [courses, setCourses] = useState(mockedCoursesList);
	const [authors, setAuthors] = useState(mockedAuthorsList);

	const onAddCourse = (newCourse) => {
		setCourses((prevCourses) => [...prevCourses, newCourse]);
	};

	const onAddAuthor = (newAuthor) => {
		if (!newAuthor.id || !newAuthor.name) {
			console.error('New Author with wrong format!');
			return;
		}
		setAuthors((prevAuthors) => [...prevAuthors, newAuthor]);
	};

	return (
		<div className='App'>
			<div className='Rectangle'>
				<Header />
			</div>
			<Routes>
				<Route path='/' element={<Navigate to={defaultPath} />} />
				<Route path='/registration' element={<Registration />} />
				<Route path='/login' element={<Login onLogin={handleLogin} />} />
				<Route
					path='/courses'
					element={
						isLoggedIn ? (
							<Courses courses={courses} authors={authors} isAdmin={isAdmin} />
						) : (
							<Navigate to='/login' />
						)
					}
				/>
				<Route
					path='/courses/add'
					element={
						isLoggedIn && isAdmin ? (
							<CreateCourse
								addCourse={onAddCourse}
								addAuthor={onAddAuthor}
								authors={authors}
							/>
						) : (
							<Navigate to='/login' />
						)
					}
				/>
				<Route
					path='/courses/:courseId'
					element={
						isLoggedIn ? (
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
