import React from 'react';
import AuthorItem from './components/AuthorItem/AuthorItem';
import Button from '../../common/Button/Button';
import useCourseForm from './hooks/useCourseForm';
import './CourseForm.css';

function CourseForm() {
  const {
    register,
    errors,
    isSaving,
    courseAuthors,
    availableAuthors,
    submitLabel,
    handleSubmit,
    handleCreateAuthor,
    handleAddAuthorToCourse,
    handleRemoveAuthorFromCourse,
  } = useCourseForm();

  return (
    <div className="CreateCourse">
      <label>
        Title:
        <input {...register('title')} />
        <p className="error-message">{errors.title || ' '}</p>
      </label>
      <label>
        Description:
        <textarea {...register('description')} />
        <p className="error-message">{errors.description || ' '}</p>
      </label>
      <label>
        Duration:
        <input type="number" {...register('duration')} />
        <p className="error-message">{errors.duration || ' '}</p>
      </label>
      <div className="authors-section">
        <p className="authors-section__title">Available authors:</p>
        {availableAuthors.map((author) => (
          <AuthorItem
            key={author.id}
            author={author}
            onAction={() => handleAddAuthorToCourse(author.id)}
            action="Add"
          />
        ))}
      </div>
      <div className="authors-section">
        <p className="authors-section__title">Course authors:</p>
        {courseAuthors.map((authorId) => {
          const author = availableAuthors.find((a) => a.id === authorId);
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
        <input {...register('newAuthorName')} />
        <p className="error-message">{errors.newAuthorName || ' '}</p>
        <Button onClick={handleCreateAuthor} label="Create Author" />
      </label>
      {errors.server && <p className="error-message">{errors.server}</p>}
      <Button
        onClick={isSaving ? undefined : handleSubmit}
        label={submitLabel}
        disabled={isSaving}
      />
    </div>
  );
}

export default CourseForm;