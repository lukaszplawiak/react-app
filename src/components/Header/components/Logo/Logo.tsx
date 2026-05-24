import { Link } from 'react-router-dom';

import './Logo.css';

function Logo() {
  return (
    <Link to="/">
      <img src="/logo512.png" alt="logo" className="Logo" />
    </Link>
  );
}

export default Logo;
