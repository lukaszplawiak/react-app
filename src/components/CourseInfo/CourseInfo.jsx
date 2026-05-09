import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import formatCreationDate from '../../helpers/formatCreationDate';
import getCourseDuration from '../../helpers/getCourseDuration';
import './CourseInfo.css';

function CourseInfo() {
  const { courseId } = useParams();
  const courses = useSelector((state) => state.courses.courses);
  const authors = useSelector((state) => state.authors.authors);

  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return <p>Course not found</p>;
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
      <div className="Course-all2">
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