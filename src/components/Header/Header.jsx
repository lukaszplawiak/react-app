import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/user/thunk';
import { selectIsAuth, selectUserName } from '../../store/user/selectors';
import { LOGIN_LABEL } from '../../constants/ui';
import Logo from './components/Logo/Logo';
import Button from '../../common/Button/Button';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const userName = useSelector(selectUserName);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/registration';

  return (
    <div className="Header">
      <Logo />
      {!isAuthPage && (
        <>
          {userName && <div className="Hello">Hello, {userName}</div>}
          {isAuth ? (
            <Button
              label="Logout"
              className="ButtonHeader"
              onClick={handleLogout}
            />
          ) : (
            <Button
              label={LOGIN_LABEL}
              className="ButtonHeader"
              onClick={() => navigate('/login')}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Header;