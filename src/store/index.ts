import { configureStore } from '@reduxjs/toolkit';

import authorsReducer from './authors/reducer';
import coursesReducer from './courses/reducer';
import enrollmentsReducer from './enrollments/reducer';
import userReducer from './user/reducer';

const store = configureStore({
  reducer: {
    user: userReducer,
    courses: coursesReducer,
    authors: authorsReducer,
    enrollments: enrollmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
