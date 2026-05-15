import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import formatCreationDate from '../../helpers/formatCreationDate';
import getCourseDuration from '../../helpers/getCourseDuration';
import getAuthorNames from '../../helpers/getAuthorNames';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';
import {
  selectCourses,
  selectCoursesStatus,
  selectCoursesError,
} from '../../store/courses/selectors';
import { selectAuthors, selectAuthorsStatus } from '../../store/authors/selectors';
import { fetchCourses } from '../../store/courses/thunk';
import {
  COURSE_INFO_LOADING_MESSAGE,
  COURSE_INFO_NOT_FOUND_MESSAGE,
} from '../../constants';
import './CourseInfo.css';

function CourseInfo() {
  const { courseId } = useParams();
  const dispatch = useDispatch();

  const coursesStatus = useSelector(selectCoursesStatus);
  const coursesError = useSelector(selectCoursesError);
  const authorsStatus = useSelector(selectAuthorsStatus);
  const courses = useSelector(selectCourses);
  const authors = useSelector(selectAuthors);

  const isLoading = coursesStatus === 'loading' || authorsStatus === 'loading';
  const hasFailed = coursesStatus === 'failed';

  const handleRetry = () => {
    dispatch(fetchCourses());
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
        <Link to="/courses" className="back-button">
          Back to Courses
        </Link>
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
            <p>
              <strong>ID: </strong>
              {course.id}
            </p>
            <p>
              <strong>Duration: </strong>
              {getCourseDuration(course.duration)}
            </p>
            <p>
              <strong>Authors: </strong>
              {authorNames}
            </p>
            <p>
              <strong>Creation Date: </strong>
              {formatCreationDate(course.creationDate)}
            </p>
          </div>
        </div>
      </div>
      <Link to="/courses" className="back-button">
        Back to Courses
      </Link>
    </div>
  );
}

export default CourseInfo;