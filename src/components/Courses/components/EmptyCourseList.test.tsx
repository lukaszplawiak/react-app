import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import EmptyCourseList from './EmptyCourseList';

const renderEmptyCourseList = (isAdmin: boolean) =>
  render(
    <MemoryRouter>
      <EmptyCourseList isAdmin={isAdmin} />
    </MemoryRouter>
  );

describe('EmptyCourseList', () => {
  it('renders no courses found message', () => {
    renderEmptyCourseList(false);
    expect(screen.getByText('No courses found.')).toBeInTheDocument();
  });

  it('shows Add New Course button for admin', () => {
    renderEmptyCourseList(true);
    expect(
      screen.getByRole('button', { name: 'Add New Course' })
    ).toBeInTheDocument();
  });

  it('does not show Add New Course button for non-admin', () => {
    renderEmptyCourseList(false);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
