import { ADD_NEW_COURSE_LABEL } from '../../common/Constants/Constants';

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';
import EmptyCourseList from './components/EmptyCourseList';

import './Courses.css';

function Courses({ courses, authors }) {
	const [query, setQuery] = useState('');
	const navigate = useNavigate();

	const handleSearch = (inputQuery) => {
		setQuery(inputQuery);
	};

	const filteredCourses = useMemo(() => {
		return courses.filter(
			(course) =>
				course.title.toLowerCase().includes(query.toLowerCase()) ||
				course.id.toString().includes(query)
		);
	}, [courses, query]);

	const handleAddNewCourse = () => {
		navigate('/courses/add');
	};

	const handleCourseSelect = (course) => {
		navigate(`/courses/${course.id}`);
	};

	return (
		<div className='Courses'>
			<SearchBar onSearch={handleSearch} />
			{filteredCourses.length > 0 ? (
				filteredCourses.map((course) => (
					<CourseCard
						key={course.id}
						course={course}
						authors={authors}
						onCourseSelect={handleCourseSelect}
					/>
				))
			) : (
				<EmptyCourseList />
			)}
			<Button label={ADD_NEW_COURSE_LABEL} onClick={handleAddNewCourse} />
		</div>
	);
}

export default Courses;
