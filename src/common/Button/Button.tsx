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
    return (
      <Link to={to} className={classes} style={{ display: 'inline-block', textDecoration: 'none' }}>
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