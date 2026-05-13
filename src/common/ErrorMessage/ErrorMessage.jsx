import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import './ErrorMessage.css';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <p className="error-container__message">
        {message || 'Something went wrong. Please try again.'}
      </p>
      {onRetry && (
        <Button label="Try again" onClick={onRetry} className="error-container__retry" />
      )}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
};

export default ErrorMessage;