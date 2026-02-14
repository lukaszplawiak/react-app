import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter as Router } from 'react-router-dom';
import rootReducer from '../../../store/rootReducer';
import Courses from '../Courses';

const initialState = {
  user: {
    isAuth: true,
    name: 'Test Name',
    role: 'admin',
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
  },
  authors: {
    authors: [],
  },
};

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Courses Component', () => {
  beforeEach(() => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
    });

    render(
      <Provider store={store}>
        <Router>
          <Courses />
        </Router>
      </Provider>
    );
  });

  test('Courses should display amount of CourseCard equal length of courses array', async () => {
    const courseCards = await screen.getAllByText(/Course /i);
    expect(courseCards.length).toBe(initialState.courses.courses.length);
  });

  test('CourseForm should be shown after a click on the "Add new course" button', async () => {
    const addButton = screen.getByText(/ADD NEW COURSE/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/courses/add');
    });
  });
});
