import React from 'react';
import './Button.css';
import PropTypes from 'prop-types';

function Button({
  className = '',
  onClick,
  label,
  type = 'button',
  disabled = false,
}) {
  return (
    <button
      type={type}
      className={`Button ${className}`}
      onClick={onClick}
      disabled={disabled}
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
  disabled: PropTypes.bool,
};

export default Button;