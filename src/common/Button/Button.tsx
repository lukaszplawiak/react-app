import { Link } from 'react-router-dom';

import './Button.css';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  to?: string;
  variant?: 'primary' | 'danger' | 'link';
}

function Button({
  className = '',
  onClick,
  label,
  type = 'button',
  disabled = false,
  to,
  variant = 'primary',
}: ButtonProps) {
  const classes = `Button Button--${variant} ${className}`.trim();

  if (to) {
    if (disabled) {
      if (import.meta.env.DEV) {
        console.warn(
          '[Button] Received both `to` and `disabled` props. ' +
            'Rendering as a non-interactive <span>. ' +
            'Consider whether this button should navigate at all when disabled.'
        );
      }
      return (
        <span className={`${classes} Button--disabled`} aria-disabled="true">
          {label}
        </span>
      );
    }

    return (
      <Link
        to={to}
        className={classes}
        style={{ display: 'inline-block', textDecoration: 'none' }}
      >
        {label}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export default Button;