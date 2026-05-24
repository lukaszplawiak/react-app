import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { fetchCourses } from '../store/courses/thunk';
import { fetchAuthors } from '../store/authors/thunk';
import { fetchUser } from '../store/user/thunk';
import { fetchEnrollments } from '../store/enrollments/thunk';
import { selectIsAuth, selectIsAdmin, selectUserStatus } from '../store/user/selectors';
import type { AppDispatch } from '../store';

interface AppBootstrapResult {
  isBootstrapping: boolean;
}

// Centralises all app-level data fetching that was previously scattered
// across three useEffect calls in App.tsx, keeping App focused on routing.
//
// Fetch order:
//   1. fetchUser — always, determines auth state
//   2. fetchCourses + fetchAuthors — once authenticated
//   3. fetchEnrollments — once authenticated AND admin
export function useAppBootstrap(): AppBootstrapResult {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const userStatus = useSelector(selectUserStatus);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuth) return;
    dispatch(fetchCourses());
    dispatch(fetchAuthors());
  }, [dispatch, isAuth]);

  useEffect(() => {
    if (!isAuth || !isAdmin) return;
    dispatch(fetchEnrollments());
  }, [dispatch, isAuth, isAdmin]);

  return { isBootstrapping: userStatus === 'bootstrapping' };
}