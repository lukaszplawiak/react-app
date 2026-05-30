import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Button from './Button';

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Button', () => {
  describe('renders as <button> by default', () => {
    it('renders label text', () => {
      renderWithRouter(<Button label="Click me" />);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('defaults to type="button"', () => {
      renderWithRouter(<Button label="Click me" />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('renders with type="submit" when specified', () => {
      renderWithRouter(<Button label="Submit" type="submit" />);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      renderWithRouter(<Button label="Click me" onClick={handleClick} />);
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
      renderWithRouter(<Button label="Click me" disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      renderWithRouter(
        <Button label="Click me" disabled onClick={handleClick} />
      );
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies custom className', () => {
      renderWithRouter(<Button label="Click me" className="my-class" />);
      expect(screen.getByRole('button')).toHaveClass('my-class');
    });

    it('applies variant class', () => {
      renderWithRouter(<Button label="Delete" variant="danger" />);
      expect(screen.getByRole('button')).toHaveClass('Button--danger');
    });
  });

  describe('renders as <Link> when to prop is provided', () => {
    it('renders an anchor element', () => {
      renderWithRouter(<Button label="Go to courses" to="/courses" />);
      expect(screen.getByRole('link', { name: 'Go to courses' })).toBeInTheDocument();
    });

    it('navigates to the correct path', () => {
      renderWithRouter(<Button label="Go to courses" to="/courses" />);
      expect(screen.getByRole('link')).toHaveAttribute('href', '/courses');
    });

    it('applies variant class on link', () => {
      renderWithRouter(
        <Button label="Go" to="/courses" variant="primary" />
      );
      expect(screen.getByRole('link')).toHaveClass('Button--primary');
    });
  });

  describe('renders as <span> when both to and disabled are provided', () => {
    it('renders a span instead of link or button', () => {
      renderWithRouter(<Button label="Disabled link" to="/courses" disabled />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText('Disabled link')).toBeInTheDocument();
    });

    it('has aria-disabled="true"', () => {
      renderWithRouter(<Button label="Disabled link" to="/courses" disabled />);
      expect(screen.getByText('Disabled link')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('applies Button--disabled class', () => {
      renderWithRouter(<Button label="Disabled link" to="/courses" disabled />);
      expect(screen.getByText('Disabled link')).toHaveClass('Button--disabled');
    });
  });
});