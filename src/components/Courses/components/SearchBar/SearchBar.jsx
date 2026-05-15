import React from 'react';
import PropTypes from 'prop-types';
import { INPUT_PLACEHOLDER } from '../../../../constants';
import './SearchBar.css';

const SearchBar = ({ value, onSearch }) => {
  const handleChange = (event) => {
    onSearch(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="Search-bar" onSubmit={handleSubmit}>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={INPUT_PLACEHOLDER}
      />
    </form>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;