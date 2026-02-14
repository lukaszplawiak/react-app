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

  return (
    <div className="Search-bar">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={INPUT_PLACEHOLDER}
      />
      <Button
        label={SEARCH_BUTTON_LABEL}
        className="ButtonBar"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
