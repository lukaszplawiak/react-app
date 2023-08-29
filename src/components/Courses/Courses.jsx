import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';
import EmptyCourseList from './components/EmptyCourseList';
import { ADD_NEW_COURSE_LABEL } from '../../common/Constants/Constants';
import { deleteCourse } from '../../store/courses/thunk';
import { fetchUser } from '../../store/user/thunk';
import './Courses.css';

function Courses() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const courses = useSelector((state) => state.courses.courses);
	const authors = useSelector((state) => state.authors.authors);
	const user = useSelector((state) => state.user);
	const [query, setQuery] = useState('');

	useEffect(() => {
		dispatch(fetchUser());
		if (!user.isAuth) {
			navigate('/login');
		}
	}, [dispatch, user.isAuth, navigate]);

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
			{user.role === 'admin' && (
				<Button
					label={ADD_NEW_COURSE_LABEL}
					className='ButtonAdd'
					onClick={handleAddNewCourse}
				/>
			)}
		</div>
	);
}

export default Courses;
