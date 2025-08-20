import { 
    signInWithPhoneNumber, 
    sendEmailVerification,
    createUserWithEmailAndPassword,
    RecaptchaVerifier 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialize reCAPTCHA verifier
let recaptchaVerifier;

export function initializeRecaptcha() {
    if (!window.firebaseAuth) {
        throw new Error('Firebase Auth not initialized');
    }
    
    recaptchaVerifier = new RecaptchaVerifier(window.firebaseAuth, 'recaptcha-container', {
        'size': 'invisible'
    });
    
    // Make it globally available
    window.recaptchaVerifier = recaptchaVerifier;
}

// Function to send OTP via phone
export async function sendPhoneOTP(phoneNumber) {
    try {
        if (!window.firebaseAuth) {
            throw new Error('Firebase Auth not initialized');
        }
        
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        const confirmationResult = await signInWithPhoneNumber(window.firebaseAuth, formattedPhone, recaptchaVerifier);
        return {
            success: true,
            confirmationResult
        };
    } catch (error) {
        console.error('Error sending phone OTP:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to verify phone OTP
export async function verifyPhoneOTP(confirmationResult, otp) {
    try {
        const result = await confirmationResult.confirm(otp);
        return {
            success: true,
            user: result.user
        };
    } catch (error) {
        console.error('Error verifying phone OTP:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to handle email verification
export async function handleEmailVerification(email, password) {
    try {
        if (!window.firebaseAuth) {
            throw new Error('Firebase Auth not initialized');
        }
        
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
        
        // Send email verification
        await sendEmailVerification(userCredential.user);
        
        return {
            success: true,
            message: 'Verification email sent successfully'
        };
    } catch (error) {
        console.error('Error sending email verification:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
