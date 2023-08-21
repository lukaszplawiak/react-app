import React from 'react';
import { HAS_ERROR_CLASS, ERROR_TEXT_CLASS } from './../Constants/Constants';
import PropTypes from 'prop-types';

function Input({ name, value, onChange, error, placeholder, type = 'text' }) {
	let inputClasses = 'input-class';

	if (error) {
		inputClasses += ` ${HAS_ERROR_CLASS}`;
	}

	return (
		<div className='input-wrapper'>
			<input
				type={type}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className={inputClasses}
			/>
			{error && <small className={ERROR_TEXT_CLASS}>{error}</small>}
		</div>
	);
}

Input.propTypes = {
	name: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	onChange: PropTypes.func.isRequired,
	error: PropTypes.string,
	placeholder: PropTypes.string,
	type: PropTypes.string,
};

Input.defaultProps = {
	type: 'text',
	error: null,
	placeholder: '',
};

export default Input;
