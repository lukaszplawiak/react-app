import React, { useState } from 'react';
import Button from '../../../../common/Button/Button';

const SearchBar = ({ onSearch }) => {
	const [query, setQuery] = useState('');

	const handleSearch = () => {
		onSearch(query);
	};

	const handleChange = (event) => {
		setQuery(event.target.value);
	};

	return (
		<div className='search-bar'>
			<input
				type='text'
				value={query}
				onChange={handleChange}
				placeholder='Search by title or id...'
			/>
			<Button label='Search' onClick={handleSearch} />
		</div>
	);
};

export default SearchBar;
