import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/user/thunk';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const status = useSelector((state) => state.user.status);
  const isLoading = status === 'loading';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const validationErrors = {};
    if (!formData.email) validationErrors.email = 'Email is required';
    if (!formData.password) validationErrors.password = 'Password is required';
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const resultAction = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/courses', { replace: true });
    } else {
      setErrors({
        server:
          resultAction.payload ||
          'An error occurred while logging in. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Your Email"
      />
      <Input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Your Password"
      />
      {errors.server && <p className="error-message">{errors.server}</p>}
      <Button
        type="submit"
        label={isLoading ? 'Logging in...' : 'Login'}
        disabled={isLoading}
      />
      <Link to="/registration">{"Don't have an account? Register here"}</Link>
    </form>
  );
}

export default Login;