import { Link } from 'react-router-dom';
import './Logo.css';

function Logo() {
  return (
    <Link to="/">
      <img src="/react-logo.png" alt="logo" className="Logo" />
    </Link>
  );
}

export default Logo;