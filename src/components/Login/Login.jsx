import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';

function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [errors, setErrors] = useState({});
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		let validationErrors = {};
		if (!formData.email) validationErrors.email = 'Email is required';
		if (!formData.password) validationErrors.password = 'Password is required';
		if (Object.keys(validationErrors).length) {
			setErrors(validationErrors);
			return;
		}

		const response = await fetch('http://localhost:4000/login', {
			method: 'POST',
			body: JSON.stringify(formData),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const result = await response.json();

		if (result.successful && result.result) {
			localStorage.setItem('userToken', result.result);
			navigate('/courses');
		} else {
			setErrors({ server: result.message });
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<Input
				name='email'
				type='email'
				value={formData.email}
				onChange={handleChange}
				error={errors.email}
				placeholder='Your Email'
			/>
			<Input
				name='password'
				type='password'
				value={formData.password}
				onChange={handleChange}
				error={errors.password}
				placeholder='Your Password'
			/>
			<Button label='Login' />
			<Link to='/registration'>Don't have an account? Register here</Link>
		</form>
	);
}

export default Login;
