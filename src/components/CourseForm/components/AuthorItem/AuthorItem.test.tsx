import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import AuthorItem from './AuthorItem';

const sampleAuthor = { id: 'a1', name: 'Ada Lovelace' };

const renderAuthorItem = (onAction = vi.fn(), action = 'Add') =>
  render(
    <MemoryRouter>
      <AuthorItem author={sampleAuthor} onAction={onAction} action={action} />
    </MemoryRouter>
  );

describe('AuthorItem', () => {
  it('renders author name', () => {
    renderAuthorItem();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('renders action button with correct label', () => {
    renderAuthorItem(vi.fn(), 'Remove');
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', async () => {
    const onAction = vi.fn();
    renderAuthorItem(onAction);
    await userEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});