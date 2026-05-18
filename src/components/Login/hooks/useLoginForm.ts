import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../store/user/thunk';
import { selectUserStatus } from '../../../store/user/selectors';
import isValidEmail from '../../../helpers/isValidEmail';
import type { AppDispatch } from '../../../store';
import type { LoginFormData } from '../../../types';

interface LoginFormErrors {
  email?: string;
  password?: string;
  server?: string;
}

interface UseLoginFormReturn {
  formData: LoginFormData;
  errors: LoginFormErrors;
  isLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Returns the redirect path from the URL query string if it is safe.
 * Accepts only relative paths (starting with /) to prevent open redirect.
 * Protocol-relative URLs (//evil.com) are explicitly rejected.
 */
const getSafeRedirectPath = (search: string): string => {
  const params = new URLSearchParams(search);
  const redirect = params.get('redirect');

  if (!redirect) return '/courses';

  const isSafeRelativePath =
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    !redirect.includes('://');

  return isSafeRelativePath ? redirect : '/courses';
};

const validate = (formData: LoginFormData): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) errors.password = 'Password is required';

  return errors;
};

const useLoginForm = (): UseLoginFormReturn => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const status = useSelector(selectUserStatus);
  const isLoading = status === 'loading';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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