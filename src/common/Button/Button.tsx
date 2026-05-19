import './Button.css';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

function Button({
  className = '',
  onClick,
  label,
  type = 'button',
  disabled = false,
}: ButtonProps) {
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

export default Button;