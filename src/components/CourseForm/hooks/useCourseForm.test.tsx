import { renderHook, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import * as reactRouterDom from 'react-router-dom';
import coursesReducer from '../../../store/courses/reducer';
import authorsReducer from '../../../store/authors/reducer';
import userReducer from '../../../store/user/reducer';
import enrollmentsReducer from '../../../store/enrollments/reducer';
import useCourseForm from './useCourseForm';
import {
  createCourseService,
  createAuthorService,
} from '../../../services';
import type { Author, Course, CoursesState, AuthorsState, UserState, EnrollmentsState } from '../../../types';

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

const existingAuthor: Author = { id: 'a1', name: 'Ada Lovelace' };
const existingAuthor2: Author = { id: 'a2', name: 'Grace Hopper' };

const existingCourse: Course = {
  id: 'c1',
  title: 'Existing Course',
  description: 'Existing description',
  duration: 90,
  authors: ['a1'],
  creationDate: '2024-01-01T00:00:00Z',
};

const buildStore = (preloadedState: {
  courses?: CoursesState;
  authors?: AuthorsState;
  user?: UserState;
  enrollments?: EnrollmentsState;
} = {}) =>
  configureStore({
    reducer: {
      courses: coursesReducer,
      authors: authorsReducer,
      user: userReducer,
      enrollments: enrollmentsReducer,
    },
    preloadedState: {
      courses: { courses: [], status: 'idle', error: null },
      authors: { authors: [existingAuthor, existingAuthor2], status: 'succeeded', error: null },
      user: { isAuth: true, role: 'admin', name: 'Admin', email: 'admin@test.com', status: 'succeeded', error: null },
      enrollments: { enrollments: [], status: 'idle', error: null },
      ...preloadedState,
    },
  });

const buildWrapper = (store: ReturnType<typeof buildStore>) =>
  ({ children }: { children: ReactNode }) =>
    <Provider store={store}>{children}</Provider>;

type HookResult = { current: ReturnType<typeof useCourseForm> };

const fillCourseFields = async (
  result: HookResult,
  fields: { title?: string; description?: string; duration?: string }
) => {
  Object.entries(fields).forEach(([key, value]) => {
    result.current.register(key as any).onChange({
      target: { value },
    } as React.ChangeEvent<HTMLInputElement>);
  });

  await waitFor(() => {
    Object.entries(fields).forEach(([key, value]) => {
      expect(result.current.register(key as any).value).toBe(value);
    });
  });
};

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
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.isEditMode).toBe(false);
    });

    it('submitLabel is "Create Course" in create mode', () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.submitLabel).toBe('Create Course');
    });

    it('all authors are available when no course authors assigned', () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.availableAuthors).toEqual([existingAuthor, existingAuthor2]);
    });
  });

  describe('edit mode — loads course data from store', () => {
    it('populates fields from store when courseId matches', async () => {
      vi.mocked(reactRouterDom.useParams).mockReturnValue({ courseId: 'c1' });

      const store = buildStore({
        courses: { courses: [existingCourse], status: 'succeeded', error: null },
      });

      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(store),
      });

      await waitFor(() => {
        expect(result.current.register('title').value).toBe('Existing Course');
      });
      expect(result.current.register('description').value).toBe('Existing description');
    });

    it('isEditMode is true when courseId is present', () => {
      vi.mocked(reactRouterDom.useParams).mockReturnValue({ courseId: 'c1' });
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.isEditMode).toBe(true);
    });

    it('submitLabel is "Update Course" in edit mode', () => {
      vi.mocked(reactRouterDom.useParams).mockReturnValue({ courseId: 'c1' });
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      expect(result.current.submitLabel).toBe('Update Course');
    });
  });

  describe('register()', () => {
    it('returns value and onChange for a field', () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      const titleField = result.current.register('title');
      expect(titleField.value).toBe('');
      expect(typeof titleField.onChange).toBe('function');
    });

    it('updates field value on onChange', async () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillCourseFields(result, { title: 'New Title' });
      expect(result.current.register('title').value).toBe('New Title');
    });
  });

  describe('handleSubmit — validation', () => {
    it('sets title error when title is empty', async () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await result.current.handleSubmit();
      await waitFor(() => {
        expect(result.current.errors.title).toBeDefined();
      });
    });

    it('sets duration error when duration is zero', async () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await fillCourseFields(result, {
        title: 'Valid Title',
        description: 'Valid description',
        duration: '0',
      });
      await result.current.handleSubmit();
      await waitFor(() => {
        expect(result.current.errors.duration).toBeDefined();
      });
    });

    it('does not dispatch when validation fails', async () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });
      await result.current.handleSubmit();
      expect(vi.mocked(createCourseService)).not.toHaveBeenCalled();
    });
  });

  describe('handleSubmit — create course', () => {
    it('dispatches createCourse and navigates on success', async () => {
      vi.mocked(createCourseService).mockResolvedValueOnce({
        data: { successful: true, result: { id: 'c2', title: 'New Course' } },
      } as any);

      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      await fillCourseFields(result, {
        title: 'New Course',
        description: 'Some description',
        duration: '60',
      });
      await result.current.handleSubmit();

      await waitFor(() => {
        expect(vi.mocked(createCourseService)).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/courses');
      });
    });

    it('sets server error when createCourse fails', async () => {
      vi.mocked(createCourseService).mockRejectedValueOnce(
        new Error('Server error')
      );

      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      await fillCourseFields(result, {
        title: 'New Course',
        description: 'Some description',
        duration: '60',
      });
      await result.current.handleSubmit();

      await waitFor(() => {
        expect(result.current.errors.server).toBeDefined();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('isSaving is true during submit and false after', async () => {
      let resolveFn!: (value: any) => void;
      vi.mocked(createCourseService).mockReturnValueOnce(
        new Promise((resolve) => { resolveFn = resolve; })
      );

      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      await fillCourseFields(result, {
        title: 'New Course',
        description: 'Some description',
        duration: '60',
      });

      result.current.handleSubmit();

      await waitFor(() => {
        expect(result.current.isSaving).toBe(true);
      });

      resolveFn({ data: { successful: true, result: { id: 'c2' } } });

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });
  });

  describe('author management', () => {
    it('adds author to courseAuthors and removes from availableAuthors', async () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      result.current.handleAddAuthorToCourse('a1');

      await waitFor(() => {
        expect(result.current.courseAuthorObjects).toEqual([existingAuthor]);
        expect(result.current.availableAuthors).toEqual([existingAuthor2]);
      });
    });

    it('removes author from courseAuthors and restores to availableAuthors', async () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      result.current.handleAddAuthorToCourse('a1');
      await waitFor(() => {
        expect(result.current.courseAuthorObjects).toEqual([existingAuthor]);
      });

      result.current.handleRemoveAuthorFromCourse('a1');
      await waitFor(() => {
        expect(result.current.courseAuthorObjects).toEqual([]);
        expect(result.current.availableAuthors).toEqual([existingAuthor, existingAuthor2]);
      });
    });
  });

  describe('handleCreateAuthor', () => {
    it('sets newAuthorName error when name is too short', async () => {
      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      result.current.register('newAuthorName').onChange({
        target: { value: 'A' },
      } as React.ChangeEvent<HTMLInputElement>);

      await result.current.handleCreateAuthor();

      await waitFor(() => {
        expect(result.current.errors.newAuthorName).toBeDefined();
      });
      expect(vi.mocked(createAuthorService)).not.toHaveBeenCalled();
    });

    it('clears newAuthorName field and error on success', async () => {
      const newAuthor: Author = { id: 'a3', name: 'Grace Hopper' };
      vi.mocked(createAuthorService).mockResolvedValueOnce({
        data: { successful: true, result: newAuthor },
      } as any);

      const { result } = renderHook(() => useCourseForm(), {
        wrapper: buildWrapper(buildStore()),
      });

      result.current.register('newAuthorName').onChange({
        target: { value: 'Grace Hopper' },
      } as React.ChangeEvent<HTMLInputElement>);

      await waitFor(() => {
        expect(result.current.register('newAuthorName').value).toBe('Grace Hopper');
      });

      await result.current.handleCreateAuthor();

      await waitFor(() => {
        expect(result.current.register('newAuthorName').value).toBe('');
        expect(result.current.errors.newAuthorName).toBeFalsy();
      });
    });
  });
});