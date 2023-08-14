import React from 'react';
import Logo from './components/Logo/Logo';
import Button from '../../common/Button/Button';
import '../../App.css';

function Header(props) {
	return (
		<div className='Header'>
			<Logo />
			<Button label='Login' className='ButtonHeader' />
		</div>
	);
}

export default Header;
