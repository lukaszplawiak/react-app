import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user/reducer';
import coursesReducer from './courses/reducer';
import authorsReducer from './authors/reducer';
import enrollmentsReducer from './enrollments/reducer';

const store = configureStore({
  reducer: {
    user: userReducer,
    courses: coursesReducer,
    authors: authorsReducer,
    enrollments: enrollmentsReducer,
  },
});

export default store;