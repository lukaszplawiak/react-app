import { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import Button from '../../../../common/Button/Button';
import formatCreationDate from '../../../../helpers/formatCreationDate';
import getAuthorNames from '../../../../helpers/getAuthorNames';
import getCourseDuration from '../../../../helpers/getCourseDuration';
import type { AppDispatch, RootState } from '../../../../store';
import { selectIsEnrolled } from '../../../../store/enrollments/selectors';
import { enrollCourse } from '../../../../store/enrollments/thunk';
import type { Author, Course } from '../../../../types';
import './CourseCard.css';

interface CourseCardProps {
  course: Course;
  authors: Author[];
  isAdmin: boolean;
  onCourseSelect: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onUpdate: (courseId: string) => void;
}

function CourseCard({
  course,
  authors,
  isAdmin,
  onCourseSelect,
  onDelete,
  onUpdate,
}: CourseCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isEnrolled = useSelector((state: RootState) =>
    selectIsEnrolled(state, course.id)
  );
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

  const handleEnroll = async (): Promise<void> => {
    setEnrollError(null);
    setIsEnrolling(true);
    const result = await dispatch(enrollCourse(course.id));
    setIsEnrolling(false);

    if (enrollCourse.rejected.match(result)) {
      setEnrollError(result.payload || 'Failed to enroll. Please try again.');
    }
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
            <p>
              Authors:{' '}
              {getAuthorNames(course.authors, authors, { truncate: true })}
            </p>
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
                variant="danger"
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
            <>
              <Button
                label={
                  isEnrolling
                    ? 'Enrolling...'
                    : isEnrolled
                      ? 'Enrolled ✓'
                      : 'Enroll'
                }
                className={`Course-button${isEnrolled ? ' Course-button--enrolled' : ''}`}
                onClick={handleEnroll}
                disabled={isEnrolled || isEnrolling}
              />
              {enrollError && <p className="enroll-error">{enrollError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
