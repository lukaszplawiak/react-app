import React from 'react';

function EmptyCourseList({ isAdmin }) {
	return (
		<div className='empty-course-list'>
			<h2>Course List is Empty</h2>
			<p>Please use "Add New Course" button to add your first course</p>
			{!isAdmin && (
				<p>
					You don't have permissions to create a course. Please log in as ADMIN
				</p>
			)}
		</div>
	);
}

export default EmptyCourseList;
