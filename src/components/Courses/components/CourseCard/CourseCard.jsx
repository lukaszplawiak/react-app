import React from 'react';

function CourseCard({ course, authors }) {
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
		<div className='course-card'>
			<h3>{course.title}</h3>
			<p>Duration: {formatDuration(course.duration)}</p>
			<p>Creation date: {formatCreationDate(course.creationDate)}</p>
			<p>Description: {course.description}</p>
			<p>Authors: {getAuthors(course.authors)}</p>
			<button
				onClick={() => {
					// moja logika klikniecia
				}}
			>
				Show course
			</button>
		</div>
	);
}

export default CourseCard;
