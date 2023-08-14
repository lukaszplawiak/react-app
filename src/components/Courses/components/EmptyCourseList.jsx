import React from 'react';
import Button from './Button';

function EmptyCourseList() {
	return (
		<div className='empty-course-list'>
			<h2>Course List is Empty</h2>
			<p>Please use "Add New Course" button to add your first course</p>
			<Button title='Add New Course' />
		</div>
	);
}

export default EmptyCourseList;
