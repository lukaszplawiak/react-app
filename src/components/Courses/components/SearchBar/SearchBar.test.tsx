import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders a text input', () => {
    render(<SearchBar value="" onSearch={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchBar value="react" onSearch={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('react');
  });

  it('calls onSearch with input value when user types', async () => {
    const onSearch = vi.fn();
    render(<SearchBar value="" onSearch={onSearch} />);
    await userEvent.type(screen.getByRole('textbox'), 'r');
    expect(onSearch).toHaveBeenCalledWith('r');
  });

  it('prevents default form submission on submit', () => {
    render(<SearchBar value="" onSearch={vi.fn()} />);
    const form = screen.getByRole('textbox').closest('form')!;
    const submitEvent = fireEvent.submit(form);
    // fireEvent.submit returns false if preventDefault was called
    expect(submitEvent).toBe(false);
  });
});
