import { configureStore } from '@reduxjs/toolkit';

import { createAuthorService, getAuthorsService } from '../../services';
import type { Author, AuthorsState } from '../../types';

import authorsReducer from './reducer';
import coursesReducer from '../courses/reducer';
import enrollmentsReducer from '../enrollments/reducer';
import userReducer from '../user/reducer';
import { createAuthor, fetchAuthors } from './thunk';

vi.mock('../../services');

const mockedGetAuthors = vi.mocked(getAuthorsService);
const mockedCreateAuthor = vi.mocked(createAuthorService);

const sampleAuthor: Author = { id: 'a1', name: 'Ada Lovelace' };
const sampleAuthor2: Author = { id: 'a2', name: 'Grace Hopper' };

const buildStore = (
  preloadedAuthors: AuthorsState = {
    authors: [],
    status: 'idle',
    error: null,
  }
) =>
  configureStore({
    reducer: {
      authors: authorsReducer,
      courses: coursesReducer,
      enrollments: enrollmentsReducer,
      user: userReducer,
    },
    preloadedState: {
      authors: preloadedAuthors,
    },
  });

describe('Authors Thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAuthors', () => {
    it('dispatches fulfilled and populates authors on success', async () => {
      mockedGetAuthors.mockResolvedValueOnce({
        data: { successful: true, result: [sampleAuthor, sampleAuthor2] },
      } as any);

      const store = buildStore();
      await store.dispatch(fetchAuthors());

      const state = store.getState().authors;
      expect(state.status).toBe('succeeded');
      expect(state.authors).toEqual([sampleAuthor, sampleAuthor2]);
    });

    it('dispatches rejected and sets error on service failure', async () => {
      mockedGetAuthors.mockRejectedValueOnce(new Error('Network error'));

      const store = buildStore();
      await store.dispatch(fetchAuthors());

      const state = store.getState().authors;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Network error');
    });

    it('dispatches rejected when successful flag is false', async () => {
      mockedGetAuthors.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      await store.dispatch(fetchAuthors());

      expect(store.getState().authors.status).toBe('failed');
    });
  });

  describe('createAuthor', () => {
    it('appends author to state on success', async () => {
      mockedCreateAuthor.mockResolvedValueOnce({
        data: { successful: true, result: sampleAuthor },
      } as any);

      const store = buildStore();
      await store.dispatch(createAuthor({ name: 'Ada Lovelace' }));

      const state = store.getState().authors;
      expect(state.authors).toHaveLength(1);
      expect(state.authors[0]).toEqual(sampleAuthor);
    });

    it('returns rejected action on service failure', async () => {
      mockedCreateAuthor.mockRejectedValueOnce(new Error('Create failed'));

      const store = buildStore();
      const result = await store.dispatch(
        createAuthor({ name: 'Ada Lovelace' })
      );

      expect(createAuthor.rejected.match(result)).toBe(true);
      expect(store.getState().authors.authors).toHaveLength(0);
    });

    it('returns rejected action when successful flag is false', async () => {
      mockedCreateAuthor.mockResolvedValueOnce({
        data: { successful: false },
      } as any);

      const store = buildStore();
      const result = await store.dispatch(
        createAuthor({ name: 'Ada Lovelace' })
      );

      expect(createAuthor.rejected.match(result)).toBe(true);
    });

    it('passes author name to service', async () => {
      mockedCreateAuthor.mockResolvedValueOnce({
        data: { successful: true, result: sampleAuthor },
      } as any);

      const store = buildStore();
      await store.dispatch(createAuthor({ name: 'Ada Lovelace' }));

      expect(mockedCreateAuthor).toHaveBeenCalledWith({ name: 'Ada Lovelace' });
    });
  });
});