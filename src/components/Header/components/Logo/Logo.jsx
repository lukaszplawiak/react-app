import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Logo.css';

function Logo() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/courses');
  };

  return (
    <img
      className="Logo"
      src="/logo192.png"
      alt="Logo"
      onClick={handleLogoClick}
    />
  );
}

export default Logo;