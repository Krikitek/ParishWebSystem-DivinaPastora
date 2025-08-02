// payment-handler.js - Handle GCash payment flow

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const payWithGCashBtn = document.getElementById('pay-with-gcash-btn');
  const gcashMobileInput = document.getElementById('gcash-mobile');
  const gcashAmountInput = document.getElementById('gcash-amount');
  const totalAmountElement = document.getElementById('total-amount');
  const referenceNumberElement = document.getElementById('reference-number');
  
  // OTP Modal elements
  const otpModal = document.getElementById('otp-modal');
  const otpInputs = document.querySelectorAll('.otp-input');
  const otpErrorMessage = document.getElementById('otp-error-message');
  const otpTimerElement = document.getElementById('otp-timer');
  const resendOtpBtn = document.getElementById('resend-otp-btn');
  const verifyOtpBtn = document.getElementById('verify-otp-btn');
  const cancelOtpBtn = document.getElementById('cancel-otp-btn');
  
  // Success/Failure elements
  const paymentFormContainer = document.getElementById('payment-form-container');
  const paymentSuccessContainer = document.getElementById('payment-success');
  const paymentFailedContainer = document.getElementById('payment-failed');
  const receiptDateElement = document.getElementById('receipt-date');
  const transactionIdElement = document.getElementById('transaction-id');
  const receiptGcashNumberElement = document.getElementById('receipt-gcash-number');
  const receiptAmountElement = document.getElementById('receipt-amount');
  const paymentErrorMessageElement = document.getElementById('payment-error-message');
  const paymentErrorCodeElement = document.getElementById('payment-error-code');
  
  // Action buttons
  const printReceiptBtn = document.getElementById('print-receipt-btn');
  const goToDashboardBtn = document.getElementById('go-to-dashboard-btn');
  const tryAgainBtn = document.getElementById('try-again-btn');
  const contactSupportBtn = document.getElementById('contact-support-btn');
  const backBtn = document.getElementById('back-btn');
  
  // Current transaction data
  let currentTransaction = null;
  let otpTimer = null;
  
  // Initialize payment form
  function initPaymentForm() {
    // Load data from localStorage
    const baptismRequestData = JSON.parse(localStorage.getItem('baptismRequestData') || '{}');
    
    // Set amount to pay
    const amount = totalAmountElement.textContent.replace('₱', '').trim();
    gcashAmountInput.value = amount;
    
    // Set reference number
    const referenceNumber = referenceNumberElement.textContent;
    
    // Pre-fill GCash mobile number if available
    if (baptismRequestData.requesterMobile) {
      gcashMobileInput.value = baptismRequestData.requesterMobile;
    }
    
    // Add event listeners
    payWithGCashBtn.addEventListener('click', handlePayWithGCash);
    backBtn.addEventListener('click', handleBack);
    
    // OTP input handling
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Only allow digits
        if (!/^\d*$/.test(value)) {
          e.target.value = '';
          return;
        }
        
        // Move to next input if value is entered
        if (value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });
      
      // Handle backspace to go to previous input
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });
    
    // OTP modal buttons
    verifyOtpBtn.addEventListener('click', handleVerifyOtp);
    cancelOtpBtn.addEventListener('click', handleCancelOtp);
    resendOtpBtn.addEventListener('click', handleResendOtp);
    
    // Success/Failure buttons
    printReceiptBtn.addEventListener('click', handlePrintReceipt);
    goToDashboardBtn.addEventListener('click', handleGoToDashboard);
    tryAgainBtn.addEventListener('click', handleTryAgain);
    contactSupportBtn.addEventListener('click', handleContactSupport);
  }
  
  // Handle "Pay with GCash" button click
  async function handlePayWithGCash() {
    // Validate GCash mobile number
    const mobileNumber = gcashMobileInput.value.trim();
    if (!/^09\d{9}$/.test(mobileNumber)) {
      alert('Please enter a valid GCash mobile number (format: 09XXXXXXXXX)');
      gcashMobileInput.focus();
      return;
    }
    
    // Get amount and reference number
    const amount = parseFloat(gcashAmountInput.value.replace(/[^\d.]/g, ''));
    const referenceNumber = referenceNumberElement.textContent;
    
    try {
      // Initialize payment
      const initResult = await gcashAPI.initializePayment(mobileNumber, amount, referenceNumber);
      
      if (!initResult.success) {
        showPaymentFailed(initResult.error, initResult.errorCode);
        return;
      }
      
      // Store transaction ID
      currentTransaction = initResult.transactionId;
      
      // Process payment
      const processResult = await gcashAPI.processPayment(currentTransaction);
      
      if (!processResult.success) {
        showPaymentFailed(processResult.error, processResult.errorCode);
        return;
      }
      
      // If OTP is required, show OTP modal
      if (processResult.state === gcashAPI.STATES.OTP_REQUIRED) {
        showOtpModal(processResult.otpExpiry);
      }
    } catch (error) {
      console.error('Payment error:', error);
      showPaymentFailed('An unexpected error occurred. Please try again.', 'GC-9999');
    }
  }
  
  // Show OTP verification modal
  function showOtpModal(otpExpiry) {
    // Clear previous OTP inputs
    otpInputs.forEach(input => {
      input.value = '';
    });
    
    // Clear error message
    otpErrorMessage.textContent = '';
    
    // Focus first input
    otpInputs[0].focus();
    
    // Start OTP timer
    startOtpTimer(otpExpiry);
    
    // Show modal
    otpModal.style.display = 'block';
  }
  
  // Start OTP timer
  function startOtpTimer(expiryTimeString) {
    // Clear existing timer
    if (otpTimer) {
      clearInterval(otpTimer);
    }
    
    const expiryTime = new Date(expiryTimeString).getTime();
    
    // Update timer every second
    otpTimer = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = expiryTime - now;
      
      if (timeLeft <= 0) {
        // Timer expired
        clearInterval(otpTimer);
        otpTimerElement.textContent = '00:00';
        otpErrorMessage.textContent = 'OTP has expired. Please request a new one.';
        resendOtpBtn.disabled = false;
        return;
      }
      
      // Calculate minutes and seconds
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      // Display timer
      otpTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Enable resend button after 1 minute
      if (timeLeft < (expiryTime - (1000 * 60))) {
        resendOtpBtn.disabled = false;
      }
    }, 1000);
  }
  
  // Handle OTP verification
  async function handleVerifyOtp() {
    // Get OTP value
    let otpValue = '';
    otpInputs.forEach(input => {
      otpValue += input.value;
    });
    
    // Validate OTP format
    if (!/^\d{6}$/.test(otpValue)) {
      otpErrorMessage.textContent = 'Please enter a valid 6-digit OTP';
      return;
    }
    
    try {
      // Verify OTP
      const verifyResult = await gcashAPI.verifyOTP(currentTransaction, otpValue);
      
      // Close OTP modal
      otpModal.style.display = 'none';
      
      if (!verifyResult.success) {
        showPaymentFailed(verifyResult.error, verifyResult.errorCode);
        return;
      }
      
      // Show payment success
      showPaymentSuccess(verifyResult);
      
      // Clear baptism request data from localStorage
      localStorage.removeItem('baptismRequestData');
    } catch (error) {
      console.error('OTP verification error:', error);
      otpErrorMessage.textContent = 'An error occurred during verification. Please try again.';
    }
  }
  
  // Handle OTP cancellation
  function handleCancelOtp() {
    // Clear timer
    if (otpTimer) {
      clearInterval(otpTimer);
    }
    
    // Hide modal
    otpModal.style.display = 'none';
  }
  
  // Handle OTP resend
  async function handleResendOtp() {
    try {
      // Disable resend button
      resendOtpBtn.disabled = true;
      
      // Resend OTP
      const resendResult = await gcashAPI.resendOTP(currentTransaction);
      
      if (!resendResult.success) {
        otpErrorMessage.textContent = resendResult.error;
        return;
      }
      
      // Clear OTP inputs
      otpInputs.forEach(input => {
        input.value = '';
      });
      
      // Focus first input
      otpInputs[0].focus();
      
      // Clear error message
      otpErrorMessage.textContent = '';
      
      // Restart timer
      startOtpTimer(resendResult.otpExpiry);
      
      // Show success message
      otpErrorMessage.textContent = 'A new OTP has been sent to your GCash mobile number.';
      otpErrorMessage.style.color = '#4caf50';
      
      // Reset error message color after 3 seconds
      setTimeout(() => {
        otpErrorMessage.style.color = '';
        otpErrorMessage.textContent = '';
      }, 3000);
    } catch (error) {
      console.error('OTP resend error:', error);
      otpErrorMessage.textContent = 'Failed to resend OTP. Please try again.';
    }
  }
  
  // Show payment success
  function showPaymentSuccess(paymentResult) {
    // Hide payment form
    paymentFormContainer.style.display = 'none';
    
    // Set receipt details
    const formattedDate = new Date(paymentResult.completedAt).toLocaleString();
    receiptDateElement.textContent = formattedDate;
    transactionIdElement.textContent = paymentResult.transactionId;
    receiptGcashNumberElement.textContent = paymentResult.mobileNumber;
    receiptAmountElement.textContent = `₱${paymentResult.amount.toFixed(2)}`;
    
    // Show success container
    paymentSuccessContainer.style.display = 'block';
  }
  
  // Show payment failed
  function showPaymentFailed(errorMessage, errorCode) {
    // Hide payment form
    paymentFormContainer.style.display = 'none';
    
    // Set error details
    paymentErrorMessageElement.textContent = errorMessage;
    paymentErrorCodeElement.textContent = `Error Code: ${errorCode}`;
    
    // Show failed container
    paymentFailedContainer.style.display = 'block';
  }
  
  // Handle print receipt
  function handlePrintReceipt() {
    window.print();
  }
  
  // Handle go to dashboard
  function handleGoToDashboard() {
    window.location.href = 'dashboard-user.html';
  }
  
  // Handle try again
  function handleTryAgain() {
    // Hide failed container
    paymentFailedContainer.style.display = 'none';
    
    // Show payment form
    paymentFormContainer.style.display = 'block';
  }
  
  // Handle contact support
  function handleContactSupport() {
    // In a real application, this would open a support chat or contact form
    alert('Please contact our support team at support@chronos.com or call (02) 8123-4567');
  }
  
  // Handle back button
  function handleBack() {
    window.location.href = 'acknowledgement.html';
  }
  
  // Initialize payment form
  initPaymentForm();
});