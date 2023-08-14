import React from 'react';

function Button(props) {
	return <button className={`Button ${props.className}`}>{props.label}</button>;
}

export default Button;
