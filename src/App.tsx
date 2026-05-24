import { useEffect } from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import CourseForm from './components/CourseForm/CourseForm';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';
import Enrolled from './components/Enrolled/Enrolled';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Registration from './components/Registration/Registration';

import './App.css';
import type { AppDispatch } from './store';
import { fetchAuthors } from './store/authors/thunk';
import { fetchCourses } from './store/courses/thunk';
import { fetchEnrollments } from './store/enrollments/thunk';
import {
  selectIsAdmin,
  selectIsAuth,
  selectUserStatus,
} from './store/user/selectors';
import { fetchUser } from './store/user/thunk';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const userStatus = useSelector(selectUserStatus);
  const isBootstrapping = userStatus === 'bootstrapping';
  const defaultPath = isAuth ? '/courses' : '/login';

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

  if (isBootstrapping) {
    return (
      <div className="App">
        <Header />
        <div className="Content">
          <p className="loading-message">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <div className="Content">
        <Routes>
          <Route path="/" element={<Navigate to={defaultPath} />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <Courses />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/add"
            element={
              <PrivateRoute requireAdmin>
                <CourseForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <PrivateRoute>
                <CourseInfo />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/update/:courseId"
            element={
              <PrivateRoute requireAdmin>
                <CourseForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/enrolled"
            element={
              <PrivateRoute requireAdmin>
                <Enrolled />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
