// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Your Firebase config (from Firebase Console > Project Settings > SDK setup)
const firebaseConfig = {
  apiKey: "AIzaSyBF91Hg4HuWHpsVDO2Kzne3iGQbEmxi9SU",
  authDomain: "verify-phone-number-and-email.firebaseapp.com",
  projectId: "verify-phone-number-and-email",
  storageBucket: "verify-phone-number-and-email.firebasestorage.app",
  messagingSenderId: "968011142094",
  appId: "1:968011142094:web:eaef9a91a0676bb644119f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Setup reCAPTCHA
window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
  size: 'invisible'
}, auth);

// Function to send OTP
export function sendOTP(phoneNumber) {
  return signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
}
