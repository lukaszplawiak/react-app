import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuth, selectIsAdmin } from '../../store/user/selectors';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/courses" replace />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
};

export default PrivateRoute;