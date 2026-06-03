import type { User, UserState } from '../../types';

import userReducer from './reducer';
import { fetchUser, loginUser, logoutUser } from './thunk';

const initialState: UserState = {
  name: null,
  email: null,
  isAuth: false,
  role: null,
  status: 'bootstrapping',
  error: null,
};

const authenticatedState: UserState = {
  name: 'Jan Kowalski',
  email: 'jan@test.com',
  isAuth: true,
  role: 'user',
  status: 'succeeded',
  error: null,
};

const sampleUser: User = {
  name: 'Jan Kowalski',
  email: 'jan@test.com',
  role: 'user',
};

const adminUser: User = {
  name: 'Admin',
  email: 'admin@test.com',
  role: 'admin',
};

describe('User Reducer', () => {
  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('fetchUser', () => {
    it('sets status to bootstrapping on pending', () => {
      const state = userReducer(initialState, {
        type: fetchUser.pending.type,
      });
      expect(state.status).toBe('bootstrapping');
    });

    it('populates user data and sets isAuth on fulfilled', () => {
      const state = userReducer(initialState, {
        type: fetchUser.fulfilled.type,
        payload: sampleUser,
      });
      expect(state.status).toBe('succeeded');
      expect(state.isAuth).toBe(true);
      expect(state.name).toBe('Jan Kowalski');
      expect(state.email).toBe('jan@test.com');
      expect(state.role).toBe('user');
    });

    it('populates admin role correctly on fulfilled', () => {
      const state = userReducer(initialState, {
        type: fetchUser.fulfilled.type,
        payload: adminUser,
      });
      expect(state.role).toBe('admin');
      expect(state.isAuth).toBe(true);
    });

    it('resets user data and sets status to idle on rejected', () => {
      const state = userReducer(authenticatedState, {
        type: fetchUser.rejected.type,
        payload: 'Unauthorized',
      });
      expect(state.status).toBe('idle');
      expect(state.isAuth).toBe(false);
      expect(state.name).toBeNull();
      expect(state.email).toBeNull();
      expect(state.role).toBeNull();
      expect(state.error).toBe('Unauthorized');
    });

    it('sets error to null when rejected payload is undefined', () => {
      const state = userReducer(initialState, {
        type: fetchUser.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });

  describe('loginUser', () => {
    it('sets status to loading and clears error on pending', () => {
      const stateWithError: UserState = {
        ...initialState,
        error: 'previous error',
      };
      const state = userReducer(stateWithError, {
        type: loginUser.pending.type,
      });
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('populates user data and sets isAuth on fulfilled', () => {
      const state = userReducer(initialState, {
        type: loginUser.fulfilled.type,
        payload: sampleUser,
      });
      expect(state.status).toBe('succeeded');
      expect(state.isAuth).toBe(true);
      expect(state.name).toBe('Jan Kowalski');
      expect(state.email).toBe('jan@test.com');
      expect(state.role).toBe('user');
      expect(state.error).toBeNull();
    });

    it('sets status to failed and stores error on rejected', () => {
      const state = userReducer(initialState, {
        type: loginUser.rejected.type,
        payload: 'Invalid credentials',
      });
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Invalid credentials');
    });

    it('sets error to null when rejected payload is undefined', () => {
      const state = userReducer(initialState, {
        type: loginUser.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });

  describe('logoutUser', () => {
    it('resets all user data on fulfilled', () => {
      const state = userReducer(authenticatedState, {
        type: logoutUser.fulfilled.type,
      });
      expect(state.status).toBe('idle');
      expect(state.isAuth).toBe(false);
      expect(state.name).toBeNull();
      expect(state.email).toBeNull();
      expect(state.role).toBeNull();
      expect(state.error).toBeNull();
    });

    it('resets user data and sets error on rejected', () => {
      const state = userReducer(authenticatedState, {
        type: logoutUser.rejected.type,
        payload: 'Logout failed',
      });
      expect(state.status).toBe('idle');
      expect(state.isAuth).toBe(false);
      expect(state.name).toBeNull();
      expect(state.email).toBeNull();
      expect(state.role).toBeNull();
      expect(state.error).toBe('Logout failed');
    });

    it('sets error to null when rejected payload is undefined', () => {
      const state = userReducer(authenticatedState, {
        type: logoutUser.rejected.type,
        payload: undefined,
      });
      expect(state.error).toBeNull();
    });
  });
});
