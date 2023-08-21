import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../common/Button/Button';

function EmptyCourseList() {
	const navigate = useNavigate();

	return (
		<div className='empty-course-list'>
			<h2>Course List is Empty</h2>
			<p>Please use "Add New Course" button to add your first course</p>
			<Button title='Add New Course' onClick={() => navigate('/courses/add')} />
		</div>
	);
}

export default EmptyCourseList;
