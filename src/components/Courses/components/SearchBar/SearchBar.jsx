import {
  INPUT_PLACEHOLDER,
  SEARCH_BUTTON_LABEL,
} from '../../../../common/Constants/Constants';

import React, { useState } from 'react';

import Button from '../../../../common/Button/Button';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

    const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  return (
    <form className="Search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={INPUT_PLACEHOLDER}
      />
      <Button
        label={SEARCH_BUTTON_LABEL}
        className="ButtonBar"
        type="submit"
      />
    </form>
  );
};

export default SearchBar;
