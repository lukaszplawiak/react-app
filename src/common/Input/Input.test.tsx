import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import Input from './Input';

describe('Input', () => {
  const defaultProps = {
    name: 'email',
    value: '',
    onChange: vi.fn(),
  };

  it('renders an input element', () => {
    render(<Input {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with correct name attribute', () => {
    render(<Input {...defaultProps} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email');
  });

  it('renders with provided value', () => {
    render(<Input {...defaultProps} value="test@example.com" />);
    expect(screen.getByRole('textbox')).toHaveValue('test@example.com');
  });

  it('renders with placeholder', () => {
    render(<Input {...defaultProps} placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders with type="password"', () => {
    render(<Input {...defaultProps} type="password" />);
    expect(
      document.querySelector('input[type="password"]')
    ).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = vi.fn();
    render(<Input {...defaultProps} onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows error message when error prop is provided', () => {
    render(<Input {...defaultProps} error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('does not show error message when error is null', () => {
    render(<Input {...defaultProps} error={null} />);
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});
