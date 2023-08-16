import { LOGIN_LABEL } from '../../common/Constants/Constants';

import React from 'react';

import Logo from './components/Logo/Logo';
import Button from '../../common/Button/Button';

import './Header.css';

function Header(props) {
	return (
		<div className='Header'>
			<Logo />
			<Button label={LOGIN_LABEL} className='ButtonHeader' />
		</div>
	);
}

export default Header;
