import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse, updateCourse } from '../../../store/courses/thunk';
import { createAuthor, fetchAuthors } from '../../../store/authors/thunk';

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

const useCourseForm = () => {
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

  const { courseId } = useParams();
  const isEditMode = Boolean(courseId);
  const isSaving = coursesStatus === 'loading';

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
        newAuthorName:
          result.payload || 'Failed to create author. Please try again.',
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

  const handleSubmit = isEditMode ? handleUpdateCourse : handleCreateCourse;
  const submitLabel = isSaving
    ? 'Saving...'
    : isEditMode
    ? 'Update Course'
    : 'Create Course';

  return {
    fields: {
      title,
      description,
      duration,
      newAuthorName,
    },
    setters: {
      setTitle,
      setDescription,
      setDuration,
      setNewAuthorName,
    },
    state: {
      errors,
      isSaving,
      isEditMode,
      courseAuthors,
      availableAuthors,
      submitLabel,
    },
    handlers: {
      handleSubmit,
      handleCreateAuthor,
      handleAddAuthorToCourse,
      handleRemoveAuthorFromCourse,
    },
  };
};

export default useCourseForm;