import { 
    signInWithPhoneNumber, 
    RecaptchaVerifier 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialize reCAPTCHA verifier
let recaptchaVerifier;

export function initializeRecaptcha() {
    try {
        if (!window.firebaseAuth) {
            throw new Error('Firebase Auth not initialized');
        }
        
        console.log("Initializing reCAPTCHA...");
        recaptchaVerifier = new RecaptchaVerifier(window.firebaseAuth, 'recaptcha-container', {
            'size': 'invisible'
        });
        
        // Make it globally available
        window.recaptchaVerifier = recaptchaVerifier;
        console.log("reCAPTCHA initialized successfully.");
    } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
        throw error;
    }
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
        console.log("Verifying phone OTP:", { confirmationResult, otp });
        const result = await confirmationResult.confirm(otp);
        console.log("Phone OTP verification successful:", result);
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

// Function to send email OTP using Firebase
export async function sendCustomEmailOTP(email) {
    try {
        if (!window.firebaseAuth) {
            throw new Error('Firebase Auth not initialized');
        }
        
        // Import additional Firebase functions
        const { sendSignInLinkToEmail } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        // Configure action code settings
        const actionCodeSettings = {
            url: window.location.origin + '/display-otp.html?email=' + email,
            handleCodeInApp: true,
        };
        
        // Send sign-in link to email
        await sendSignInLinkToEmail(window.firebaseAuth, email, actionCodeSettings);
        
        // Store email in localStorage for verification
        window.localStorage.setItem('emailForSignIn', email);
        
        return {
            success: true,
            message: 'Verification email sent successfully'
        };
    } catch (error) {
        console.error('Error sending email OTP:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to verify email link
export async function verifyCustomEmailOTP(email, link) {
    try {
        if (!window.firebaseAuth) {
            throw new Error('Firebase Auth not initialized');
        }
        
        const { isSignInWithEmailLink, signInWithEmailLink } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        if (isSignInWithEmailLink(window.firebaseAuth, link)) {
            const result = await signInWithEmailLink(window.firebaseAuth, email, link);
            
            // Clear email from localStorage
            window.localStorage.removeItem('emailForSignIn');
            
            return {
                success: true,
                user: result.user
            };
        } else {
            return {
                success: false,
                error: 'Invalid verification link'
            };
        }
    } catch (error) {
        console.error('Error verifying email link:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
