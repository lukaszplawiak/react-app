import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';
import EmptyCourseList from './components/EmptyCourseList';
import { ADD_NEW_COURSE_LABEL } from '../../common/Constants/Constants';
import { deleteCourse } from '../../store/courses/actions';
import './Courses.css';

function Courses() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const courses = useSelector((state) => state.courses.courses);
	const authors = useSelector((state) => state.authors.authors);
	const user = useSelector((state) => state.user);
	const [query, setQuery] = useState('');

	const handleSearch = (inputQuery) => {
		setQuery(inputQuery);
	};

	const handleDeleteCourse = (courseId) => {
		dispatch(deleteCourse(courseId));
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
						onDelete={handleDeleteCourse}
					/>
				))
			) : (
				<EmptyCourseList isAdmin={user.isAdmin} />
			)}
			{user.isAdmin && (
				<Button label={ADD_NEW_COURSE_LABEL} onClick={handleAddNewCourse} />
			)}
		</div>
	);
}

export default Courses;
