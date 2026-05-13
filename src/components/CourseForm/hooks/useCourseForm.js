import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse, updateCourse } from '../../../store/courses/thunk';
import { createAuthor } from '../../../store/authors/thunk';
import {
  selectCourses,
  selectCoursesStatus,
} from '../../../store/courses/selectors';
import { selectAuthors } from '../../../store/authors/selectors';
import {
  MIN_AUTHOR_NAME_LENGTH,
  MIN_COURSE_TITLE_LENGTH,
  MIN_COURSE_DESCRIPTION_LENGTH,
} from '../../../constants/validation';

const validateCourseFields = ({ title, description, duration }) => {
  const errors = {};

  if (title.length < MIN_COURSE_TITLE_LENGTH) {
    errors.title = `Title should be at least ${MIN_COURSE_TITLE_LENGTH} characters`;
  }

  if (description.length < MIN_COURSE_DESCRIPTION_LENGTH) {
    errors.description = `Description should be at least ${MIN_COURSE_DESCRIPTION_LENGTH} characters`;
  }

  if (isNaN(duration) || Number(duration) <= 0) {
    errors.duration = 'Duration should be a number greater than 0';
  }

  return errors;
};

const useCourseForm = () => {
  const [fields, setFields] = useState({
    title: '',
    description: '',
    duration: '',
    newAuthorName: '',
  });
  const [courseAuthors, setCourseAuthors] = useState([]);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authors = useSelector(selectAuthors);
  const courses = useSelector(selectCourses);
  const coursesStatus = useSelector(selectCoursesStatus);

  const { courseId } = useParams();
  const isEditMode = Boolean(courseId);
  const isSaving = coursesStatus === 'loading';

  useEffect(() => {
    if (!courseId) return;

    const courseToUpdate = courses.find((course) => course.id === courseId);
    if (!courseToUpdate) return;

    setFields({
      title: courseToUpdate.title,
      description: courseToUpdate.description,
      duration: courseToUpdate.duration,
      newAuthorName: '',
    });
    setCourseAuthors(courseToUpdate.authors);
  }, [courses, courseId]);

  const register = (fieldName) => ({
    value: fields[fieldName],
    onChange: (e) =>
      setFields((prev) => ({ ...prev, [fieldName]: e.target.value })),
  });

  const handleAddAuthorToCourse = (authorId) => {
    setCourseAuthors((prev) => [...prev, authorId]);
  };

  const handleRemoveAuthorFromCourse = (authorId) => {
    setCourseAuthors((prev) => prev.filter((id) => id !== authorId));
  };

  const handleCreateAuthor = async () => {
    if (fields.newAuthorName.length < MIN_AUTHOR_NAME_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        newAuthorName: `Author name should be at least ${MIN_AUTHOR_NAME_LENGTH} characters`,
      }));
      return;
    }

    const result = await dispatch(createAuthor({ name: fields.newAuthorName }));

    if (createAuthor.fulfilled.match(result)) {
      setFields((prev) => ({ ...prev, newAuthorName: '' }));
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
    const validationErrors = validateCourseFields(fields);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const newCourse = {
      title: fields.title,
      description: fields.description,
      duration: Number(fields.duration),
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
    const validationErrors = validateCourseFields(fields);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const updatedCourse = {
      id: courseId,
      title: fields.title,
      description: fields.description,
      duration: Number(fields.duration),
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
    register,
    errors,
    isSaving,
    isEditMode,
    courseAuthors,
    availableAuthors,
    submitLabel,
    handleSubmit,
    handleCreateAuthor,
    handleAddAuthorToCourse,
    handleRemoveAuthorFromCourse,
  };
};

export default useCourseForm;