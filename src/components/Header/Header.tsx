import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import {
  selectIsAdmin,
  selectIsAuth,
  selectUserName,
} from '../../store/user/selectors';
import { logoutUser } from '../../store/user/thunk';

import Logo from './components/Logo/Logo';

import Button from '../../common/Button/Button';

import { LOGIN_LABEL } from '../../constants';

import type { AppDispatch } from '../../store';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const userName = useSelector(selectUserName);

  const handleLogout = async (): Promise<void> => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/registration';

  return (
    <div className="Header">
      <div className="Header-left">
        <Logo />
      </div>
      {!isAuthPage && userName && (
        <div className="Hello">Hello, {userName}</div>
      )}
      {!isAuthPage && (
        <div className="Header-right">
          {isAuth ? (
            <div className="Header-actions">
              <Button
                label="Logout"
                className="ButtonHeader"
                onClick={handleLogout}
              />
              {isAdmin && (
                <Button
                  label="Enrolled Students"
                  className="ButtonHeader ButtonHeader--secondary"
                  to="/enrolled"
                />
              )}
            </div>
          ) : (
            <Button
              label={LOGIN_LABEL}
              className="ButtonHeader"
              onClick={() => navigate('/login')}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Header;
