import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter as Router } from 'react-router-dom';
import userReducer from '../../../store/user/reducer';
import coursesReducer from '../../../store/courses/reducer';
import authorsReducer from '../../../store/authors/reducer';
import Courses from '../Courses';

const initialState = {
  user: {
    isAuth: true,
    name: 'Test Name',
    role: 'admin',
    status: 'succeeded',
    error: null,
  },
  courses: {
    courses: [
      {
        id: '1',
        title: 'Course 1',
        description: 'Description 1',
        duration: 125,
        authors: ['11', '22'],
      },
      {
        id: '2',
        title: 'Course 2',
        description: 'Description 2',
        duration: 125,
        authors: ['11', '22'],
      },
    ],
    status: 'succeeded',
    error: null,
  },
  authors: {
    authors: [],
    status: 'succeeded',
    error: null,
  },
};

const buildStore = (state = initialState) =>
  configureStore({
    reducer: {
      user: userReducer,
      courses: coursesReducer,
      authors: authorsReducer,
    },
    preloadedState: state,
  });

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Courses Component', () => {
  beforeEach(() => {
    render(
      <Provider store={buildStore()}>
        <Router>
          <Courses />
        </Router>
      </Provider>
    );
  });

  test('should display CourseCard for each course in the store', async () => {
    const courseCards = await screen.getAllByText(/Course /i);
    expect(courseCards.length).toBe(initialState.courses.courses.length);
  });

  test('should navigate to /courses/add after clicking "Add new course"', async () => {
    const addButton = screen.getByText(/ADD NEW COURSE/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/courses/add');
    });
  });
});