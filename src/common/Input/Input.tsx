import type { ChangeEvent } from 'react';

import './Input.css';

interface InputProps {
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  placeholder?: string;
  type?: string;
}

function Input({
  name,
  value,
  onChange,
  error = null,
  placeholder = '',
  type = 'text',
}: InputProps) {
  return (
    <div className="input-wrapper">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? 'has-error' : undefined}
      />
      {error && <small className="error-text">{error}</small>}
    </div>
  );
}

export default Input;
