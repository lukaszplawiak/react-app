import React, { useState } from 'react';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';

function Courses(props) {
	const [filteredCourses, setFilteredCourses] = useState(props.courses);

	const handleSearch = (query) => {
		const filtered = props.courses.filter(
			(course) =>
				course.title.toLowerCase().includes(query.toLowerCase()) ||
				course.id.toString().includes(query)
		);
		setFilteredCourses(filtered);
	};

	return (
		<div class='Courses'>
			<SearchBar onSearch={handleSearch} />
			{filteredCourses.map((course) => (
				<CourseCard key={course.id} course={course} authors={props.authors} />
			))}
			<Button label='Add New Course' />
		</div>
	);
}

export default Courses;
