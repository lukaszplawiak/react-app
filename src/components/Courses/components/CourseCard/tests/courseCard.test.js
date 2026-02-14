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
  },
  courses: [],
  authors: [
    { id: '1', name: 'Author One' },
    { id: '2', name: 'Author Two' },
  ],
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});

const sampleCourse = {
  title: 'Sample Course',
  description: 'Sample Description',
  duration: 125,
  creationDate: new Date('2021-07-20T10:00:00Z'),
  authors: ['1', '2'],
  id: 'sampleId',
};

describe('CourseCard Component', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Router>
          <CourseCard course={sampleCourse} authors={initialState.authors} />
        </Router>
      </Provider>
    );
  });

  test('CourseCard should display title', () => {
    expect(screen.getByText('Sample Course')).toBeInTheDocument();
  });

  test('CourseCard should display description', () => {
    expect(screen.getByText('Sample Description')).toBeInTheDocument();
  });

  test('CourseCard should display duration in the correct format', () => {
    const regex = new RegExp('02:05 hours', 'i');
    const durationElement = screen.getByText(regex);
    expect(durationElement).toBeInTheDocument();
  });

  test('CourseCard should display authors list', () => {
    expect(
      screen.getByText('Authors: Author One, Author Two')
    ).toBeInTheDocument();
  });

  test('CourseCard should display created date in the correct format', () => {
    expect(screen.getByText('Creation date: 20.7.2021')).toBeInTheDocument();
  });
});
