import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthorItem from './components/AuthorItem/AuthorItem';
import Button from '../../common/Button/Button';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse, updateCourse } from '../../store/courses/thunk';
import { createAuthor, fetchAuthors } from '../../store/authors/thunk';

function CourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [courseAuthors, setCourseAuthors] = useState([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authors = useSelector((state) => state.authors.authors);
  const courses = useSelector((state) => state.courses.courses);
  const { courseId } = useParams();

  useEffect(() => {
    if (courseId) {
      const courseToUpdate = courses.find((course) => course.id === courseId);
      setTitle(courseToUpdate.title);
      setDescription(courseToUpdate.description);
      setDuration(courseToUpdate.duration);
      setCourseAuthors(courseToUpdate.authors);
    }
  }, [courses, courseId]);

  const handleAddAuthorToCourse = (authorId) => {
    setCourseAuthors((prevAuthors) => [...prevAuthors, authorId]);
  };

  const handleRemoveAuthorFromCourse = (authorId) => {
    setCourseAuthors((prevAuthors) =>
      prevAuthors.filter((id) => id !== authorId)
    );
  };

  const handleCreateAuthor = async () => {
    if (newAuthorName.length < 2) {
      setErrors({
        ...errors,
        newAuthorName: 'Author name should be at least 2 characters',
      });
      return;
    }
    const newAuthor = {
      name: newAuthorName,
    };

    try {
      const result = await dispatch(createAuthor(newAuthor));
      console.log('✅ Autor utworzony:', result.payload);
      await dispatch(fetchAuthors());
      console.log('✅ Lista autorów odświeżona');
      setNewAuthorName('');
    } catch (error) {
      console.error('❌ Błąd tworzenia autora:', error);
      setErrors({
        ...errors,
        newAuthorName: 'Nie udało się dodać autora',
      });
    }
  };

  const handleUpdateCourse = async () => {
    const updatedCourse = {
      id: courseId,
      title,
      description,
      duration: Number(duration),
      authors: courseAuthors,
    };
    const result = await dispatch(updateCourse(updatedCourse));
    if (result.payload) {
      navigate('/courses');
    }
  };

  const handleCreateCourse = async () => {
    const validationErrors = {};
    if (title.length < 2)
      validationErrors.title = 'Title should be at least 2 characters';
    if (description.length < 2)
      validationErrors.description =
        'Description should be at least 2 characters';
    if (isNaN(duration) || duration <= 0)
      validationErrors.duration = 'Duration should be a number greater than 0';

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    const newCourse = {
      title,
      description,
      duration: Number(duration),
      authors: courseAuthors,
    };
    const result = await dispatch(createCourse(newCourse));
    if (result.payload) {
      navigate('/courses');
    }
  };

  return (
    <div className="CreateCourse">
      <label>
        Title:
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <p className="error-message">{errors.title || ' '}</p>
      </label>
      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="error-message">{errors.description || ' '}</p>
      </label>
      <label>
        Duration:
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          type="number"
        />
        <p className="error-message">{errors.duration || ' '}</p>
      </label>
      <div>
        {authors
          .filter((author) => !courseAuthors.includes(author.id))
          .map((author) => (
            <AuthorItem
              key={author.id}
              author={author}
              onAction={() => handleAddAuthorToCourse(author.id)}
              action="Add"
            />
          ))}
      </div>
      <div>
        {courseAuthors.map((authorId) => {
          const author = authors.find((a) => a.id === authorId);
          if (!author) return null;
          return (
            <AuthorItem
              key={authorId}
              author={author}
              onAction={() => handleRemoveAuthorFromCourse(authorId)}
              action="Delete"
            />
          );
        })}
      </div>
      <label>
        New Author:
        <input
          value={newAuthorName}
          onChange={(e) => setNewAuthorName(e.target.value)}
        />
        <Button onClick={handleCreateAuthor} label="Create Author" />
      </label>
      <Button onClick={handleCreateCourse} label="Create Course" />
      <Button onClick={handleUpdateCourse} label="Update Course" />
    </div>
  );
}

CourseForm.propTypes = {
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default CourseForm;
