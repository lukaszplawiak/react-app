/**
 * Validates email format using a practical regex pattern.
 * Covers the vast majority of real-world email addresses.
 * Not RFC 5322 compliant by design — full RFC compliance adds
 * complexity without meaningful benefit for most applications.
 *
 * Valid:   user@example.com, user.name+tag@sub.domain.co.uk
 * Invalid: notanemail, @domain.com, user@, user@domain
 */
const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase().trim());
};

export default isValidEmail;
