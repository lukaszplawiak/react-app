import React, { useState } from 'react';
import { INPUT_PLACEHOLDER, SEARCH_BUTTON_LABEL } from '../../../../constants';
import Button from '../../../../common/Button/Button';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <form className="Search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={INPUT_PLACEHOLDER}
      />
      <Button label={SEARCH_BUTTON_LABEL} className="ButtonBar" type="submit" />
    </form>
  );
};

export default SearchBar;