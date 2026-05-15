import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../store/user/thunk';
import { selectUserStatus } from '../../../store/user/selectors';
import isValidEmail from '../../../helpers/isValidEmail';

const validate = (userData) => {
  const errors = {};

  if (!userData.name) errors.name = 'Name is required';

  if (!userData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!userData.password) errors.password = 'Password is required';

  return errors;
};

const useRegistrationForm = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const status = useSelector(selectUserStatus);
  const isLoading = status === 'loading';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(userData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const result = await dispatch(registerUser(userData));

    if (registerUser.fulfilled.match(result)) {
      navigate('/login');
    } else {
      setErrors({
        server:
          result.payload || 'Registration failed. Please try again.',
      });
    }
  };

  return {
    userData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  };
};

export default useRegistrationForm;