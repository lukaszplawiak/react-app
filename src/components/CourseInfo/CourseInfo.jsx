import React from 'react';
import Button from '../../common/Button/Button';
import './CourseInfo.css';

function CourseInfo(props) {
	const { course, authorsList } = props;

	const authorNames = course.authors
		.map((authorId) => {
			const author = authorsList.find((a) => a.id === authorId);
			return author ? author.name : '';
		})
		.join(', ');

	return (
		<div className='Course-all'>
			<div className='Course-all2'>
				<h2>{course.title}</h2>
				<div className='Course-info'>
					<div className='Course-des'>
						<p>Description: {course.description}</p>
					</div>
					<div className='Course-det'>
						<p>ID: {course.id}</p>
						<p>Duration: {course.duration} minutes</p>
						<p>Authors: {authorNames}</p>
						<p>Creation Date: {course.creationDate}</p>
					</div>
				</div>
			</div>
			<Button label='BACK TO COURSES' onClick={props.goBack} />
		</div>
	);
}

export default CourseInfo;
