import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuth, role } = useSelector((state) => state.user);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/courses" replace />;
  }

  return children;
};

export default PrivateRoute;