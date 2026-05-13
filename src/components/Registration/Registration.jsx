import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { registerUser } from '../../store/user/thunk';
import { selectUserStatus } from '../../store/user/selectors';

function Registration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const status = useSelector(selectUserStatus);
  const isLoading = status === 'loading';

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

  const validate = () => {
    const validationErrors = {};
    if (!userData.name) validationErrors.name = 'Name is required';
    if (!userData.email) validationErrors.email = 'Email is required';
    if (!userData.password) validationErrors.password = 'Password is required';
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const resultAction = await dispatch(registerUser(userData));

    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/login');
    } else {
      setErrors({
        server:
          resultAction.payload || 'Registration failed. Please try again.',
      });
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
      {errors.server && <p className="error-message">{errors.server}</p>}
      <Button
        type="submit"
        label={isLoading ? 'Registering...' : 'Register'}
        disabled={isLoading}
      />
      <Link to="/login">
        If you have an account you may <strong>Login</strong>
      </Link>
    </form>
  );
}

export default Registration;