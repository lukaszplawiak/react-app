import React, { useState } from 'react';
import { INPUT_PLACEHOLDER } from '../../../../constants';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    const { value } = event.target;
    setQuery(value);
    onSearch(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="Search-bar" onSubmit={handleSubmit}>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={INPUT_PLACEHOLDER}
      />
    </form>
  );
};

export default SearchBar;