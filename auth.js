document.addEventListener("DOMContentLoaded", () => {
  // Form switching functionality
  const signinForm = document.getElementById("signin-form")
  const createAccountForm = document.getElementById("create-account-form")
  const forgotPasswordForm = document.getElementById("forgot-password-form")

  const createAccountLink = document.getElementById("create-account-link")
  const forgotPasswordLink = document.getElementById("forgot-password-link")
  const backToSignin = document.getElementById("back-to-signin")
  const backToSigninFromForgot = document.getElementById("back-to-signin-from-forgot")

  // Show Create Account form
  createAccountLink.addEventListener("click", (e) => {
    e.preventDefault()
    signinForm.classList.remove("active")
    createAccountForm.classList.add("active")
    clearErrors()
  })

  // Show Forgot Password form
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault()
    signinForm.classList.remove("active")
    forgotPasswordForm.classList.add("active")
    clearErrors()
  })

  // Back to Sign In from Create Account
  backToSignin.addEventListener("click", (e) => {
    e.preventDefault()
    createAccountForm.classList.remove("active")
    signinForm.classList.add("active")
    clearErrors()
  })

  // Back to Sign In from Forgot Password
  backToSigninFromForgot.addEventListener("click", (e) => {
    e.preventDefault()
    forgotPasswordForm.classList.remove("active")
    signinForm.classList.add("active")
    clearErrors()
    resetForgotPasswordForm()
  })

  // Clear all error messages
  function clearErrors() {
    document.getElementById("login-error").textContent = ""
    document.getElementById("create-error").textContent = ""
    document.getElementById("reset-error").textContent = ""
  }

  // Verification method switching
  const emailVerification = document.getElementById("email-verification")
  const mobileVerification = document.getElementById("mobile-verification")
  const verificationRadios = document.querySelectorAll('input[name="verification"]')

  verificationRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "email") {
        emailVerification.classList.add("active")
        mobileVerification.classList.remove("active")
      } else {
        emailVerification.classList.remove("active")
        mobileVerification.classList.add("active")
      }
    })
  })

  // Philippine mobile number validation
  function validatePhilippineMobile(number) {
    // Remove any spaces or dashes
    const cleanNumber = number.replace(/[\s-]/g, '')
    
    // Check if it starts with 9 and has exactly 10 digits
    const philippinePattern = /^9\d{9}$/
    
    if (!philippinePattern.test(cleanNumber)) {
      return false
    }
    
    // Check if it's a valid Philippine mobile prefix
    const validPrefixes = [
      '905', '906', '907', '908', '909', '910', '912', '913', '914', '915', '916', '917', 
      '918', '919', '920', '921', '922', '923', '924', '925', '926', '927', '928', '929',
      '930', '931', '932', '933', '934', '935', '936', '937', '938', '939', '940', '941',
      '942', '943', '944', '945', '946', '947', '948', '949', '950', '951', '952', '953',
      '954', '955', '956', '957', '958', '959', '960', '961', '962', '963', '964', '965',
      '966', '967', '968', '969', '970', '971', '972', '973', '974', '975', '976', '977',
      '978', '979', '980', '981', '982', '983', '984', '985', '986', '987', '988', '989',
      '990', '991', '992', '993', '994', '995', '996', '997', '998', '999'
    ]
    
    const prefix = cleanNumber.substring(0, 3)
    return validPrefixes.includes(prefix)
  }

  // Email validation
  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  // Password validation
  function validatePassword(password) {
    return password.length >= 6
  }

  // Format phone number for display
  function formatPhoneNumber(number) {
    const clean = number.replace(/[\s-]/g, '')
    if (clean.length === 10) {
      return `${clean.substring(0, 3)} ${clean.substring(3, 6)} ${clean.substring(6)}`
    }
    return number
  }

  // Phone number input formatting
  const phoneInput = document.getElementById("create-phoneNumber")
  phoneInput.addEventListener("input", function(e) {
    let value = e.target.value.replace(/[\s-]/g, '')
    
    // Only allow digits and limit to 10 characters
    value = value.replace(/\D/g, '').substring(0, 10)
    
    // Format as XXX XXX XXXX
    if (value.length >= 7) {
      value = `${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6)}`
    } else if (value.length >= 4) {
      value = `${value.substring(0, 3)} ${value.substring(3)}`
    }
    
    e.target.value = value
  })

  // Global variables for account creation
  let pendingAccountData = null
  let currentOTPMethod = null
  let currentOTPContact = null
  let otpTimer = null
  let otpTimeLeft = 0

  // Create Account Form Submission
  createAccountForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    
    const firstName = document.getElementById("create-firstName").value.trim()
    const lastName = document.getElementById("create-lastName").value.trim()
    const phoneNumber = document.getElementById("create-phoneNumber").value.replace(/[\s-]/g, '')
    const email = document.getElementById("create-email").value.trim()
    const password = document.getElementById("create-password").value
    const address = document.getElementById("create-address").value.trim()
    const errorElement = document.getElementById("create-error")

    // Clear previous errors
    errorElement.textContent = ""

    // Validation
    if (!firstName || !lastName || !email || !password) {
      errorElement.textContent = "Please fill in all required fields"
      return
    }

    if (phoneNumber && !validatePhilippineMobile(phoneNumber)) {
      errorElement.textContent = "Please enter a valid Philippine mobile number"
      return
    }

    if (!validateEmail(email)) {
      errorElement.textContent = "Please enter a valid email address"
      return
    }

    if (!validatePassword(password)) {
      errorElement.textContent = "Password must be at least 6 characters long"
      return
    }

    // Check for existing email and phone number
    try {
      const checkData = new FormData()
      checkData.append('email', email)
      if (phoneNumber) {
        checkData.append('phoneNumber', `+63${phoneNumber}`)
      }

      const checkResponse = await fetch('checkExistingUser.php', {
        method: 'POST',
        body: checkData
      })

      const checkResult = await checkResponse.json()
      
      if (!checkResult.success) {
        errorElement.textContent = checkResult.message
        return
      }
    } catch (error) {
      errorElement.textContent = "Network error. Please try again."
      return
    }

    // Store account data for later use
    pendingAccountData = {
      firstName,
      lastName,
      phoneNumber: phoneNumber ? `+63${phoneNumber}` : '',
      email,
      password,
      address
    }

    // Show OTP choice modal
    showOTPChoiceModal(email, phoneNumber)
  })

  // Show OTP Choice Modal
  function showOTPChoiceModal(email, phoneNumber) {
    const modal = document.getElementById("otp-choice-modal")
    const emailBtn = document.getElementById("choose-email-otp")
    const mobileBtn = document.getElementById("choose-mobile-otp")

    // Enable/disable buttons based on available contact methods
    emailBtn.disabled = false
    mobileBtn.disabled = !phoneNumber

    if (!phoneNumber) {
      mobileBtn.style.opacity = "0.5"
      mobileBtn.style.cursor = "not-allowed"
    } else {
      mobileBtn.style.opacity = "1"
      mobileBtn.style.cursor = "pointer"
    }

    modal.style.display = "flex"
  }

  // OTP Choice Event Listeners
  document.getElementById("choose-email-otp").addEventListener("click", () => {
    sendOTPCode('email', pendingAccountData.email)
  })

  document.getElementById("choose-mobile-otp").addEventListener("click", () => {
    if (pendingAccountData.phoneNumber) {
      sendOTPCode('mobile', pendingAccountData.phoneNumber)
    }
  })

  document.getElementById("cancel-otp-choice").addEventListener("click", () => {
    document.getElementById("otp-choice-modal").style.display = "none"
    pendingAccountData = null
  })

  // Global variables for Firebase
  let firebaseConfirmationResult = null

  // Send OTP Code
  async function sendOTPCode(method, contact) {
    try {
      if (method === 'mobile') {
        // Use Firebase for mobile OTP
        await sendFirebaseOTP(contact)
      } else {
        // Use PHP/SendGrid for email OTP
        const formData = new FormData()
        formData.append('method', method)
        formData.append('contact', contact)
        formData.append('purpose', 'account_creation')

        const response = await fetch('sendOTP.php', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        
        if (result.success) {
          currentOTPMethod = method
          currentOTPContact = contact
          
          // Hide choice modal and show verification modal
          document.getElementById("otp-choice-modal").style.display = "none"
          showOTPVerificationModal(method, contact)
          
          // Start timer
          startOTPTimer(result.expires_in || 300)
        } else {
          alert('Failed to send OTP: ' + result.message)
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      alert('Network error. Please try again.')
    }
  }

  // Send Firebase OTP for mobile
  async function sendFirebaseOTP(phoneNumber) {
    try {
      // First, register the request in PHP backend
      const formData = new FormData()
      formData.append('method', 'mobile')
      formData.append('contact', phoneNumber)
      formData.append('purpose', 'account_creation')

      const response = await fetch('sendOTP.php', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message)
      }

      // Initialize Firebase if not already done
      if (!window.recaptchaVerifier) {
        await initializeFirebaseAuth()
      }

      // Send OTP via Firebase
      const { sendPhoneOTP } = await import('./firebase-auth.js')
      const firebaseResult = await sendPhoneOTP(phoneNumber)
      
      if (firebaseResult.success) {
        firebaseConfirmationResult = firebaseResult.confirmationResult
        currentOTPMethod = 'mobile'
        currentOTPContact = phoneNumber
        
        // Hide choice modal and show verification modal
        document.getElementById("otp-choice-modal").style.display = "none"
        showOTPVerificationModal('mobile', phoneNumber)
        
        // Start timer
        startOTPTimer(300) // 5 minutes
      } else {
        throw new Error(firebaseResult.error || 'Failed to send Firebase OTP')
      }
    } catch (error) {
      console.error('Firebase OTP error:', error)
      alert('Failed to send OTP: ' + error.message)
    }
  }

  // Initialize Firebase Auth
  async function initializeFirebaseAuth() {
    try {
      const { initializeRecaptcha } = await import('./firebase-auth.js')
      await initializeRecaptcha()
    } catch (error) {
      console.error('Failed to initialize Firebase:', error)
      throw error
    }
  }

  // Show OTP Verification Modal
  function showOTPVerificationModal(method, contact) {
    const modal = document.getElementById("otp-verification-modal")
    const message = document.getElementById("otp-sent-message")
    
    const contactDisplay = method === 'email' ? contact : contact.replace('+63', '+63 ')
    message.textContent = `We've sent a 6-digit code to your ${method === 'email' ? 'email' : 'mobile number'}: ${contactDisplay}`
    
    // Clear OTP inputs
    const otpInputs = document.querySelectorAll('.otp-digit')
    otpInputs.forEach(input => {
      input.value = ''
      input.classList.remove('filled', 'error')
    })
    
    // Clear error message
    document.getElementById("otp-error").textContent = ""
    
    modal.style.display = "flex"
    
    // Focus first input
    otpInputs[0].focus()
  }

  // OTP Input Handling
  function setupOTPInputs(selector) {
    const otpInputs = document.querySelectorAll(selector)
    
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', function(e) {
        const value = e.target.value
        
        // Only allow digits
        if (!/^\d$/.test(value) && value !== '') {
          e.target.value = ''
          return
        }
        
        // Add filled class if has value
        if (value) {
          e.target.classList.add('filled')
          e.target.classList.remove('error')
          
          // Move to next input
          if (index < otpInputs.length - 1) {
            otpInputs[index + 1].focus()
          }
        } else {
          e.target.classList.remove('filled', 'error')
        }
      })
      
      input.addEventListener('keydown', function(e) {
        // Handle backspace
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          otpInputs[index - 1].focus()
        }
        
        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          navigator.clipboard.readText().then(text => {
            const digits = text.replace(/\D/g, '').slice(0, 6)
            digits.split('').forEach((digit, i) => {
              if (otpInputs[i]) {
                otpInputs[i].value = digit
                otpInputs[i].classList.add('filled')
                otpInputs[i].classList.remove('error')
              }
            })
            if (digits.length === 6) {
              otpInputs[5].focus()
            }
          })
        }
      })
    })
  }

  // Setup OTP inputs for both modals
  document.addEventListener('DOMContentLoaded', function() {
    setupOTPInputs('.otp-digit')
    setupOTPInputs('.reset-otp-digit')
  })

  // Start OTP Timer
  function startOTPTimer(seconds) {
    otpTimeLeft = seconds
    const timerElement = document.getElementById("otp-timer")
    const resendBtn = document.getElementById("resend-otp")
    
    resendBtn.disabled = true
    
    otpTimer = setInterval(() => {
      otpTimeLeft--
      
      const minutes = Math.floor(otpTimeLeft / 60)
      const secs = otpTimeLeft % 60
      timerElement.textContent = `Code expires in: ${minutes}:${secs.toString().padStart(2, '0')}`
      
      if (otpTimeLeft <= 0) {
        clearInterval(otpTimer)
        timerElement.textContent = "Code expired"
        timerElement.style.color = "#e74c3c"
        resendBtn.disabled = false
      } else if (otpTimeLeft <= 30) {
        timerElement.style.color = "#e74c3c"
      } else {
        timerElement.style.color = "#666"
      }
    }, 1000)
  }

  // Verify OTP
  document.getElementById("verify-otp").addEventListener("click", async () => {
    const otpInputs = document.querySelectorAll('.otp-digit')
    const otp = Array.from(otpInputs).map(input => input.value).join('')
    const errorElement = document.getElementById("otp-error")
    
    errorElement.textContent = ""
    
    if (otp.length !== 6) {
      errorElement.textContent = "Please enter all 6 digits"
      otpInputs.forEach(input => input.classList.add('error'))
      return
    }
    
    try {
      if (currentOTPMethod === 'mobile' && firebaseConfirmationResult) {
        // Verify Firebase mobile OTP
        const { verifyPhoneOTP } = await import('./firebase-auth.js')
        const firebaseResult = await verifyPhoneOTP(firebaseConfirmationResult, otp)
        
        if (firebaseResult.success) {
          // Firebase verification successful, now verify with backend
          const formData = new FormData()
          formData.append('contact', currentOTPContact)
          formData.append('otp', 'FIREBASE_VERIFIED')
          formData.append('method', 'mobile')

          const response = await fetch('verifyOTP.php', {
            method: 'POST',
            body: formData
          })

          const result = await response.json()
          
          if (result.success) {
            // OTP verified, now create the account
            await createAccountWithVerification()
          } else {
            errorElement.textContent = result.message
            otpInputs.forEach(input => input.classList.add('error'))
          }
        } else {
          errorElement.textContent = firebaseResult.error || 'Invalid OTP code'
          otpInputs.forEach(input => input.classList.add('error'))
        }
      } else {
        // Email OTP verification
        const formData = new FormData()
        formData.append('contact', currentOTPContact)
        formData.append('otp', otp)
        formData.append('method', currentOTPMethod)

        const response = await fetch('verifyOTP.php', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        
        if (result.success) {
          // OTP verified, now create the account
          await createAccountWithVerification()
        } else {
          errorElement.textContent = result.message
          otpInputs.forEach(input => input.classList.add('error'))
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      errorElement.textContent = "Network error. Please try again."
    }
  })

  // Create Account After Verification
  async function createAccountWithVerification() {
    try {
      const formData = new FormData()
      Object.keys(pendingAccountData).forEach(key => {
        formData.append(key, pendingAccountData[key])
      })

      const response = await fetch('createAccount.php', {
        method: 'POST',
        body: formData
      })

      const result = await response.text()
      
      if (response.ok && result.includes('success')) {
        // Clear timer
        if (otpTimer) {
          clearInterval(otpTimer)
        }
        
        // Hide modal
        document.getElementById("otp-verification-modal").style.display = "none"
        
        // Reset form and show success
        createAccountForm.reset()
        createAccountForm.classList.remove("active")
        signinForm.classList.add("active")
        
        alert('Account created successfully! Please log in.')
        
        // Clear pending data
        pendingAccountData = null
        currentOTPMethod = null
        currentOTPContact = null
      } else {
        document.getElementById("otp-error").textContent = "Error creating account. Please try again."
      }
    } catch (error) {
      document.getElementById("otp-error").textContent = "Network error. Please try again."
    }
  }

  // Resend OTP
  document.getElementById("resend-otp").addEventListener("click", () => {
    if (currentOTPMethod && currentOTPContact) {
      sendOTPCode(currentOTPMethod, currentOTPContact)
    }
  })

  // Cancel OTP Verification
  document.getElementById("cancel-otp-verification").addEventListener("click", () => {
    if (otpTimer) {
      clearInterval(otpTimer)
    }
    document.getElementById("otp-verification-modal").style.display = "none"
    pendingAccountData = null
    currentOTPMethod = null
    currentOTPContact = null
  })

  // Sign In Form Submission
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value
    const errorElement = document.getElementById("login-error")

    // Clear previous errors
    errorElement.textContent = ""

    // Basic validation
    if (!email || !password) {
      errorElement.textContent = "Please enter both email and password"
      return
    }

    if (!validateEmail(email)) {
      errorElement.textContent = "Please enter a valid email address"
      return
    }

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const response = await fetch('signin.php', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.success) {
        // Store user info in sessionStorage
        sessionStorage.setItem("chronos_session", "active")
        sessionStorage.setItem("chronos_user", JSON.stringify(result.user))
        
        // Redirect based on role
        if (result.user.role === 'admin') {
          window.location.href = "dashboard-admin.html"
        } else {
          window.location.href = "dashboard-user.html"
        }
      } else {
        errorElement.textContent = "Incorrect Email or Password"
      }
    } catch (error) {
      errorElement.textContent = "Network error. Please try again."
    }
  })

  // Forgot Password functionality
  let verificationTimer = null
  let verificationCode = null
  let verificationExpiry = null

  const sendCodeBtn = document.getElementById("send-code-btn")
  const verificationCodeSection = document.getElementById("verification-code-section")
  const resetError = document.getElementById("reset-error")
  const timerDisplay = document.getElementById("timer-display")

  // Generate random 6-digit code
  function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Start countdown timer
  function startTimer(duration) {
    let timeLeft = duration
    timerDisplay.textContent = `Time remaining: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
    
    verificationTimer = setInterval(() => {
      timeLeft--
      
      if (timeLeft <= 0) {
        clearInterval(verificationTimer)
        timerDisplay.textContent = "Verification code expired"
        timerDisplay.style.color = "#e74c3c"
        verificationCode = null
        verificationExpiry = null
        return
      }
      
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60
      timerDisplay.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`
      
      if (timeLeft <= 30) {
        timerDisplay.style.color = "#e74c3c"
      }
    }, 1000)
  }

  // Send verification code
  sendCodeBtn.addEventListener("click", async function () {
    const resetEmail = document.getElementById("reset-email").value.trim()
    const resetMobile = document.getElementById("reset-mobile").value.replace(/[\s-]/g, '')
    const verificationMethod = document.querySelector('input[name="verification"]:checked').value

    resetError.textContent = ""

    let contactInfo = ""
    if (verificationMethod === "email") {
      if (!resetEmail) {
        resetError.textContent = "Please enter your email"
        return
      }
      if (!validateEmail(resetEmail)) {
        resetError.textContent = "Please enter a valid email address"
        return
      }
      contactInfo = resetEmail
    } else {
      if (!resetMobile) {
        resetError.textContent = "Please enter your mobile number"
        return
      }
      if (!validatePhilippineMobile(resetMobile)) {
        resetError.textContent = "Please enter a valid Philippine mobile number"
        return
      }
      contactInfo = `+63${resetMobile}`
    }

    try {
      // First check if user exists
      const checkFormData = new FormData()
      checkFormData.append('method', verificationMethod)
      checkFormData.append('contact', contactInfo)

      const checkResponse = await fetch('forgotPassword.php', {
        method: 'POST',
        body: checkFormData
      })

      const checkResult = await checkResponse.json()
      
      if (checkResult.success) {
        // User exists, now send OTP
        const otpFormData = new FormData()
        otpFormData.append('method', verificationMethod)
        otpFormData.append('contact', contactInfo)
        otpFormData.append('purpose', 'password_reset')

        const otpResponse = await fetch('sendOTP.php', {
          method: 'POST',
          body: otpFormData
        })

        const otpResult = await otpResponse.json()
        
        if (otpResult.success) {
          // Show verification section
          verificationCodeSection.style.display = "block"
          this.textContent = "RESEND CODE"
          
          // Clear reset OTP inputs
          const resetOtpInputs = document.querySelectorAll('.reset-otp-digit')
          resetOtpInputs.forEach(input => {
            input.value = ''
            input.classList.remove('filled', 'error')
          })
          
          // Focus first input
          resetOtpInputs[0].focus()
          
          // Start timer
          startTimer(otpResult.expires_in || 300) // 5 minutes
          
          alert('Verification code sent to your ' + (verificationMethod === 'email' ? 'email' : 'mobile number'))
        } else {
          resetError.textContent = "Failed to send verification code. Please try again."
        }
      } else {
        resetError.textContent = verificationMethod === "email" ? "Email Not Found" : "Mobile Number Not Found"
      }
    } catch (error) {
      resetError.textContent = "Network error. Please try again."
    }
  })

  // Reset password form submission
  forgotPasswordForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    if (verificationCodeSection.style.display === "block") {
      // Get OTP from individual input boxes
      const resetOtpInputs = document.querySelectorAll('.reset-otp-digit')
      const inputCode = Array.from(resetOtpInputs).map(input => input.value).join('')
      const newPassword = document.getElementById("reset-new-password").value
      const confirmPassword = document.getElementById("reset-confirm-password").value

      resetError.textContent = ""

      // Validation
      if (inputCode.length !== 6) {
        resetError.textContent = "Please enter all 6 digits of the verification code"
        resetOtpInputs.forEach(input => input.classList.add('error'))
        return
      }

      if (!newPassword || !confirmPassword) {
        resetError.textContent = "Please fill in all fields"
        return
      }

      if (!validatePassword(newPassword)) {
        resetError.textContent = "Password must be at least 6 characters long"
        return
      }

      if (newPassword !== confirmPassword) {
        resetError.textContent = "Passwords do not match"
        return
      }

      // Get contact info
      const verificationMethod = document.querySelector('input[name="verification"]:checked').value
      const resetEmail = document.getElementById("reset-email").value.trim()
      const resetMobile = document.getElementById("reset-mobile").value.replace(/[\s-]/g, '')
      const contactInfo = verificationMethod === "email" ? resetEmail : `+63${resetMobile}`

      try {
        // First verify the OTP
        const verifyFormData = new FormData()
        verifyFormData.append('contact', contactInfo)
        verifyFormData.append('otp', inputCode)
        verifyFormData.append('purpose', 'password_reset')

        const verifyResponse = await fetch('verifyOTP.php', {
          method: 'POST',
          body: verifyFormData
        })

        const verifyResult = await verifyResponse.json()
        
        if (!verifyResult.success) {
          resetError.textContent = verifyResult.message
          resetOtpInputs.forEach(input => input.classList.add('error'))
          return
        }

        // OTP verified, now reset password
        const formData = new FormData()
        formData.append('method', verificationMethod)
        formData.append('contact', contactInfo)
        formData.append('newPassword', newPassword)
        formData.append('verificationCode', inputCode)

        const response = await fetch('resetPassword.php', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        
        if (result.success) {
          alert("Password reset successfully!")
          resetForgotPasswordForm()
          forgotPasswordForm.classList.remove("active")
          signinForm.classList.add("active")
        } else {
          resetError.textContent = "Error resetting password. Please try again."
        }
      } catch (error) {
        resetError.textContent = "Network error. Please try again."
      }
    }
  })

  // Reset forgot password form
  function resetForgotPasswordForm() {
    forgotPasswordForm.reset()
    verificationCodeSection.style.display = "none"
    sendCodeBtn.textContent = "SEND VERIFICATION CODE"
    timerDisplay.textContent = ""
    timerDisplay.style.color = "#e74c3c"
    
    if (verificationTimer) {
      clearInterval(verificationTimer)
      verificationTimer = null
    }
    
    verificationCode = null
    verificationExpiry = null
    
    // Reset verification method display
    emailVerification.classList.add("active")
    mobileVerification.classList.remove("active")
    document.querySelector('input[name="verification"][value="email"]').checked = true
  }

  // Check if user is already logged in
  const isLoggedIn = sessionStorage.getItem("chronos_session") === "active"
  if (isLoggedIn) {
    const user = JSON.parse(sessionStorage.getItem("chronos_user") || '{}')
    if (user.role === 'admin') {
      window.location.href = "dashboard-admin.html"
    } else {
      window.location.href = "dashboard-user.html"
    }
  }

  // Chatbot functionality (keeping existing functionality)
  const chatbotToggle = document.getElementById("chatbot-toggle")
  const chatbotWindow = document.getElementById("chatbot-window")
  const closeChat = document.getElementById("close-chatbot")
  const chatMessages = document.getElementById("chatbot-messages")
  const userMessageInput = document.getElementById("user-message")
  const sendMessageBtn = document.getElementById("send-message")

  // Toggle chatbot window
  chatbotToggle.addEventListener("click", () => {
    if (chatbotWindow.style.display === "flex") {
      chatbotWindow.style.display = "none"
    } else {
      chatbotWindow.style.display = "flex"
    }
  })

  // Close chatbot window
  closeChat.addEventListener("click", () => {
    chatbotWindow.style.display = "none"
  })

  // Send message
  function sendMessage() {
    const message = userMessageInput.value.trim()

    if (message) {
      // Add user message
      const userMessageElement = document.createElement("div")
      userMessageElement.classList.add("message", "user")
      userMessageElement.textContent = message
      chatMessages.appendChild(userMessageElement)

      // Clear input
      userMessageInput.value = ""

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight

      // Simulate bot response after a short delay
      setTimeout(() => {
        const botResponses = [
          "I'm here to help with your Chronos account.",
          "You can create a new account by clicking 'Create Account' on the sign-in page.",
          "If you forgot your password, use the 'Forgot password' link to reset it.",
          "Make sure to use a valid Philippine mobile number when creating an account.",
          "Need more help? Please provide more details about your issue.",
        ]

        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

        const botMessageElement = document.createElement("div")
        botMessageElement.classList.add("message", "bot")
        botMessageElement.textContent = randomResponse
        chatMessages.appendChild(botMessageElement)

        // Scroll to bottom again
        chatMessages.scrollTop = chatMessages.scrollHeight
      }, 1000)
    }
  }

  // Send message on button click
  sendMessageBtn.addEventListener("click", sendMessage)

  // Send message on Enter key
  userMessageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  })
})
