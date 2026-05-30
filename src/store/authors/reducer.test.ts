import type { Author, AuthorsState } from '../../types';

import authorsReducer from './reducer';
import { createAuthor, fetchAuthors } from './thunk';

const initialState: AuthorsState = {
  authors: [],
  status: 'idle',
  error: null,
};

const sampleAuthor: Author = { id: 'a1', name: 'Ada Lovelace' };
const sampleAuthor2: Author = { id: 'a2', name: 'Grace Hopper' };

describe('Authors Reducer', () => {
  it('should return the initial state', () => {
    expect(authorsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('fetchAuthors', () => {
    it('sets status to loading and clears error on pending', () => {
      const stateWithError: AuthorsState = {
        ...initialState,
        error: 'previous error',
      };
      const state = authorsReducer(stateWithError, {
        type: fetchAuthors.pending.type,
      });
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('populates authors and sets status to succeeded on fulfilled', () => {
      const state = authorsReducer(initialState, {
        type: fetchAuthors.fulfilled.type,
        payload: [sampleAuthor, sampleAuthor2],
      });
      expect(state.status).toBe('succeeded');
      expect(state.authors).toEqual([sampleAuthor, sampleAuthor2]);
    });

    it('sets status to failed and stores error on rejected', () => {
      const state = authorsReducer(initialState, {
        type: fetchAuthors.rejected.type,
        payload: 'Network error',
      });
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Network error');
    });

    it('sets error to null when rejected payload is undefined', () => {
      const state = authorsReducer(initialState, {
        type: fetchAuthors.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });

  describe('createAuthor', () => {
    it('appends new author on fulfilled', () => {
      const state = authorsReducer(initialState, {
        type: createAuthor.fulfilled.type,
        payload: sampleAuthor,
      });
      expect(state.authors).toHaveLength(1);
      expect(state.authors[0]).toEqual(sampleAuthor);
    });

    it('appends to existing authors on fulfilled', () => {
      const stateWithAuthor: AuthorsState = {
        ...initialState,
        authors: [sampleAuthor],
      };
      const state = authorsReducer(stateWithAuthor, {
        type: createAuthor.fulfilled.type,
        payload: sampleAuthor2,
      });
      expect(state.authors).toHaveLength(2);
      expect(state.authors[1]).toEqual(sampleAuthor2);
    });

    it('sets status to failed and stores error on rejected', () => {
      const state = authorsReducer(initialState, {
        type: createAuthor.rejected.type,
        payload: 'Create failed',
      });
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Create failed');
    });

    it('sets error to null when rejected payload is undefined', () => {
      const state = authorsReducer(initialState, {
        type: createAuthor.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });
});