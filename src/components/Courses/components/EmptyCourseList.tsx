import { useNavigate } from 'react-router-dom';

import Button from '../../../common/Button/Button';

interface EmptyCourseListProps {
  isAdmin: boolean;
}

function EmptyCourseList({ isAdmin }: EmptyCourseListProps) {
  const navigate = useNavigate();

  return (
    <div className="EmptyCourseList">
      <p>No courses found.</p>
      {isAdmin && (
        <Button
          label="Add New Course"
          onClick={() => navigate('/courses/add')}
        />
      )}
    </div>
  );
}

export default EmptyCourseList;
