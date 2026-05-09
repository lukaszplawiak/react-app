import React from 'react';
import './Button.css';
import PropTypes from 'prop-types';

function Button({ className = '', onClick, label, type = 'button' }) {
  return (
    <button
      type={type}
      className={`Button ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;