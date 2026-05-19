import type { ChangeEvent, FormEvent } from 'react';
import { INPUT_PLACEHOLDER } from '../../../../constants';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

function SearchBar({ value, onSearch }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSearch(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
  };

  return (
    <form className="Search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={INPUT_PLACEHOLDER}
      />
    </form>
  );
}

export default SearchBar;