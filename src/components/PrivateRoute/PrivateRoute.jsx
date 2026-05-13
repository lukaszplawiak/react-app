import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuth, selectIsAdmin } from '../../store/user/selectors';

const PrivateRoute = ({ children }) => {
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/courses" replace />;
  }

  return children;
};

export default PrivateRoute;