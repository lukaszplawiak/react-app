import React, { useState } from 'react';

import Header from './components/Header/Header';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';
import { mockedCoursesList, mockedAuthorsList } from './components/mockedData';

import './App.css';

function App() {
	const [selectedCourseId, setSelectedCourseId] = useState(null);

	const handleShowCourseInfo = (course) => {
		setSelectedCourseId(course.id);
	};

	const handleBackToCourses = () => {
		setSelectedCourseId(null);
	};

	const selectedCourse = mockedCoursesList.find(
		(course) => course.id === selectedCourseId
	);

	return (
		<div className='App'>
			<div className='Rectangle'>
				<Header />
			</div>
			<div>
				{selectedCourse ? (
					<CourseInfo
						course={selectedCourse}
						authorsList={mockedAuthorsList}
						onGoBack={handleBackToCourses}
					/>
				) : (
					<Courses
						courses={mockedCoursesList}
						authors={mockedAuthorsList}
						onCourseSelect={handleShowCourseInfo}
					/>
				)}
			</div>
		</div>
	);
}

export default App;
