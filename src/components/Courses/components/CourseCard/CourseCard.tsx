import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../../common/Button/Button';
import formatCreationDate from '../../../../helpers/formatCreationDate';
import getCourseDuration from '../../../../helpers/getCourseDuration';
import getAuthorNames from '../../../../helpers/getAuthorNames';
import { enrollCourse } from '../../../../store/enrollments/thunk';
import { selectIsEnrolled } from '../../../../store/enrollments/selectors';
import type { Course, Author } from '../../../../types';
import type { AppDispatch } from '../../../../store';
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

  const isEnrolled = useSelector(selectIsEnrolled(course.id));

  const handleEnroll = (): void => {
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

export default CourseCard;