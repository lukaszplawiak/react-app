import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { MIN_PASSWORD_LENGTH } from '../../../constants';
import isValidEmail from '../../../helpers/isValidEmail';
import type { AppDispatch } from '../../../store';
import { selectUserStatus } from '../../../store/user/selectors';
import { registerUser } from '../../../store/user/thunk';
import type { RegistrationFormData } from '../../../types';

interface RegistrationFormErrors {
  name?: string;
  email?: string;
  password?: string;
  server?: string;
}

interface UseRegistrationFormReturn {
  userData: RegistrationFormData;
  errors: RegistrationFormErrors;
  isLoading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const validate = (userData: RegistrationFormData): RegistrationFormErrors => {
  const errors: RegistrationFormErrors = {};

  if (!userData.name) errors.name = 'Name is required';

  if (!userData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!userData.password) {
    errors.password = 'Password is required';
  } else if (userData.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return errors;
};

const useRegistrationForm = (): UseRegistrationFormReturn => {
  const [userData, setUserData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<RegistrationFormErrors>({});

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const status = useSelector(selectUserStatus);
  const isLoading = status === 'loading';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
        server: result.payload || 'Registration failed. Please try again.',
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
