import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import { mockedCoursesList, mockedAuthorsList } from './components/mockedData';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';

function App() {
	const [selectedCourse, setSelectedCourse] = useState(null);

	const handleShowCourseInfo = (course) => {
		setSelectedCourse(course);
	};

	const handleBackToCourses = () => {
		setSelectedCourse(null);
	};
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
						goBack={handleBackToCourses}
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
