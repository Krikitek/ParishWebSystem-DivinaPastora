// gcash-api.js - GCash Payment API Integration

class GCashPaymentAPI {
  constructor() {
    // Simulated API configuration
    this.apiEndpoint = 'https://api.gcash.com/v1/payments'; // This is a simulated endpoint
    this.merchantId = 'PARISH_CHRONOS_001';
    this.apiKey = 'sim_gcash_api_key_12345';
    
    // Transaction states
    this.STATES = {
      INITIALIZED: 'initialized',
      PROCESSING: 'processing',
      OTP_REQUIRED: 'otp_required',
      COMPLETED: 'completed',
      FAILED: 'failed'
    };
  }
  
  // Initialize a payment transaction
  async initializePayment(mobileNumber, amount, referenceNumber) {
    // Show loading overlay
    document.getElementById('payment-processing-overlay').style.display = 'flex';
    
    try {
      // In a real implementation, this would be an actual API call
      // For simulation, we'll use a timeout to mimic network request
      await this._simulateApiCall(1500);
      
      // Validate mobile number format (must be 11 digits starting with 09)
      if (!/^09\d{9}$/.test(mobileNumber)) {
        throw new Error('Invalid GCash mobile number format. Must start with 09 and be 11 digits.');
      }
      
      // Validate amount (must be a positive number)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid payment amount.');
      }
      
      // Create a transaction ID
      const transactionId = this._generateTransactionId();
      
      // Store transaction details in sessionStorage for the current session
      const transaction = {
        id: transactionId,
        mobileNumber,
        amount,
        referenceNumber,
        state: this.STATES.INITIALIZED,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem('gcash_transaction', JSON.stringify(transaction));
      
      // Return transaction details
      return {
        success: true,
        transactionId,
        state: this.STATES.INITIALIZED,
        message: 'Payment initialized successfully'
      };
    } catch (error) {
      console.error('GCash payment initialization error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize payment',
        errorCode: 'GC-1001'
      };
    } finally {
      // Hide loading overlay
      document.getElementById('payment-processing-overlay').style.display = 'none';
    }
  }
  
  // Process the payment (after initialization)
  async processPayment(transactionId) {
    // Show loading overlay
    document.getElementById('payment-processing-overlay').style.display = 'flex';
    
    try {
      // Get transaction from storage
      const transactionJson = sessionStorage.getItem('gcash_transaction');
      if (!transactionJson) {
        throw new Error('Transaction not found');
      }
      
      const transaction = JSON.parse(transactionJson);
      
      // Validate transaction ID
      if (transaction.id !== transactionId) {
        throw new Error('Invalid transaction ID');
      }
      
      // Update transaction state
      transaction.state = this.STATES.PROCESSING;
      sessionStorage.setItem('gcash_transaction', JSON.stringify(transaction));
      
      // Simulate API call
      await this._simulateApiCall(2000);
      
      // In a real implementation, this would check with GCash if OTP is required
      // For simulation, we'll always require OTP
      transaction.state = this.STATES.OTP_REQUIRED;
      transaction.otpExpiry = new Date(Date.now() + 3 * 60 * 1000).toISOString(); // 3 minutes from now
      sessionStorage.setItem('gcash_transaction', JSON.stringify(transaction));
      
      return {
        success: true,
        state: this.STATES.OTP_REQUIRED,
        message: 'OTP verification required',
        otpExpiry: transaction.otpExpiry
      };
    } catch (error) {
      console.error('GCash payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process payment',
        errorCode: 'GC-1002'
      };
    } finally {
      // Hide loading overlay
      document.getElementById('payment-processing-overlay').style.display = 'none';
    }
  }
  
  // Verify OTP for the transaction
  async verifyOTP(transactionId, otp) {
    // Show loading overlay
    document.getElementById('payment-processing-overlay').style.display = 'flex';
    
    try {
      // Get transaction from storage
      const transactionJson = sessionStorage.getItem('gcash_transaction');
      if (!transactionJson) {
        throw new Error('Transaction not found');
      }
      
      const transaction = JSON.parse(transactionJson);
      
      // Validate transaction ID
      if (transaction.id !== transactionId) {
        throw new Error('Invalid transaction ID');
      }
      
      // Validate transaction state
      if (transaction.state !== this.STATES.OTP_REQUIRED) {
        throw new Error('Transaction is not in OTP verification state');
      }
      
      // Check if OTP has expired
      const otpExpiry = new Date(transaction.otpExpiry);
      if (otpExpiry < new Date()) {
        throw new Error('OTP has expired');
      }
      
      // Simulate API call
      await this._simulateApiCall(1500);
      
      // In a real implementation, this would validate the OTP with GCash
      // For simulation, we'll accept any 6-digit OTP
      if (!/^\d{6}$/.test(otp)) {
        return {
          success: false,
          error: 'Invalid OTP format',
          errorCode: 'GC-1003'
        };
      }
      
      // For demo purposes, make specific OTPs fail to show error handling
      if (otp === '000000') {
        return {
          success: false,
          error: 'Invalid OTP. Please try again.',
          errorCode: 'GC-1004'
        };
      }
      
      if (otp === '111111') {
        return {
          success: false,
          error: 'Transaction declined by payment provider.',
          errorCode: 'GC-1005'
        };
      }
      
      // Update transaction state to completed
      transaction.state = this.STATES.COMPLETED;
      transaction.completedAt = new Date().toISOString();
      sessionStorage.setItem('gcash_transaction', JSON.stringify(transaction));
      
      return {
        success: true,
        state: this.STATES.COMPLETED,
        message: 'Payment completed successfully',
        transactionId: transaction.id,
        amount: transaction.amount,
        mobileNumber: transaction.mobileNumber,
        completedAt: transaction.completedAt
      };
    } catch (error) {
      console.error('GCash OTP verification error:', error);
      
      // Update transaction state to failed
      const transaction = JSON.parse(sessionStorage.getItem('gcash_transaction') || '{}');
      transaction.state = this.STATES.FAILED;
      transaction.error = error.message;
      sessionStorage.setItem('gcash_transaction', JSON.stringify(transaction));
      
      return {
        success: false,
        error: error.message || 'Failed to verify OTP',
        errorCode: 'GC-1006'
      };
    } finally {
      // Hide loading overlay
      document.getElementById('payment-processing-overlay').style.display = 'none';
    }
  }
  
  // Resend OTP for the transaction
  async resendOTP(transactionId) {
    // Show loading overlay
    document.getElementById('payment-processing-overlay').style.display = 'flex';
    
    try {
      // Get transaction from storage
      const transactionJson = sessionStorage.getItem('gcash_transaction');
      if (!transactionJson) {
        throw new Error('Transaction not found');
      }
      
      const transaction = JSON.parse(transactionJson);
      
      // Validate transaction ID
      if (transaction.id !== transactionId) {
        throw new Error('Invalid transaction ID');
      }
      
      // Validate transaction state
      if (transaction.state !== this.STATES.OTP_REQUIRED) {
        throw new Error('Transaction is not in OTP verification state');
      }
      
      // Simulate API call
      await this._simulateApiCall(1500);
      
      // Update OTP expiry time
      transaction.otpExpiry = new Date(Date.now() + 3 * 60 * 1000).toISOString(); // 3 minutes from now
      sessionStorage.setItem('gcash_transaction', JSON.stringify(transaction));
      
      return {
        success: true,
        message: 'OTP resent successfully',
        otpExpiry: transaction.otpExpiry
      };
    } catch (error) {
      console.error('GCash OTP resend error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend OTP',
        errorCode: 'GC-1007'
      };
    } finally {
      // Hide loading overlay
      document.getElementById('payment-processing-overlay').style.display = 'none';
    }
  }
  
  // Helper method to generate a transaction ID
  _generateTransactionId() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `GC-${timestamp}-${random}`;
  }
  
  // Helper method to simulate API calls with a delay
  _simulateApiCall(delay = 1000) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Initialize the GCash API
const gcashAPI = new GCashPaymentAPI();