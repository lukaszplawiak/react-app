import type { RootState } from '../index';

export const selectUser = (state: RootState) => state.user;
export const selectIsAuth = (state: RootState): boolean => state.user.isAuth;
export const selectIsAdmin = (state: RootState): boolean =>
  state.user.role === 'admin';
export const selectUserName = (state: RootState) => state.user.name;
export const selectUserRole = (state: RootState) => state.user.role;
export const selectUserStatus = (state: RootState) => state.user.status;
