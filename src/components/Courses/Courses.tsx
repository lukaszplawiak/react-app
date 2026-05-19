import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';
import EmptyCourseList from './components/EmptyCourseList';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';
import { selectIsAdmin } from '../../store/user/selectors';
import { selectCourses, selectCoursesStatus, selectCoursesError } from '../../store/courses/selectors';
import { selectAuthors, selectAuthorsStatus } from '../../store/authors/selectors';
import { fetchCourses, deleteCourse } from '../../store/courses/thunk';
import { ADD_NEW_COURSE_LABEL } from '../../constants';
import type { AppDispatch } from '../../store';
import type { Course } from '../../types';
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

  const handleAddNewCourse = (): void => navigate('/courses/add');

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
        {isAdmin && (
          <div className="Courses-toolbar-actions">
            <Button
              label="Enrolled Students"
              className="ButtonEnrolled"
              onClick={() => navigate('/enrolled')}
            />
          </div>
        )}
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