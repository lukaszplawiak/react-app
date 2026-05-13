import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Header from './components/Header/Header';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';
import Registration from './components/Registration/Registration';
import Login from './components/Login/Login';
import CourseForm from './components/CourseForm/CourseForm';
import { fetchCourses } from './store/courses/thunk';
import { fetchAuthors } from './store/authors/thunk';
import { fetchUser } from './store/user/thunk';
import { selectIsAuth, selectUserStatus } from './store/user/selectors';

import './App.css';

function App() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const userStatus = useSelector(selectUserStatus);
  const isBootstrapping = userStatus === 'bootstrapping';
  const defaultPath = isAuth ? '/courses' : '/login';

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchCourses());
    dispatch(fetchAuthors());
  }, [dispatch]);

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
            element={isAuth ? <Courses /> : <Navigate to="/login" />}
          />
          <Route
            path="/courses/add"
            element={
              <PrivateRoute>
                <CourseForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={isAuth ? <CourseInfo /> : <Navigate to="/login" />}
          />
          <Route
            path="/courses/update/:courseId"
            element={
              <PrivateRoute>
                <CourseForm />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;