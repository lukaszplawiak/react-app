import React from 'react';
import PropTypes from 'prop-types';

function Button({ className, onClick, label }) {
  return (
    <button className={`Button ${className}`} onClick={onClick}>
      {label}
    </button>
  );
}

Button.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

Button.defaultProps = {
  className: '',
};

export default Button;
