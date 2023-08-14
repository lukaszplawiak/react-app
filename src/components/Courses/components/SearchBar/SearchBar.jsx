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
		<div className='Search-bar'>
			<input
				type='text'
				value={query}
				onChange={handleChange}
				placeholder='Input text'
			/>
			<Button label='SEARCH' className='ButtonBar' onClick={handleSearch} />
		</div>
	);
};

export default SearchBar;
