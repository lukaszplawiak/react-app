// import React, { useState } from 'react';
// import CourseCard from './components/CourseCard/CourseCard';
// import SearchBar from './components/SearchBar/SearchBar';
// import Button from '../../common/Button/Button';
// import CourseInfo from '../CourseInfo/CourseInfo';
// import './Courses.css';

// function Courses(props) {
// 	const [filteredCourses, setFilteredCourses] = useState(props.courses);
// 	const [selectedCourse, setSelectedCourse] = useState(null);

// 	const handleSearch = (query) => {
// 		const filtered = props.courses.filter(
// 			(course) =>
// 				course.title.toLowerCase().includes(query.toLowerCase()) ||
// 				course.id.toString().includes(query)
// 		);
// 		setFilteredCourses(filtered);
// 	};

// 	const handleBack = () => {
// 		setSelectedCourse(null);
// 	};

// 	return (
// 		<div className='Courses'>
// 			<SearchBar onSearch={handleSearch} />
// 			{selectedCourse ? (
// 				// Jeśli wybrany kurs istnieje, pokaż jego szczegóły
// 				<CourseInfo
// 					course={selectedCourse}
// 					authorsList={props.authors}
// 					goBack={handleBack}
// 				/>
// 			) : (
// 				// W przeciwnym razie pokaż listę kursów
// 				<>
// 					{filteredCourses.map((course) => (
// 						<CourseCard
// 							key={course.id}
// 							course={course}
// 							authors={props.authors}
// 							onCourseSelect={setSelectedCourse} // <-- PRZEKAŻ FUNKCJĘ
// 						/>
// 					))}
// 					<Button label='ADD NEW COURSE' />
// 				</>
// 			)}
// 		</div>
// 	);
// }

// export default Courses;
import React, { useState } from 'react';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';
import CourseInfo from '../CourseInfo/CourseInfo';
import './Courses.css';

function Courses(props) {
	const [filteredCourses, setFilteredCourses] = useState(props.courses);
	const [selectedCourse, setSelectedCourse] = useState(null);

	const handleSearch = (query) => {
		const filtered = props.courses.filter(
			(course) =>
				course.title.toLowerCase().includes(query.toLowerCase()) ||
				course.id.toString().includes(query)
		);
		setFilteredCourses(filtered);
	};

	const handleBack = () => {
		console.log('handleBack is triggered');
		setSelectedCourse(null);
	};

	return (
		<div className='Courses'>
			<SearchBar onSearch={handleSearch} />
			{selectedCourse ? (
				<CourseInfo
					course={selectedCourse}
					authorsList={props.authors}
					goBack={handleBack}
				/>
			) : (
				<>
					{filteredCourses.map((course) => (
						<CourseCard
							key={course.id}
							course={course}
							authors={props.authors}
							onCourseSelect={setSelectedCourse}
						/>
					))}
					<Button label='ADD NEW COURSE' />
				</>
			)}
		</div>
	);
}

export default Courses;
