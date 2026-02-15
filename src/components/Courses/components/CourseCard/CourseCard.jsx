import React from 'react';
import Button from '../../../../common/Button/Button';
import { useDispatch, useSelector } from 'react-redux';
import { deleteCourse } from '../../../../store/courses/thunk';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';

const formatDuration = (duration) => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const formattedHours = hours < 10 ? '0' + hours : hours;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const label = hours === 1 ? 'hour' : 'hours';

  return `${formattedHours}:${formattedMinutes} ${label}`;
};

const formatCreationDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
};

function CourseCard({ course, authors, onCourseSelect, _onDelete }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const getAuthors = (courseAuthors) => {
    if (!courseAuthors || !authors) {
      return '';
    }

    const names = courseAuthors
      .map((authorId) => {
        const author = authors.find((a) => a.id === authorId);
        return author ? author.name : null;
      })
      .filter(Boolean)
      .join(', ');

    return names.length > 30 ? names.substr(0, 27) + '...' : names;
  };

  const handleDelete = async (courseId) => {
    await dispatch(deleteCourse(courseId));
  };

  const handleUpdate = (courseId) => {
    navigate(`/courses/update/${courseId}`);
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
            <p>Authors: {getAuthors(course.authors)}</p>
            <p>Duration: {formatDuration(course.duration)}</p>
            <p>Creation date: {formatCreationDate(course.creationDate)}</p>
          </div>
          <Button
            label="SHOW COURSE"
            className="Course-button"
            onClick={() => {
              onCourseSelect(course);
            }}
          />
          {user.role === 'admin' && (
            <Button label="DELETE" className="Course-button" onClick={() => handleDelete(course.id)} />
          )}
          {user.role === 'admin' && (
            <Button label="UPDATE" className="Course-button" onClick={() => handleUpdate(course.id)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
