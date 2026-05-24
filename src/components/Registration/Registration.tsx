import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';

import useRegistrationForm from './hooks/useRegistrationForm';

function Registration() {
  const { userData, errors, isLoading, handleChange, handleSubmit } =
    useRegistrationForm();

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
      <Button label="Click to login" to="/login" />
    </form>
  );
}

export default Registration;
