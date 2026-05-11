import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CourseCard from './components/CourseCard/CourseCard';
import SearchBar from './components/SearchBar/SearchBar';
import Button from '../../common/Button/Button';
import EmptyCourseList from './components/EmptyCourseList';
import { ADD_NEW_COURSE_LABEL } from '../../constants';
import { fetchUser } from '../../store/user/thunk';
import './Courses.css';

function Courses() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.courses.courses);
  const authors = useSelector((state) => state.authors.authors);
  const user = useSelector((state) => state.user);

  const coursesStatus = useSelector((state) => state.courses.status);
  const authorsStatus = useSelector((state) => state.authors.status);
  const isLoading = coursesStatus === 'loading' || authorsStatus === 'loading';

  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchUser());
    if (!user.isAuth) {
      navigate('/login');
    }
  }, [dispatch, user.isAuth, navigate]);

  const handleSearch = (inputQuery) => {
    setQuery(inputQuery);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [courses, query]);

  const handleAddNewCourse = () => {
    navigate('/courses/add');
  };

  const handleCourseSelect = (course) => {
    navigate(`/courses/${course.id}`);
  };

  if (isLoading) {
    return (
      <div className="Courses">
        <p className="loading-message">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="Courses">
      <SearchBar onSearch={handleSearch} />
      {filteredCourses.length > 0 ? (
        filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            authors={authors}
            onCourseSelect={handleCourseSelect}
          />
        ))
      ) : (
        <EmptyCourseList role={user.role} />
      )}
      {user.role === 'admin' && (
        <Button
          label={ADD_NEW_COURSE_LABEL}
          className="ButtonAdd"
          onClick={handleAddNewCourse}
        />
      )}
    </div>
  );
}

export default Courses;