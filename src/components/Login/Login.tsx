import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useLoginForm from './hooks/useLoginForm';

// Login is a pure presentational component after hook extraction.
// All logic lives in useLoginForm — this component only renders.
// No Props interface needed — Login takes no props from parent.
function Login() {
  const { formData, errors, isLoading, handleChange, handleSubmit } =
    useLoginForm();

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
      <Button label="Click to register" to="/registration" />
    </form>
  );
}

export default Login;