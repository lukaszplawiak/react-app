import { ADD_NEW_COURSE_LABEL } from '../../common/Constants/Constants';

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';

import './Courses.css';

function Courses(props) {
	const [query, setQuery] = useState('');
	const navigate = useNavigate();

	const handleSearch = (inputQuery) => {
		setQuery(inputQuery);
	};

	const filteredCourses = useMemo(() => {
		return props.courses.filter(
			(course) =>
				course.title.toLowerCase().includes(query.toLowerCase()) ||
				course.id.toString().includes(query)
		);
	}, [props.courses, query]);

	const handleAddNewCourse = () => {
		navigate('/courses/add');
	};

	const handleCourseSelect = (course) => {
		navigate(`/courses/${course.id}`);
	};

	return (
		<div className='Courses'>
			<SearchBar onSearch={handleSearch} />
			{filteredCourses.map((course) => (
				<CourseCard
					key={course.id}
					course={course}
					authors={props.authors}
					onCourseSelect={handleCourseSelect}
				/>
			))}
			<Button label={ADD_NEW_COURSE_LABEL} onClick={handleAddNewCourse} />
		</div>
	);
}

export default Courses;
