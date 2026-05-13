import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../common/Button/Button';
import { deleteCourse } from '../../../../store/courses/thunk';
import formatCreationDate from '../../../../helpers/formatCreationDate';
import getCourseDuration from '../../../../helpers/getCourseDuration';
import getAuthorNames from '../../../../helpers/getAuthorNames';
import { selectIsAdmin } from '../../../../store/user/selectors';
import './CourseCard.css';

function CourseCard({ course, authors, onCourseSelect }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);

  const handleDelete = () => {
    dispatch(deleteCourse(course.id));
  };

  const handleUpdate = () => {
    navigate(`/courses/update/${course.id}`);
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
          {isAdmin && (
            <>
              <Button
                label="DELETE"
                className="Course-button"
                onClick={handleDelete}
              />
              <Button
                label="UPDATE"
                className="Course-button"
                onClick={handleUpdate}
              />
            </>
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
  onCourseSelect: PropTypes.func.isRequired,
};

export default CourseCard;