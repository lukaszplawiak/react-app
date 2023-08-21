import { LOGIN_LABEL } from '../../common/Constants/Constants';
import { useNavigate, useLocation } from 'react-router-dom';

import React from 'react';

import Logo from './components/Logo/Logo';
import Button from '../../common/Button/Button';

import './Header.css';

function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const userName = localStorage.getItem('userName');

	const handleLogout = () => {
		localStorage.removeItem('userToken');
		localStorage.removeItem('userName');
		navigate('/login');
	};

	return (
		<div className='Header'>
			<Logo />
			{location.pathname !== '/login' &&
				location.pathname !== '/registration' && (
					<>
						{userName && <div className='Hello'>Hello, {userName}</div>}
						{userName ? (
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
