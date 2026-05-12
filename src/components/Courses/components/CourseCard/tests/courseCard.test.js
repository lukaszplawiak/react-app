import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../../../../store/user/reducer';
import coursesReducer from '../../../../../store/courses/reducer';
import authorsReducer from '../../../../../store/authors/reducer';
import CourseCard from '../CourseCard';
import { deleteCourseService } from '../../../../../services';

jest.mock('../../../../../services');

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

const sampleCourse = {
  id: 'sampleId',
  title: 'Sample Course',
  description: 'Sample Description',
  duration: 125,
  creationDate: new Date('2021-07-20T10:00:00Z'),
  authors: ['1', '2'],
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

const renderCourseCard = (state = initialState) =>
  render(
    <Provider store={buildStore(state)}>
      <Router>
        <CourseCard
          course={sampleCourse}
          authors={initialState.authors.authors}
          onCourseSelect={jest.fn()}
        />
      </Router>
    </Provider>
  );

describe('CourseCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    deleteCourseService.mockResolvedValue({
      data: { successful: true },
    });
  });

  it('should display course title', () => {
    renderCourseCard();
    expect(screen.getByText('Sample Course')).toBeInTheDocument();
  });

  it('should display course description', () => {
    renderCourseCard();
    expect(screen.getByText('Sample Description')).toBeInTheDocument();
  });

  it('should display duration in HH:MM hours format', () => {
    renderCourseCard();
    expect(screen.getByText(/02:05 hours/i)).toBeInTheDocument();
  });

  it('should display all course authors', () => {
    renderCourseCard();
    expect(
      screen.getByText('Authors: Author One, Author Two')
    ).toBeInTheDocument();
  });

  it('should display creation date in DD.MM.YYYY format', () => {
    renderCourseCard();
    expect(screen.getByText('Creation date: 20.07.2021')).toBeInTheDocument();
  });

  it('should display DELETE and UPDATE buttons for admin role', () => {
    renderCourseCard();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
  });

  it('should not display DELETE and UPDATE buttons for non-admin role', () => {
    const userState = {
      ...initialState,
      user: { ...initialState.user, role: 'user' },
    };

    renderCourseCard(userState);

    expect(screen.queryByText('DELETE')).not.toBeInTheDocument();
    expect(screen.queryByText('UPDATE')).not.toBeInTheDocument();
  });

  it('should call deleteCourseService when DELETE button is clicked', async () => {
    renderCourseCard();

    fireEvent.click(screen.getByText('DELETE'));

    await waitFor(() => {
      expect(deleteCourseService).toHaveBeenCalledWith(sampleCourse.id);
    });
  });
});