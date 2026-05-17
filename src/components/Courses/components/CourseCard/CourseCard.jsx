import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../../common/Button/Button';
import formatCreationDate from '../../../../helpers/formatCreationDate';
import getCourseDuration from '../../../../helpers/getCourseDuration';
import getAuthorNames from '../../../../helpers/getAuthorNames';
import { enrollCourse } from '../../../../store/enrollments/thunk';
import { selectIsEnrolled } from '../../../../store/enrollments/selectors';
import './CourseCard.css';

function CourseCard({
  course,
  authors,
  isAdmin,
  onCourseSelect,
  onDelete,
  onUpdate,
}) {
  const dispatch = useDispatch();
  const isEnrolled = useSelector(selectIsEnrolled(course.id));

  const handleEnroll = () => {
    dispatch(enrollCourse(course.id));
  };

  return (
    <div className="Course-card">
      <div className="Course-rect">
        <div className="Course-info">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
        <div className="Course-details">
          <div className="Course-details-info">
            <p>Authors: {getAuthorNames(course.authors, authors, { truncate: true })}</p>
            <p>Duration: {getCourseDuration(course.duration)}</p>
            <p>Creation date: {formatCreationDate(course.creationDate)}</p>
          </div>
          <Button
            label="SHOW COURSE"
            className="Course-button"
            onClick={() => onCourseSelect(course)}
          />
          {isAdmin ? (
            <>
              <Button
                label="DELETE"
                className="Course-button"
                onClick={() => onDelete(course.id)}
              />
              <Button
                label="UPDATE"
                className="Course-button"
                onClick={() => onUpdate(course.id)}
              />
            </>
          ) : (
            <Button
              label={isEnrolled ? 'Enrolled ✓' : 'Enroll'}
              className={`Course-button${isEnrolled ? ' Course-button--enrolled' : ''}`}
              onClick={handleEnroll}
              disabled={isEnrolled}
            />
          )}
        </div>
      </div>
    </div>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    creationDate: PropTypes.string,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onCourseSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default CourseCard;