import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthorItem from './components/AuthorItem/AuthorItem';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse } from '../../store/courses/actions';
import { createAuthor } from '../../store/authors/actions';

function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [courseAuthors, setCourseAuthors] = useState([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authors = useSelector((state) => state.authors.authors);
  const user = useSelector((state) => state.user);

  const handleAddAuthorToCourse = (authorId) => {
    setCourseAuthors((prevAuthors) => [...prevAuthors, authorId]);
  };

  const handleRemoveAuthorFromCourse = (authorId) => {
    setCourseAuthors((prevAuthors) =>
      prevAuthors.filter((id) => id !== authorId)
    );
  };

  const handleCreateAuthor = () => {
    if (newAuthorName.length < 2) {
      setErrors({
        ...errors,
        newAuthorName: 'Author name should be at least 2 characters',
      });
      return;
    }

    const newAuthor = {
      id: uuidv4(),
      name: newAuthorName,
    };
    dispatch(createAuthor(newAuthor, user.token));
    setNewAuthorName('');
  };

  const handleCreateCourse = () => {
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
      id: uuidv4(),
      title,
      description,
      creationDate: new Date().toISOString(),
      duration: Number(duration),
      authors: courseAuthors,
    };

    dispatch(createCourse(newCourse));
    navigate('/courses');
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
        <button onClick={handleCreateAuthor}>Create Author</button>
      </label>
      <button onClick={handleCreateCourse}>Create Course</button>
    </div>
  );
}

CreateCourse.propTypes = {
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default CreateCourse;
