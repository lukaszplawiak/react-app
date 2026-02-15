import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { API_BASE_URL } from '../../config';

function Registration() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationErrors = {};
    if (!userData.name) validationErrors.name = 'Name is required';
    if (!userData.email) validationErrors.email = 'Email is required';
    if (!userData.password) validationErrors.password = 'Password is required';
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (result.successful) {
      navigate('/login');
    } else {
      setErrors({ server: result.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="name"
        value={userData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Your Name"
      />
      <Input
        name="email"
        type="email"
        value={userData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Your Email"
      />
      <Input
        name="password"
        type="password"
        value={userData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Your Password"
      />
      <Button label="Registration" />
      <Link to="/login">
        If you have an account you may <strong>Login</strong>
      </Link>
    </form>
  );
}

export default Registration;
