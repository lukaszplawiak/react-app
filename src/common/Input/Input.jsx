import React from 'react';
import PropTypes from 'prop-types';
import { HAS_ERROR_CLASS, ERROR_TEXT_CLASS } from '../../constants';

function Input({
  name,
  value,
  onChange,
  error = null,
  placeholder = '',
  type = 'text',
}) {
  const inputClassName = `input-class${error ? ` ${HAS_ERROR_CLASS}` : ''}`;

  return (
    <div className="input-wrapper">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClassName}
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

export default Input;