export const selectUser = (state) => state.user;
export const selectIsAuth = (state) => state.user.isAuth;
export const selectIsAdmin = (state) => state.user.role === 'admin';
export const selectUserName = (state) => state.user.name;
export const selectUserRole = (state) => state.user.role;
export const selectUserStatus = (state) => state.user.status;