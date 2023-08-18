import { LOGIN_LABEL } from '../../common/Constants/Constants';
import { useNavigate, useLocation } from 'react-router-dom';

import React from 'react';

import Logo from './components/Logo/Logo';
import Button from '../../common/Button/Button';

import './Header.css';

function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const username = localStorage.getItem('username');

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('username');
		navigate('/login');
	};

	return (
		<div className='Header'>
			<Logo />
			{location.pathname !== '/login' &&
				location.pathname !== '/registration' && (
					<>
						{username && <span>Hello, {username}</span>}
						{username ? (
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
