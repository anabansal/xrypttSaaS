// Store OTPs in memory with expiration
const otpStore = new Map();
const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email, otp) => {
  otpStore.set(email, {
    otp,
    expires: Date.now() + OTP_EXPIRY
  });
};

export const verifyOTP = (email, otp) => {
  const storedData = otpStore.get(email);
  if (!storedData) return false;
  
  if (Date.now() > storedData.expires) {
    otpStore.delete(email);
    return false;
  }

  if (storedData.otp === otp) {
    otpStore.delete(email);
    return true;
  }

  return false;
};