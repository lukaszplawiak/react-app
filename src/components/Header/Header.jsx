import React from 'react';
import { LOGIN_LABEL } from '../../common/Constants/Constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/user/thunk';
import Logo from './components/Logo/Logo';
import Button from '../../common/Button/Button';

import './Header.css';

function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const user = useSelector((state) => state.user);

	const handleLogout = async () => {
		await dispatch(logoutUser());
		navigate('/login');
	};

	return (
		<div className='Header'>
			<Logo />
			{location.pathname !== '/login' &&
				location.pathname !== '/registration' && (
					<>
						{user.name && <div className='Hello'>Hello, {user.name}</div>}
						{user.isAuth ? (
							<Button
								label='Logout'
								className='ButtonHeader'
								onClick={handleLogout}
							/>
						) : (
							<Button
								label={LOGIN_LABEL}
								className='ButtonHeader'
								onClick={() => navigate('/login')}
							/>
						)}
					</>
				)}
		</div>
	);
}

export default Header;
