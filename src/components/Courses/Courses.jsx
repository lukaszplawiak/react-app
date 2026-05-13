import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';
import EmptyCourseList from './components/EmptyCourseList';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';
import { selectIsAdmin } from '../../store/user/selectors';
import {
  selectCourses,
  selectCoursesStatus,
  selectCoursesError,
} from '../../store/courses/selectors';
import { selectAuthors, selectAuthorsStatus } from '../../store/authors/selectors';
import { fetchCourses } from '../../store/courses/thunk';
import { ADD_NEW_COURSE_LABEL } from '../../constants/ui';
import './Courses.css';

function Courses() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  const courses = useSelector(selectCourses);
  const authors = useSelector(selectAuthors);
  const coursesStatus = useSelector(selectCoursesStatus);
  const coursesError = useSelector(selectCoursesError);
  const authorsStatus = useSelector(selectAuthorsStatus);
  const isLoading = coursesStatus === 'loading' || authorsStatus === 'loading';
  const hasFailed = coursesStatus === 'failed';

  const [query, setQuery] = useState('');

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) =>
        course.title.toLowerCase().includes(query.toLowerCase())
      ),
    [courses, query]
  );

  const handleAddNewCourse = () => {
    navigate('/courses/add');
  };

  const handleCourseSelect = (course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleRetry = () => {
    dispatch(fetchCourses());
  };

  if (isLoading) {
    return (
      <div className="Courses">
        <p className="loading-message">Loading courses...</p>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className="Courses">
        <ErrorMessage message={coursesError} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="Courses">
      <SearchBar value={query} onSearch={setQuery} />
      {filteredCourses.length > 0 ? (
        filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            authors={authors}
            onCourseSelect={handleCourseSelect}
          />
        ))
      ) : (
        <EmptyCourseList isAdmin={isAdmin} />
      )}
      {isAdmin && (
        <Button
          label={ADD_NEW_COURSE_LABEL}
          className="ButtonAdd"
          onClick={handleAddNewCourse}
        />
      )}
    </div>
  );
}

export default Courses;