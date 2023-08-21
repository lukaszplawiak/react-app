import React from 'react';
import { useParams, Link } from 'react-router-dom';

import './CourseInfo.css';

function CourseInfo({ courses, authorsList }) {
	const { courseId } = useParams();

	const course = courses.find((c) => c.id === courseId);

	if (!course) {
		return <p>Course not found</p>;
	}

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
						<p>
							<strong>Description: </strong>
							{course.description}
						</p>
					</div>
					<div className='Course-det'>
						<p>
							<strong>ID: </strong>
							{course.id}
						</p>
						<p>
							<strong>Duration: </strong>
							{course.duration} minutes
						</p>
						<p>
							<strong>Authors: </strong>
							{authorNames}
						</p>
						<p>
							<strong>Creation Date: </strong>
							{course.creationDate}
						</p>
					</div>
				</div>
			</div>
			<Link to='/courses' className='back-button'>
				Back to Courses
			</Link>
		</div>
	);
}

export default CourseInfo;
