import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  const location = useLocation();

  if (user.isAuth && user.role === 'admin') {
    return children;
  }

  return <Navigate to={`/login?redirect=${location.pathname}`} />;
};

export default PrivateRoute;
