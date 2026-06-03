import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders null message as empty paragraph', () => {
    render(<ErrorMessage message={null} />);
    expect(screen.getByRole('paragraph')).toBeInTheDocument();
  });

  it('renders Try again button when onRetry is provided', () => {
    render(<ErrorMessage message="Error" onRetry={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Try again' })
    ).toBeInTheDocument();
  });

  it('does not render Try again button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry when Try again is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
