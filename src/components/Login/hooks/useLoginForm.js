import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../store/user/thunk';
import { selectUserStatus } from '../../../store/user/selectors';
import isValidEmail from '../../../helpers/isValidEmail';

const validate = (formData) => {
  const errors = {};

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) errors.password = 'Password is required';

  return errors;
};

const getSafeRedirectPath = (search) => {
  const params = new URLSearchParams(search);
  const redirect = params.get('redirect');

  if (!redirect) return '/courses';

  const isSafeRelativePath =
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    !redirect.includes('://');

  return isSafeRelativePath ? redirect : '/courses';
};

const useLoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
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
      const redirectPath = getSafeRedirectPath(location.search);
      navigate(redirectPath, { replace: true });
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