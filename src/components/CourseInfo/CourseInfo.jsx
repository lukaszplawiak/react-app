import { BACK_TO_COURSES_LABEL } from '../../common/Constants/Constants';

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
			<Button label={BACK_TO_COURSES_LABEL} onClick={props.onGoBack} />
		</div>
	);
}

export default CourseInfo;
