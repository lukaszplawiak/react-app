import { useSelector } from 'react-redux';
import { selectEnrollments, selectEnrollmentsStatus, selectEnrollmentsError } from '../../store/enrollments/selectors';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';
import './Enrolled.css';
import Button from '../../common/Button/Button';

function Enrolled() {
  const enrollments = useSelector(selectEnrollments);
  const status = useSelector(selectEnrollmentsStatus);
  const error = useSelector(selectEnrollmentsError);

  const isLoading = status === 'loading';
  const hasFailed = status === 'failed';

  if (isLoading) {
    return (
      <div className="Enrolled">
        <p className="loading-message">Loading enrollments...</p>
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className="Enrolled">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="Enrolled">
      <div className="Enrolled-header">
        <h2>Enrolled Students</h2>
        <Button label="Back to Courses" to="/courses" />
      </div>
      {enrollments.length === 0 ? (
        <p className="Enrolled-empty">No students enrolled yet.</p>
      ) : (
        <table className="Enrolled-table">
          <thead>
            <tr>
              <th>Student Email</th>
              <th>Course</th>
              <th>Enrolled At</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td>{enrollment.userEmail}</td>
                <td>{enrollment.courseName}</td>
                <td>
                  {new Date(enrollment.enrolledAt).toLocaleDateString('pl-PL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Enrolled;