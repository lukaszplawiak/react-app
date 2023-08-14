import React from 'react';
import Button from '../../common/Button/Button';

function CourseInfo(props) {
	const { course, authorsList } = props;

	const authorNames = course.authors
		.map((authorId) => {
			const author = authorsList.find((a) => a.id === authorId);
			return author ? author.name : '';
		})
		.join(', ');

	return (
		<div className='course-info'>
			<h2>{course.title}</h2>
			<p>ID: {course.id}</p>
			<p>Description: {course.description}</p>
			<p>Duration: {course.duration} minutes</p>
			<p>Authors: {authorNames}</p>
			<p>Creation Date: {course.creationDate}</p>
			<Button title='Back to Courses' onClick={props.goBack} />
		</div>
	);
}

export default CourseInfo;
