import { act, renderHook } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import coursesReducer from '../../../store/courses/reducer';
import authorsReducer from '../../../store/authors/reducer';
import userReducer from '../../../store/user/reducer';
import useCourseForm from './useCourseForm';
import {
  createCourseService,
  updateCourseService,
  createAuthorService,
} from '../../../services';

vi.mock('../../../services');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(),
  };
});

const mockNavigate = vi.fn();

const existingAuthor = { id: 'a1', name: 'Ada Lovelace' };
const existingCourse = {
  id: 'c1',
  title: 'Existing Course',
  description: 'Existing description',
  duration: 90,
  authors: ['a1'],
};

const buildStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      courses: coursesReducer,
      authors: authorsReducer,
      user: userReducer,
    },
    preloadedState: {
      courses: { courses: [], status: 'idle', error: null },
      authors: { authors: [existingAuthor], status: 'succeeded', error: null },
      user: { isAuth: true, role: 'admin', status: 'succeeded', error: null },
      ...preloadedState,
    },
  });

const buildWrapper =
  (store) =>
  ({ children }) =>
    <Provider store={store}>{children}</Provider>;

describe('useCourseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(reactRouterDom.useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(reactRouterDom.useParams).mockReturnValue({ courseId: undefined });
  });

  describe('initial state — create mode', () => {
    it('initializes all fields as empty strings', () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      expect(result.current.register('title').value).toBe('');
      expect(result.current.register('description').value).toBe('');
      expect(result.current.register('duration').value).toBe('');
      expect(result.current.register('newAuthorName').value).toBe('');
    });

    it('isEditMode is false when no courseId in params', () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      expect(result.current.isEditMode).toBe(false);
    });

    it('submitLabel is "Create Course" in create mode', () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      expect(result.current.submitLabel).toBe('Create Course');
    });

    it('all authors are available when no course authors assigned', () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      expect(result.current.availableAuthors).toEqual([existingAuthor]);
    });
  });

  describe('edit mode — loads course data from store', () => {
    it('populates fields from store when courseId matches', async () => {
      vi.mocked(reactRouterDom.useParams).mockReturnValue({ courseId: 'c1' });

      const store = buildStore({
        courses: {
          courses: [existingCourse],
          status: 'succeeded',
          error: null,
        },
      });

      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      await act(async () => {});

      expect(result.current.register('title').value).toBe('Existing Course');
      expect(result.current.register('description').value).toBe('Existing description');
      expect(result.current.register('duration').value).toBe(90);
    });

    it('isEditMode is true when courseId is present', () => {
      vi.mocked(reactRouterDom.useParams).mockReturnValue({ courseId: 'c1' });

      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      expect(result.current.isEditMode).toBe(true);
    });

    it('submitLabel is "Update Course" in edit mode', () => {
      vi.mocked(reactRouterDom.useParams).mockReturnValue({ courseId: 'c1' });

      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      expect(result.current.submitLabel).toBe('Update Course');
    });
  });

  describe('register()', () => {
    it('returns value and onChange for a field', () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      const titleField = result.current.register('title');
      expect(titleField.value).toBe('');
      expect(typeof titleField.onChange).toBe('function');
    });

    it('updates field value on onChange', () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.register('title').onChange({
          target: { value: 'New Title' },
        });
      });

      expect(result.current.register('title').value).toBe('New Title');
    });
  });

  describe('handleSubmit — validation', () => {
    it('sets title error when title is empty', async () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.title).toBeDefined();
    });

    it('sets duration error when duration is zero', async () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.register('title').onChange({ target: { value: 'Valid Title' } });
        result.current.register('description').onChange({ target: { value: 'Valid description' } });
        result.current.register('duration').onChange({ target: { value: '0' } });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.duration).toBeDefined();
    });

    it('does not dispatch when validation fails', async () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(createCourseService).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit — create course', () => {
    it('dispatches createCourse and navigates on success', async () => {
      const newCourse = { id: 'c2', title: 'New Course' };
      createCourseService.mockResolvedValueOnce({
        data: { successful: true, result: newCourse },
      });

      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.register('title').onChange({ target: { value: 'New Course' } });
        result.current.register('description').onChange({ target: { value: 'Some description' } });
        result.current.register('duration').onChange({ target: { value: '60' } });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(createCourseService).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/courses');
    });

    it('sets server error when createCourse fails', async () => {
      createCourseService.mockRejectedValueOnce(new Error('Server error'));

      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.register('title').onChange({ target: { value: 'New Course' } });
        result.current.register('description').onChange({ target: { value: 'Some description' } });
        result.current.register('duration').onChange({ target: { value: '60' } });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.server).toBeDefined();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('isSaving is true during submit and false after', async () => {
      let resolveFn;
      createCourseService.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFn = resolve;
        })
      );

      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.register('title').onChange({ target: { value: 'New Course' } });
        result.current.register('description').onChange({ target: { value: 'Some description' } });
        result.current.register('duration').onChange({ target: { value: '60' } });
      });

      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        resolveFn({ data: { successful: true, result: { id: 'c2' } } });
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('author management', () => {
    it('adds author to courseAuthors and removes from availableAuthors', () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.handleAddAuthorToCourse('a1');
      });

      expect(result.current.courseAuthorObjects).toEqual([existingAuthor]);
      expect(result.current.availableAuthors).toEqual([]);
    });

    it('removes author from courseAuthors and restores to availableAuthors', () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.handleAddAuthorToCourse('a1');
      });

      act(() => {
        result.current.handleRemoveAuthorFromCourse('a1');
      });

      expect(result.current.courseAuthorObjects).toEqual([]);
      expect(result.current.availableAuthors).toEqual([existingAuthor]);
    });
  });

  describe('handleCreateAuthor', () => {
    it('sets newAuthorName error when name is too short', async () => {
      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.register('newAuthorName').onChange({
          target: { value: 'A' },
        });
      });

      await act(async () => {
        await result.current.handleCreateAuthor();
      });

      expect(result.current.errors.newAuthorName).toBeDefined();
      expect(createAuthorService).not.toHaveBeenCalled();
    });

    it('clears newAuthorName field and error on success', async () => {
      const newAuthor = { id: 'a2', name: 'Grace Hopper' };
      createAuthorService.mockResolvedValueOnce({
        data: { successful: true, result: newAuthor },
      });

      const store = buildStore();
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      act(() => {
        result.current.register('newAuthorName').onChange({
          target: { value: 'Grace Hopper' },
        });
      });

      await act(async () => {
        await result.current.handleCreateAuthor();
      });

      expect(result.current.register('newAuthorName').value).toBe('');
      expect(result.current.errors.newAuthorName).toBeFalsy();
    });
  });
});