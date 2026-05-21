import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse, updateCourse } from '../../../store/courses/thunk';
import { createAuthor } from '../../../store/authors/thunk';
import { selectCourses } from '../../../store/courses/selectors';
import { selectAuthors } from '../../../store/authors/selectors';
import { MIN_AUTHOR_NAME_LENGTH, MIN_COURSE_TITLE_LENGTH, MIN_COURSE_DESCRIPTION_LENGTH } from '../../../constants';
import type { AppDispatch } from '../../../store';
import type { Author, CourseFormFields } from '../../../types';

interface CourseFormErrors {
  title?: string;
  description?: string;
  duration?: string;
  newAuthorName?: string | null;
  server?: string;
}

interface RegisterField {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

interface UseCourseFormReturn {
  register: (fieldName: keyof CourseFormFields) => RegisterField;
  errors: CourseFormErrors;
  isSaving: boolean;
  isEditMode: boolean;
  courseAuthorObjects: Author[];
  availableAuthors: Author[];
  submitLabel: string;
  handleSubmit: () => Promise<void>;
  handleCreateAuthor: () => Promise<void>;
  handleAddAuthorToCourse: (authorId: string) => void;
  handleRemoveAuthorFromCourse: (authorId: string) => void;
}

const validateCourseFields = (fields: CourseFormFields): CourseFormErrors => {
  const errors: CourseFormErrors = {};

  if (String(fields.title).length < MIN_COURSE_TITLE_LENGTH) {
    errors.title = `Title should be at least ${MIN_COURSE_TITLE_LENGTH} characters`;
  }

  if (String(fields.description).length < MIN_COURSE_DESCRIPTION_LENGTH) {
    errors.description = `Description should be at least ${MIN_COURSE_DESCRIPTION_LENGTH} characters`;
  }

  if (isNaN(Number(fields.duration)) || Number(fields.duration) <= 0) {
    errors.duration = 'Duration should be a number greater than 0';
  }

  return errors;
};

const useCourseForm = (): UseCourseFormReturn => {
  const [fields, setFields] = useState<CourseFormFields>({
    title: '',
    description: '',
    duration: '',
    newAuthorName: '',
  });
  const [courseAuthors, setCourseAuthors] = useState<string[]>([]);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authors = useSelector(selectAuthors);
  const courses = useSelector(selectCourses);

  const { courseId } = useParams<{ courseId: string }>();
  const isEditMode = Boolean(courseId);

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

  const register = (fieldName: keyof CourseFormFields): RegisterField => ({
    value: fields[fieldName],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [fieldName]: e.target.value })),
  });

  const handleAddAuthorToCourse = (authorId: string): void => {
    setCourseAuthors((prev) => [...prev, authorId]);
  };

  const handleRemoveAuthorFromCourse = (authorId: string): void => {
    setCourseAuthors((prev) => prev.filter((id) => id !== authorId));
  };

  const handleCreateAuthor = async (): Promise<void> => {
    if (String(fields.newAuthorName).length < MIN_AUTHOR_NAME_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        newAuthorName: `Author name should be at least ${MIN_AUTHOR_NAME_LENGTH} characters`,
      }));
      return;
    }

    const result = await dispatch(
      createAuthor({ name: String(fields.newAuthorName) })
    );

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

  const handleSubmit = async (): Promise<void> => {
    const validationErrors = validateCourseFields(fields);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);

    let result;

    if (isEditMode && courseId) {
      const courseToUpdate = courses.find((course) => course.id === courseId);

      const creationDate = courseToUpdate?.creationDate ?? new Date().toISOString();

      result = await dispatch(
        updateCourse({
          id: courseId,
          title: String(fields.title),
          description: String(fields.description),
          duration: Number(fields.duration),
          authors: courseAuthors,
          creationDate,
        })
      );
    } else {
      result = await dispatch(
        createCourse({
          title: String(fields.title),
          description: String(fields.description),
          duration: Number(fields.duration),
          authors: courseAuthors,
        })
      );
    }

    setIsSaving(false);

    const action = isEditMode ? updateCourse : createCourse;

    if (action.fulfilled.match(result)) {
      navigate('/courses');
    } else {
      setErrors((prev) => ({
        ...prev,
        server:
          result.payload ||
          `Failed to ${isEditMode ? 'update' : 'create'} course. Please try again.`,
      }));
    }
  };

  const availableAuthors = authors.filter(
    (author) => !courseAuthors.includes(author.id)
  );

  const courseAuthorObjects = courseAuthors
    .map((id) => authors.find((a) => a.id === id))
    .filter((author): author is Author => author !== undefined);

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
    courseAuthorObjects,
    availableAuthors,
    submitLabel,
    handleSubmit,
    handleCreateAuthor,
    handleAddAuthorToCourse,
    handleRemoveAuthorFromCourse,
  };
};

export default useCourseForm;