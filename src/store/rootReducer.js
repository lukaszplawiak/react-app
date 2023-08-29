import { combineReducers } from 'redux';
import slice from './user/slice';
import coursesReducer from './courses/reducer';
import authorsReducer from './authors/reducer';

const rootReducer = combineReducers({
	user: slice,
	courses: coursesReducer,
	authors: authorsReducer,
});

export default rootReducer;
