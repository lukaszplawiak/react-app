import React from 'react';

function Button(props) {
	return (
		<button className={`Button ${props.className}`} onClick={props.onClick}>
			{props.label}
		</button>
	);
}

export default Button;
