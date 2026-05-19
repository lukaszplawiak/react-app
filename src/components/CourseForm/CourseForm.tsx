import AuthorItem from './components/AuthorItem/AuthorItem';
import Button from '../../common/Button/Button';
import useCourseForm from './hooks/useCourseForm';
import './CourseForm.css';

function CourseForm() {
  const {
    register,
    errors,
    isSaving,
    courseAuthorObjects,
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
        {/* textarea does not support spread of register() directly
            because register returns onChange typed for HTMLInputElement.
            So extract value and onChange manually for textarea. */}
        <textarea
          value={String(register('description').value)}
          onChange={register('description').onChange}
        />
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
        {courseAuthorObjects.map((author) => (
          <AuthorItem
            key={author.id}
            author={author}
            onAction={() => handleRemoveAuthorFromCourse(author.id)}
            action="Delete"
          />
        ))}
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