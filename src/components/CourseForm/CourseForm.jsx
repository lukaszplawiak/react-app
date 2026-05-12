import React from 'react';
import AuthorItem from './components/AuthorItem/AuthorItem';
import Button from '../../common/Button/Button';
import useCourseForm from './hooks/useCourseForm';

function CourseForm() {
  const { fields, setters, state, handlers } = useCourseForm();

  const { title, description, duration, newAuthorName } = fields;
  const { setTitle, setDescription, setDuration, setNewAuthorName } = setters;
  const {
    errors,
    isSaving,
    courseAuthors,
    availableAuthors,
    submitLabel,
  } = state;
  const {
    handleSubmit,
    handleCreateAuthor,
    handleAddAuthorToCourse,
    handleRemoveAuthorFromCourse,
  } = handlers;

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
        <input
          value={newAuthorName}
          onChange={(e) => setNewAuthorName(e.target.value)}
        />
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