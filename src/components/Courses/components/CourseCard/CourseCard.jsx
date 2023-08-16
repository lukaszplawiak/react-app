import React from 'react';
import './CourseCard.css';

const formatDuration = (duration) => {
	const hours = Math.floor(duration / 60);
	const minutes = duration % 60;
	const formattedHours = hours < 10 ? '0' + hours : hours;
	const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
	const label = hours === 1 ? 'hour' : 'hours';

	return `${formattedHours}:${formattedMinutes} ${label}`;
};

const formatCreationDate = (date) => {
	const d = new Date(date);
	return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
};

function CourseCard({ course, authors, onCourseSelect }) {
	const getAuthors = (courseAuthors) => {
		if (!courseAuthors || !authors) {
			return '';
		}

		const names = courseAuthors
			.map((authorId) => {
				const author = authors.find((a) => a.id === authorId);
				return author ? author.name : null;
			})
			.filter(Boolean)
			.join(', ');

		return names.length > 30 ? names.substr(0, 27) + '...' : names;
	};

	return (
		<div className='Course-card'>
			<div className='Course-rect'>
				<div className='Course-info'>
					<h3>{course.title}</h3>
					<p>{course.description}</p>
				</div>
				<div className='Course-details'>
					<div className='Course-details-info'>
						<p>
							<strong>Authors: </strong> {getAuthors(course.authors)}
						</p>
						<p>
							<strong>Duration: </strong> {formatDuration(course.duration)}
						</p>
						<p>
							<strong>Creation date: </strong>{' '}
							{formatCreationDate(course.creationDate)}
						</p>
					</div>
					<button
						className='Course-button'
						onClick={() => {
							onCourseSelect(course);
						}}
					>
						SHOW COURSE
					</button>
				</div>
			</div>
		</div>
	);
}

export default CourseCard;
