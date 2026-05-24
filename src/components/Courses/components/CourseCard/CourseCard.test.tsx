import { MemoryRouter as Router } from 'react-router-dom';

import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import { fireEvent, render, screen } from '@testing-library/react';

import authorsReducer from '../../../../store/authors/reducer';
import coursesReducer from '../../../../store/courses/reducer';
import enrollmentsReducer from '../../../../store/enrollments/reducer';
import userReducer from '../../../../store/user/reducer';
import type {
  Author,
  AuthorsState,
  Course,
  CoursesState,
  EnrollmentsState,
  UserState,
} from '../../../../types';
import CourseCard from './CourseCard';

vi.mock('../../../../services');

interface TestPreloadedState {
  user: UserState;
  courses: CoursesState;
  authors: AuthorsState;
  enrollments: EnrollmentsState;
}

const testAuthors: Author[] = [
  { id: '1', name: 'Author One' },
  { id: '2', name: 'Author Two' },
];

const sampleCourse: Course = {
  id: 'sampleId',
  title: 'Sample Course',
  description: 'Sample Description',
  duration: 125,
  creationDate: '2021-07-20T10:00:00Z',
  authors: ['1', '2'],
};

const initialState: TestPreloadedState = {
  user: {
    isAuth: true,
    name: 'username',
    email: 'admin@test.com',
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
    authors: testAuthors,
    status: 'succeeded',
    error: null,
  },
  enrollments: {
    enrollments: [],
    status: 'idle',
    error: null,
  },
};

const buildStore = (state: TestPreloadedState = initialState) =>
  configureStore({
    reducer: {
      user: userReducer,
      courses: coursesReducer,
      authors: authorsReducer,
      enrollments: enrollmentsReducer,
    },
    preloadedState: state,
  });

// Typed render helper — TypeScript ensures all required props are passed.
// Missing or mistyped props cause compile-time error, not runtime crash.
interface RenderOptions {
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string) => void;
  state?: TestPreloadedState;
}

const renderCourseCard = ({
  isAdmin = true,
  onDelete = vi.fn(),
  onUpdate = vi.fn(),
  state = initialState,
}: RenderOptions = {}) =>
  render(
    <Provider store={buildStore(state)}>
      <Router>
        <CourseCard
          course={sampleCourse}
          authors={testAuthors}
          isAdmin={isAdmin}
          onCourseSelect={vi.fn()}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      </Router>
    </Provider>
  );

describe('CourseCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    renderCourseCard({ isAdmin: true });
    expect(screen.getByText('DELETE')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
  });

  it('should not display DELETE and UPDATE buttons for non-admin role', () => {
    renderCourseCard({ isAdmin: false });
    expect(screen.queryByText('DELETE')).not.toBeInTheDocument();
    expect(screen.queryByText('UPDATE')).not.toBeInTheDocument();
  });

  it('should call onDelete with course id when DELETE button is clicked', () => {
    const onDelete = vi.fn();
    renderCourseCard({ onDelete });
    fireEvent.click(screen.getByText('DELETE'));
    expect(onDelete).toHaveBeenCalledWith(sampleCourse.id);
  });
});
