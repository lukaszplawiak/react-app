import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../store/user/thunk';
import { selectUserStatus } from '../../../store/user/selectors';

const validate = (formData) => {
  const errors = {};
  if (!formData.email) errors.email = 'Email is required';
  if (!formData.password) errors.password = 'Password is required';
  return errors;
};

const useLoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const status = useSelector(selectUserStatus);
  const isLoading = status === 'loading';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      navigate('/courses', { replace: true });
    } else {
      setErrors({
        server:
          result.payload ||
          'An error occurred while logging in. Please try again.',
      });
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  };
};

export default useLoginForm;