import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../common/Button/Button';

function EmptyCourseList({ isAdmin }) {
	const navigate = useNavigate();

	return (
		<div className='empty-course-list'>
			<h2>Course List is Empty</h2>
			<p>Please use "Add New Course" button to add your first course</p>
			{isAdmin ? (
				<Button
					label='Add New Course'
					onClick={() => navigate('/courses/add')}
				/>
			) : (
				<p>
					You don't have permissions to create a course. Please log in as ADMIN
				</p>
			)}
		</div>
	);
}

export default EmptyCourseList;
