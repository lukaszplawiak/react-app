import { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Header from './components/Header/Header';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';
import Registration from './components/Registration/Registration';
import Login from './components/Login/Login';
import CourseForm from './components/CourseForm/CourseForm';
import Enrolled from './components/Enrolled/Enrolled';
import { fetchCourses } from './store/courses/thunk';
import { fetchAuthors } from './store/authors/thunk';
import { fetchUser } from './store/user/thunk';
import { fetchEnrollments } from './store/enrollments/thunk';
import { selectIsAuth, selectIsAdmin, selectUserStatus } from './store/user/selectors';
import type { AppDispatch } from './store';
import './App.css';

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