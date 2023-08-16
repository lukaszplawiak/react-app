import { ADD_NEW_COURSE_LABEL } from '../../common/Constants/Constants';

import React, { useState, useMemo } from 'react';

import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';

import './Courses.css';

function Courses(props) {
	const [query, setQuery] = useState('');

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

	return (
		<div className='Courses'>
			<SearchBar onSearch={handleSearch} />
			{filteredCourses.map((course) => (
				<CourseCard
					key={course.id}
					course={course}
					authors={props.authors}
					onCourseSelect={props.onCourseSelect}
				/>
			))}
			<Button label={ADD_NEW_COURSE_LABEL} />
		</div>
	);
}

export default Courses;
