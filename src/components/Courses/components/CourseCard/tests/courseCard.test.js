import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import CourseCard from '../CourseCard';
import rootReducer from '../../../../../store/rootReducer';

const initialState = {
  user: {
    isAuth: true,
    name: 'username',
    role: 'admin',
    status: 'succeeded',
    error: null,
  },
  courses: {
    courses: [],
    status: 'idle',
    error: null,
  },
  authors: {
    authors: [
      { id: '1', name: 'Author One' },
      { id: '2', name: 'Author Two' },
    ],
    status: 'succeeded',
    error: null,
  },
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});

const sampleCourse = {
  id: 'sampleId',
  title: 'Sample Course',
  description: 'Sample Description',
  duration: 125,
  creationDate: new Date('2021-07-20T10:00:00Z'),
  authors: ['1', '2'],
};

describe('CourseCard Component', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Router>
          <CourseCard
            course={sampleCourse}
            authors={initialState.authors.authors}
            onCourseSelect={jest.fn()}
          />
        </Router>
      </Provider>
    );
  });

  test('should display course title', () => {
    expect(screen.getByText('Sample Course')).toBeInTheDocument();
  });

  test('should display course description', () => {
    expect(screen.getByText('Sample Description')).toBeInTheDocument();
  });

  test('should display duration in HH:MM hours format', () => {
    expect(screen.getByText(/02:05 hours/i)).toBeInTheDocument();
  });

  test('should display all course authors', () => {
    expect(
      screen.getByText('Authors: Author One, Author Two')
    ).toBeInTheDocument();
  });

  test('should display creation date in DD.MM.YYYY format', () => {
    expect(screen.getByText('Creation date: 20.7.2021')).toBeInTheDocument();
  });

  test('should display DELETE and UPDATE buttons for admin role', () => {
    expect(screen.getByText('DELETE')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
  });
});