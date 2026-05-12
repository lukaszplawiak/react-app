import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthorItem from './components/AuthorItem/AuthorItem';
import Button from '../../common/Button/Button';
import { createCourse, updateCourse } from '../../store/courses/thunk';
import { createAuthor, fetchAuthors } from '../../store/authors/thunk';

const AUTHOR_NAME_MIN_LENGTH = 2;
const COURSE_TITLE_MIN_LENGTH = 2;
const COURSE_DESCRIPTION_MIN_LENGTH = 2;

const validateCourseFields = ({ title, description, duration }) => {
  const errors = {};

  if (title.length < COURSE_TITLE_MIN_LENGTH) {
    errors.title = 'Title should be at least 2 characters';
  }

  if (description.length < COURSE_DESCRIPTION_MIN_LENGTH) {
    errors.description = 'Description should be at least 2 characters';
  }

  if (isNaN(duration) || Number(duration) <= 0) {
    errors.duration = 'Duration should be a number greater than 0';
  }

  return errors;
};

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
  const coursesStatus = useSelector((state) => state.courses.status);

  const isSaving = coursesStatus === 'loading';
  const { courseId } = useParams();
  const isEditMode = Boolean(courseId);

  useEffect(() => {
    if (!courseId) return;

    const courseToUpdate = courses.find((course) => course.id === courseId);
    if (!courseToUpdate) return;

    setTitle(courseToUpdate.title);
    setDescription(courseToUpdate.description);
    setDuration(courseToUpdate.duration);
    setCourseAuthors(courseToUpdate.authors);
  }, [courses, courseId]);

  const handleAddAuthorToCourse = (authorId) => {
    setCourseAuthors((prev) => [...prev, authorId]);
  };

  const handleRemoveAuthorFromCourse = (authorId) => {
    setCourseAuthors((prev) => prev.filter((id) => id !== authorId));
  };

  const handleCreateAuthor = async () => {
    if (newAuthorName.length < AUTHOR_NAME_MIN_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        newAuthorName: 'Author name should be at least 2 characters',
      }));
      return;
    }

    const result = await dispatch(createAuthor({ name: newAuthorName }));

    if (createAuthor.fulfilled.match(result)) {
      await dispatch(fetchAuthors());
      setNewAuthorName('');
      setErrors((prev) => ({ ...prev, newAuthorName: null }));
    } else {
      setErrors((prev) => ({
        ...prev,
        newAuthorName: result.payload || 'Failed to create author. Please try again.',
      }));
    }
  };

  const handleCreateCourse = async () => {
    const validationErrors = validateCourseFields({ title, description, duration });

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

    if (createCourse.fulfilled.match(result)) {
      navigate('/courses');
    } else {
      setErrors((prev) => ({
        ...prev,
        server: result.payload || 'Failed to create course. Please try again.',
      }));
    }
  };

  const handleUpdateCourse = async () => {
    const validationErrors = validateCourseFields({ title, description, duration });

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const updatedCourse = {
      id: courseId,
      title,
      description,
      duration: Number(duration),
      authors: courseAuthors,
    };

    const result = await dispatch(updateCourse(updatedCourse));

    if (updateCourse.fulfilled.match(result)) {
      navigate('/courses');
    } else {
      setErrors((prev) => ({
        ...prev,
        server: result.payload || 'Failed to update course. Please try again.',
      }));
    }
  };

  const availableAuthors = authors.filter(
    (author) => !courseAuthors.includes(author.id)
  );

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
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <p className="error-message">{errors.duration || ' '}</p>
      </label>
      <div>
        {availableAuthors.map((author) => (
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
        <p className="error-message">{errors.newAuthorName || ' '}</p>
        <Button onClick={handleCreateAuthor} label="Create Author" />
      </label>
      {errors.server && <p className="error-message">{errors.server}</p>}
      <Button
        onClick={isSaving ? undefined : isEditMode ? handleUpdateCourse : handleCreateCourse}
        label={isSaving ? 'Saving...' : isEditMode ? 'Update Course' : 'Create Course'}
        disabled={isSaving}
      />
    </div>
  );
}

export default CourseForm;