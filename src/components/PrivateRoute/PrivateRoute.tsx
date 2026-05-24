import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { selectIsAdmin, selectIsAuth } from '../../store/user/selectors';

interface PrivateRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

function PrivateRoute({ children, requireAdmin = false }: PrivateRouteProps) {
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/courses" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
