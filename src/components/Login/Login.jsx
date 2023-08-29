import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/user/thunk';

function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [errors, setErrors] = useState({});
	const navigate = useNavigate();
	const dispatch = useDispatch();

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

		try {
			const resultAction = await dispatch(loginUser(formData));
			const { payload } = resultAction;
			if (payload && payload.isAuth) {
				setTimeout(() => navigate('/courses', { replace: true }), 0);
			}
		} catch (error) {
			setErrors({
				server: error.message || 'An error occurred while logging in.',
			});
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
			<Button label='Login' onClick={handleSubmit} />
			<Link to='/registration'>Don't have an account? Register here</Link>
		</form>
	);
}

export default Login;
