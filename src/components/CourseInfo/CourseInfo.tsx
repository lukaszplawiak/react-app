import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import formatCreationDate from '../../helpers/formatCreationDate';
import getCourseDuration from '../../helpers/getCourseDuration';
import getAuthorNames from '../../helpers/getAuthorNames';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';
import Button from '../../common/Button/Button';
import { selectCourses, selectCoursesStatus, selectCoursesError } from '../../store/courses/selectors';
import { selectAuthors, selectAuthorsStatus } from '../../store/authors/selectors';
import { selectIsAdmin } from '../../store/user/selectors';
import { selectIsEnrolled } from '../../store/enrollments/selectors';
import { enrollCourse } from '../../store/enrollments/thunk';
import { fetchCourses } from '../../store/courses/thunk';
import { COURSE_INFO_LOADING_MESSAGE, COURSE_INFO_NOT_FOUND_MESSAGE } from '../../constants';
import type { AppDispatch, RootState } from '../../store';
import './CourseInfo.css';

function CourseInfo() {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const coursesStatus = useSelector(selectCoursesStatus);
  const coursesError = useSelector(selectCoursesError);
  const authorsStatus = useSelector(selectAuthorsStatus);
  const courses = useSelector(selectCourses);
  const authors = useSelector(selectAuthors);
  const isAdmin = useSelector(selectIsAdmin);

  const isEnrolled = useSelector((state: RootState) =>
    selectIsEnrolled(state, courseId ?? '')
  );

  const [enrollError, setEnrollError] = useState<string | null>(null);

  const isLoading = coursesStatus === 'loading' || authorsStatus === 'loading';
  const hasFailed = coursesStatus === 'failed';

  const handleRetry = (): void => {
    dispatch(fetchCourses());
  };

  // Previously: dispatch result was ignored — API errors silently dropped.
  // Now matches the CourseCard pattern: check rejected action and surface the error.
  const handleEnroll = async (): Promise<void> => {
    if (!courseId) return;
    setEnrollError(null);
    const result = await dispatch(enrollCourse(courseId));
    if (enrollCourse.rejected.match(result)) {
      setEnrollError(
        result.payload || 'Failed to enroll. Please try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="Course-all">
        <p>{COURSE_INFO_LOADING_MESSAGE}</p>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className="Course-all">
        <ErrorMessage message={coursesError} onRetry={handleRetry} />
      </div>
    );
  }

  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="Course-all">
        <p>{COURSE_INFO_NOT_FOUND_MESSAGE}</p>
        <Button label="Back to Courses" to="/courses" />
      </div>
    );
  }

  const authorNames =
    getAuthorNames(course.authors, authors) || 'No authors assigned';

  return (
    <div className="Course-all">
      <div className="course-detail-panel">
        <h2>{course.title}</h2>
        <div className="Course-info">
          <div className="Course-des">
            <p>
              <strong>Description: </strong>
              {course.description}
            </p>
          </div>
          <div className="Course-det">
            <p><strong>ID: </strong>{course.id}</p>
            <p><strong>Duration: </strong>{getCourseDuration(course.duration)}</p>
            <p><strong>Authors: </strong>{authorNames}</p>
            <p><strong>Creation Date: </strong>{formatCreationDate(course.creationDate)}</p>
          </div>
        </div>
        {!isAdmin && (
          <>
            <Button
              label={isEnrolled ? 'Enrolled ✓' : 'Enroll in this course'}
              className={`enroll-button${isEnrolled ? ' enroll-button--enrolled' : ''}`}
              onClick={handleEnroll}
              disabled={isEnrolled}
            />
            {enrollError && (
              <p className="enroll-error">{enrollError}</p>
            )}
          </>
        )}
      </div>
      <Button label="Back to Courses" to="/courses" />
    </div>
  );
}

export default CourseInfo;