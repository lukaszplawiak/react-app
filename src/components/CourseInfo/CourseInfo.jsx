import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import formatCreationDate from '../../helpers/formatCreationDate';
import getCourseDuration from '../../helpers/getCourseDuration';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';
import { fetchCourses } from '../../store/courses/thunk';
import {
  COURSE_INFO_LOADING_MESSAGE,
  COURSE_INFO_NOT_FOUND_MESSAGE,
} from '../../constants/ui';
import './CourseInfo.css';

function CourseInfo() {
  const { courseId } = useParams();
  const dispatch = useDispatch();

  const coursesStatus = useSelector((state) => state.courses.status);
  const coursesError = useSelector((state) => state.courses.error);
  const authorsStatus = useSelector((state) => state.authors.status);
  const courses = useSelector((state) => state.courses.courses);
  const authors = useSelector((state) => state.authors.authors);

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

  const authorNames = course.authors
    .map((authorId) => {
      const author = authors.find((a) => a.id === authorId);
      return author ? author.name : null;
    })
    .filter(Boolean)
    .join(', ');

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
              {authorNames || 'No authors assigned'}
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