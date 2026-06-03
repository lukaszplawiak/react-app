import { Navigate, Route, Routes } from 'react-router-dom';

import { useSelector } from 'react-redux';

import CourseForm from './components/CourseForm/CourseForm';
import CourseInfo from './components/CourseInfo/CourseInfo';
import Courses from './components/Courses/Courses';
import Enrolled from './components/Enrolled/Enrolled';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Registration from './components/Registration/Registration';

import './App.css';
import { selectIsAuth } from './store/user/selectors';

import { useAppBootstrap } from './hooks/useAppBootstrap';

function App() {
  const { isBootstrapping } = useAppBootstrap();
  const isAuth = useSelector(selectIsAuth);
  const defaultPath = isAuth ? '/courses' : '/login';

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
