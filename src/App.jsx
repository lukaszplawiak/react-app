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

import './App.css';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const defaultPath = user.isAuth ? '/courses' : '/login';

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchCourses());
    dispatch(fetchAuthors());
  }, [dispatch]);

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
            element={user.isAuth ? <Courses /> : <Navigate to="/login" />}
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
            element={
              user.isAuth ? <CourseInfo /> : <Navigate to="/login" />
            }
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