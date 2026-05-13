import React from 'react';
import PropTypes from 'prop-types';

function EmptyCourseList({ isAdmin }) {
  return (
    <div className="empty-course-list">
      <h2>Course List is Empty</h2>
      {isAdmin ? (
        <p>{'Please use "Add New Course" button to add your first course'}</p>
      ) : (
        <p>
          {"You don't have permissions to create a course. Please log in as ADMIN"}
        </p>
      )}
    </div>
  );
}

EmptyCourseList.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
};

export default EmptyCourseList;