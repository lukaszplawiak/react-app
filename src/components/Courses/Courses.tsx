import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import {
  selectAuthors,
  selectAuthorsStatus,
} from '../../store/authors/selectors';
import {
  selectCourses,
  selectCoursesError,
  selectCoursesStatus,
} from '../../store/courses/selectors';
import { deleteCourse, fetchCourses } from '../../store/courses/thunk';
import { selectIsAdmin } from '../../store/user/selectors';

import CourseCard from './components/CourseCard/CourseCard';
import EmptyCourseList from './components/EmptyCourseList';
import SearchBar from './components/SearchBar/SearchBar';

import Button from '../../common/Button/Button';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';

import { ADD_NEW_COURSE_LABEL } from '../../constants';
import type { Course } from '../../types';

import type { AppDispatch } from '../../store';
import './Courses.css';

function Courses() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  const courses = useSelector(selectCourses);
  const authors = useSelector(selectAuthors);
  const coursesStatus = useSelector(selectCoursesStatus);
  const coursesError = useSelector(selectCoursesError);
  const authorsStatus = useSelector(selectAuthorsStatus);
  const isLoading = coursesStatus === 'loading' || authorsStatus === 'loading';
  const hasFailed = coursesStatus === 'failed';

  const [query, setQuery] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) =>
        course.title.toLowerCase().includes(query.toLowerCase())
      ),
    [courses, query]
  );

  const handleAddNewCourse = () => navigate('/courses/add');

  const handleCourseSelect = (course: Course): void => {
    navigate(`/courses/${course.id}`);
  };

  const handleDelete = async (courseId: string): Promise<void> => {
    setDeleteError(null);
    const result = await dispatch(deleteCourse(courseId));
    if (deleteCourse.rejected.match(result)) {
      setDeleteError(
        result.payload || 'Failed to delete course. Please try again.'
      );
    }
  };

  const handleUpdate = (courseId: string): void => {
    navigate(`/courses/update/${courseId}`);
  };

  const handleRetry = (): void => {
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
      <div className="Courses-toolbar">
        <SearchBar value={query} onSearch={setQuery} />
      </div>
      {deleteError && (
        <ErrorMessage
          message={deleteError}
          onRetry={() => setDeleteError(null)}
        />
      )}
      {filteredCourses.length > 0 ? (
        filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            authors={authors}
            isAdmin={isAdmin}
            onCourseSelect={handleCourseSelect}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
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
