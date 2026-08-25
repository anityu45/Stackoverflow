import crypto from "crypto";

/**
 * Generate a cryptographically secure 6-digit numeric OTP string
 */
export const generateNumericOtp = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const randomNumber = crypto.randomInt(min, max + 1);
  return randomNumber.toString();
};

/**
 * Calculate OTP expiry timestamp
 */
export const getOtpExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Verify if OTP is valid and non-expired
 */
export const verifyOtpToken = (inputOtp, storedOtp, expiryDate) => {
  if (!storedOtp || !expiryDate) return { valid: false, reason: "No active OTP found" };
  if (new Date() > new Date(expiryDate)) return { valid: false, reason: "OTP has expired" };
  if (inputOtp !== storedOtp) return { valid: false, reason: "Invalid OTP code" };
  return { valid: true };
};
