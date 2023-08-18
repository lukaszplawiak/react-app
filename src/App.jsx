import React, { useState } from 'react';
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
	const defaultPath = localStorage.getItem('token') ? '/courses' : '/login';

	const [courses, setCourses] = useState(mockedCoursesList);
	const [authors, setAuthors] = useState(mockedAuthorsList);

	const addCourse = (newCourse) => {
		setCourses((prevCourses) => [...prevCourses, newCourse]);
	};

	const addAuthor = (newAuthor) => {
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
				<Route path='/login' element={<Login />} />
				<Route
					path='/courses/add'
					element={
						<CreateCourse
							addCourse={addCourse}
							addAuthor={addAuthor}
							authors={authors}
						/>
					}
				/>
				<Route
					path='/courses/:courseId'
					element={<CourseInfo courses={courses} authorsList={authors} />}
				/>
				<Route
					path='/courses'
					element={<Courses courses={courses} authors={authors} />}
				/>
			</Routes>
		</div>
	);
}

export default App;
