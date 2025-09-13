const PSGC_API = "https://psgc.gitlab.io/api";
const CACHE_EXPIRY_HOURS = 24; // Cache expires every 24 hours

const loadingOverlay = document.getElementById("loading-overlay")   
document.addEventListener("DOMContentLoaded", () => {  
  loadingOverlay.style.display = 'flex'
  loadingOverlay.style.display = 'none'
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
    setupLocationDropdowns()
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
    refresh();
    clearErrors()
  })

  function refresh() {
  document.body.classList.add("fade-out"); // Start fade-out animation

  setTimeout(() => {
    window.location.reload(true); // Refresh after animation ends
  }, 300); 
}

  // Back to Sign In from Forgot Password
  backToSigninFromForgot.addEventListener("click", (e) => {
    e.preventDefault()
    refresh();
    clearErrors()
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
    
    return philippinePattern.test(cleanNumber)
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
  
  
  // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    const date = document.getElementById("dateOfBirth");
    date.setAttribute("max", today);   

  // Create Account Form Submission
  createAccountForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    
    const firstName = document.getElementById("create-firstName").value.trim()
    const midName = document.getElementById("create-midName").value.trim()
    const lastName = document.getElementById("create-lastName").value.trim()
    const phoneNumber = document.getElementById("create-phoneNumber").value.replace(/[\s-]/g, '')
    const email = document.getElementById("create-email").value.trim()
    const password = document.getElementById("create-password").value
    const errorElement = document.getElementById("create-error") 
    const province = provinceDropdown.options[provinceDropdown.selectedIndex].text;
    const city = cityDropdown.options[cityDropdown.selectedIndex].text;
    const barangay = barangayDropdown.options[barangayDropdown.selectedIndex].text;
    const dateInput = date.value;


    
    loadingOverlay.style.display = 'flex'

    // Clear previous errors
    errorElement.textContent = ""

    // Validation
    if (!firstName || !midName || !lastName || !email || !password) {
      errorElement.textContent = "Please fill in all required fields"
      loadingOverlay.style.display = 'none'
      return
    }

    if (phoneNumber && !validatePhilippineMobile(phoneNumber)) {
      errorElement.textContent = "Please enter a valid Philippine mobile number" + barangay;
      loadingOverlay.style.display = 'none'
      return
    }

    if (!validateEmail(email)) {
      errorElement.textContent = "Please enter a valid email address"
      loadingOverlay.style.display = 'none'
      return
    }

    if (!validatePassword(password)) {
      errorElement.textContent = "Password must be at least 6 characters long"
      loadingOverlay.style.display = 'none'
      return
    }

    // Check for existing email and phone number
    try {
      const checkData = new FormData()
      checkData.append('email', email)
      if (phoneNumber) {
        checkData.append('phoneNumber', `+63${phoneNumber}`)
      }

      const checkResponse = await fetch('../php_file/checkExistingUser.php', {
        method: 'POST',
        body: checkData
      })

      const checkResult = await checkResponse.json()
      
      if (!checkResult.success) {
        errorElement.textContent = checkResult.message
        loadingOverlay.style.display = 'none'
        return
      }
    } catch (error) {
      errorElement.textContent = "Network error. Please try again."
      loadingOverlay.style.display = 'none'
      return
    }

    // Store account data for later use
    pendingAccountData = {
      firstName,
      midName,
      lastName,
      dateInput,
      phoneNumber: phoneNumber ? `+63${phoneNumber}` : '',
      email,
      password,
      province,
      city,
      barangay
    }

    // Show OTP choice modal
    loadingOverlay.style.display = 'none'
    showOTPChoiceModal(email, phoneNumber)
  })

  const provinceDropdown = document.getElementById("birthProvince");
  const cityDropdown = document.getElementById("birthCity");
  const barangayDropdown = document.getElementById("birthDistrict");

  async function setupLocationDropdowns() {

  // ✅ Load provinces first (cached or API)
  const provinces = await getCachedData("psgc_provinces", fetchProvinces);
  populateDropdown(provinceDropdown, provinces, "Province of Birth");

  // ✅ Province change → Fetch cities
  provinceDropdown.addEventListener("change", async function () {
    const provinceCode = this.value;

    // Disable city & barangay dropdowns until new data loads
    cityDropdown.disabled = true;
    barangayDropdown.disabled = true;    

    cityDropdown.innerHTML = '<option value="" disabled selected>Loading cities...</option>';
    barangayDropdown.innerHTML = '<option value="" disabled selected>District of Birth</option>';

    // ✅ Fetch cities (cached per province)
    const cacheKey = `psgc_cities_${provinceCode}`;
    const cities = await getCachedData(cacheKey, () => fetchCities(provinceCode));
    populateDropdown(cityDropdown, cities, "City of Birth");
    cityDropdown.disabled = false;
  });

  // ✅ City change → Fetch barangays
  cityDropdown.addEventListener("change", async function () {
    const cityCode = this.value;

    barangayDropdown.disabled = true;
    barangayDropdown.innerHTML = '<option value="" disabled selected>Loading Ditricts...</option>';

    // ✅ Fetch barangays (cached per city)
    const cacheKey = `psgc_barangays_${cityCode}`;
    const barangays = await getCachedData(cacheKey, () => fetchBarangays(cityCode));
    populateDropdown(barangayDropdown, barangays, "District of Birth");
    barangayDropdown.disabled = false;
  });
}

// ✅ Get data from cache or fetch from API
async function getCachedData(cacheKey, fetchFunction) {
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check cache expiration
    if ((now - timestamp) / (1000 * 60 * 60) < CACHE_EXPIRY_HOURS) {
      return data; // ✅ Return cached data
    }
  }

  // ✅ No cache or expired → Fetch new data
  const freshData = await fetchFunction();

  // Save to cache
  localStorage.setItem(cacheKey, JSON.stringify({
    data: freshData,
    timestamp: Date.now()
  }));

  return freshData;
}

// ✅ Fetch all provinces
async function fetchProvinces() {
  const response = await fetch(`${PSGC_API}/provinces.json`);
  const data = await response.json();
  return data.map(p => ({ code: p.code, name: p.name }));
}

// ✅ Fetch cities per province
async function fetchCities(provinceCode) {
  const response = await fetch(`${PSGC_API}/provinces/${provinceCode}/cities-municipalities.json`);
  const data = await response.json();
  return data.map(c => ({ code: c.code, name: c.name }));
}

// ✅ Fetch barangays per city
async function fetchBarangays(cityCode) {
  const response = await fetch(`${PSGC_API}/cities-municipalities/${cityCode}/barangays.json`);
  const data = await response.json();
  return data.map(b => ({ code: b.code, name: b.name }));
}

// ✅ Populate dropdown helper
function populateDropdown(dropdown, items, placeholder) {
  // Clear dropdown and set placeholder
  dropdown.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
  // ✅ Sort items alphabetically by name before populating
  items.sort((a, b) => a.name.localeCompare(b.name));

  // ✅ Populate dropdown options
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.code; // Use PSGC code as value
    option.textContent = item.name; // Display uppercase name
    option.setAttribute("data-code", item.code); // Keep code for later use
    dropdown.appendChild(option);
  });

  // ✅ Enable dropdown if data is available
  dropdown.disabled = items.length === 0;
}

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
    loadingOverlay.style.display = 'flex'
    try {
      if (method === 'mobile') {
        // Use Firebase for mobile OTP
        await sendFirebaseMobileOTP(contact)
        loadingOverlay.style.display = 'none'
      } else {
        // Use Firebase for email OTP
        await sendFirebaseEmailOTP(contact)
        loadingOverlay.style.display = 'none'
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      alert('Network error. Please try again.')
      loadingOverlay.style.display = 'none'
    }
  }

  // Send Firebase OTP for mobile (renamed for clarity)
  async function sendFirebaseMobileOTP(phoneNumber) {
    try {
      // First, register the request in PHP backend
      const formData = new FormData()
      formData.append('method', 'mobile')
      formData.append('contact', phoneNumber)
      formData.append('purpose', 'account_creation')

      const response = await fetch('../php_file/sendOTP.php', {
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
        startOTPTimer(120) // 2 minutes
      } else {
        throw new Error(firebaseResult.error || 'Failed to send Firebase OTP')
      }
    } catch (error) {
      console.error('Firebase OTP error:', error)
      alert('Failed to send OTP: ' + error.message)
    }
  }

  // Send Firebase OTP for email
  async function sendFirebaseEmailOTP(email) {
    try {
      // First, register the request in PHP backend
      const formData = new FormData()
      formData.append('method', 'email')
      formData.append('contact', email)
      formData.append('purpose', 'account_creation')

      const response = await fetch('../php_file/sendOTP.php', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message)
      }

      // Send OTP via Firebase custom email OTP
      const { sendCustomEmailOTP } = await import('./firebase-auth.js')
      const firebaseResult = await sendCustomEmailOTP(email)
      
      if (firebaseResult.success) {
        currentOTPMethod = 'email'
        currentOTPContact = email
        
        // Hide choice modal and show verification modal
        document.getElementById("otp-choice-modal").style.display = "none"
        showOTPVerificationModal('email', email)
        
        // Start timer
        startOTPTimer(300) // 5 minutes
      } else {
        throw new Error(firebaseResult.error || 'Failed to send Firebase email OTP')
      }
    } catch (error) {
      console.error('Firebase email OTP error:', error)
      alert('Failed to send email OTP: ' + error.message)
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

  // Setup OTP inputs for both modals (called immediately since we're already in DOMContentLoaded)
  setupOTPInputs('.otp-digit')
  setupOTPInputs('.reset-otp-digit')

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


  // Verify OTP and Create Account
  document.getElementById("verify-otp").addEventListener("click", async () => {
    const otpInputs = document.querySelectorAll('.otp-digit')
    const otp = Array.from(otpInputs).map(input => input.value).join('')
    const errorElement = document.getElementById("otp-error")

    loadingOverlay.style.display = 'flex'

    errorElement.textContent = ""

    if (otp.length !== 6) {
      errorElement.textContent = "Please enter the 6-digit code."
      otpInputs.forEach(input => input.classList.add('error'))
      return
    }

    try {
      if (currentOTPMethod === 'mobile') {
        // For mobile, verify with Firebase first
        if (!firebaseConfirmationResult) {
          throw new Error("Firebase confirmation result not found.")
        }
        
        const { verifyPhoneOTP } = await import('./firebase-auth.js')
        const firebaseResult = await verifyPhoneOTP(firebaseConfirmationResult, otp)
        if (firebaseResult.success) {
          // OTP is correct, now create the account
          await createAccountWithVerification()
          loadingOverlay.style.display = 'none'
        } 
         else {
          loadingOverlay.style.display = 'none'
          throw new Error(firebaseResult.error || "Invalid OTP code.")          
        }

      } else if (currentOTPMethod === 'email') {
        // For email, verify directly with our backend
        const formData = new FormData()
        formData.append('contact', currentOTPContact)
        formData.append('otp', otp)
        formData.append('method', currentOTPMethod)

        const response = await fetch('../php_file/verifyOTP.php', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        
        if (result.success) {
          // OTP is correct, now create the account
          await createAccountWithVerification()
          loadingOverlay.style.display = 'none'
        } else {
          loadingOverlay.style.display = 'none'
          throw new Error(result.message || "Invalid OTP or OTP expired.")
        }
      }
    } catch (error) {
      loadingOverlay.style.display = 'none'
      console.error('OTP Verification Error:', error)
      errorElement.textContent = error.message || "An error occurred. Please try again."
      otpInputs.forEach(input => input.classList.add('error'))
    }
  })

  // Create Account After Verification
  async function createAccountWithVerification() {
    try {
      const formData = new FormData()
      Object.keys(pendingAccountData).forEach(key => {
        formData.append(key, pendingAccountData[key])
      })

      const response = await fetch('../php_file/createAccount.php', {
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
        
        alert('Account created successfully! Please log in.')
        
        // Clear pending data
        pendingAccountData = null
        currentOTPMethod = null
        currentOTPContact = null
        refresh();
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
    e.preventDefault();

    let contact = document.getElementById("contact").value.trim();
    const password = document.getElementById("password").value;
    const errorElement = document.getElementById("login-error");

    // Show loading spinner
    loadingOverlay.style.display = 'flex';

    // ✅ Step 1: Check for empty fields first
    if (!contact || !password) {
        loadingOverlay.style.display = 'none';
        errorElement.textContent = "Please enter required credentials";
        return;
    }

    // ✅ Step 2: Detect if it's a mobile number
    if (/^\+?\d+$/.test(contact)) {
        // If number starts with 0 → convert to +63
        if (contact.startsWith("0")) {
            contact = "+63" + contact.substring(1);
        }
        // If number starts without 0 or +63 → force +63 prefix
        else if (!contact.startsWith("+63")) {
            contact = "+63" + contact;
        }
    }
    // ✅ Step 3: Otherwise, validate as email
    else {
        if (!validateEmail(contact)) {
            loadingOverlay.style.display = 'none';
            errorElement.textContent = "Please enter a valid email address";
            return;
        }
    }

    // ✅ Step 4: Clear previous errors
    errorElement.textContent = "";

    try {
        // Send form data to server
        const formData = new FormData();
        formData.append('contact', contact);
        formData.append('password', password);

        const response = await fetch('../php_file/signin.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // ✅ Save session info
            sessionStorage.setItem("chronos_session", "active");
            sessionStorage.setItem("chronos_user", JSON.stringify(result.user));
            sessionStorage.setItem("chronos_firstName", result.user.firstName);
            sessionStorage.setItem("chronos_midName", result.user.middleName);
            sessionStorage.setItem("chronos_lastName", result.user.lastName);
            sessionStorage.setItem("chronos_dateOfBirth", result.user.dateOfBirth);
            sessionStorage.setItem("chronos_province", result.user.birthProvince);
            sessionStorage.setItem("chronos_city", result.user.birthCity);
            sessionStorage.setItem("chronos_barangay", result.user.birthBarangay);
            sessionStorage.setItem("chronos_email", result.user.email);
            sessionStorage.setItem("chronos_number", result.user.phoneNumber);

            // ✅ Redirect based on role
            if (result.user.role === 'admin') {
                window.location.href = "../../dashboard-admin.html";
            } else {
                loadingOverlay.style.display = 'none';
                window.location.href = "../../dashboard-user.html";
            }
        } else {
            // ✅ Show proper error message
            if (/^\+?\d+$/.test(contact)) {
                errorElement.textContent = "Incorrect Mobile Number or Password";
            } else {
                errorElement.textContent = "Incorrect Email or Password";
            }
            loadingOverlay.style.display = 'none';
        }
    } catch (error) {
        errorElement.textContent = "Network error. Please try again.";
        loadingOverlay.style.display = 'none';
    }
});

const engBtn = document.getElementById("lang-eng");
const filBtn = document.getElementById("lang-fil");
const noticeText = document.getElementById("notice-text");

// English and Filipino translations
const translations = {
    eng: "Please ensure all information entered is accurate and complete. Your details will be used for future verification, recovery, and official records.",
    fil: "Siguraduhin na tama at kumpleto ang lahat ng impormasyong ilalagay. Gagamitin ang iyong detalye para sa hinaharap na beripikasyon, pag-recover ng account, at opisyal na rekord."
};

// Switch to English
engBtn.addEventListener("click", () => {
    noticeText.textContent = translations.eng;
    engBtn.classList.add("active");
    filBtn.classList.remove("active");
});

// Switch to Filipino
filBtn.addEventListener("click", () => {
    noticeText.textContent = translations.fil;
    filBtn.classList.add("active");
    engBtn.classList.remove("active");
});


  // Forgot Password functionality
  let verificationTimer = null

  const sendCodeBtn = document.getElementById("send-code-btn")
  const verificationCodeSection = document.getElementById("verification-code-section")
  const resetError = document.getElementById("reset-error")
  const timerDisplay = document.getElementById("timer-display")

  // Start countdown timer
  function startTimer(duration) {
    let timeLeft = duration
    timerDisplay.textContent = `Time remaining: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`

    sendCodeBtn.disabled = true
    
    verificationTimer = setInterval(() => {
      timeLeft--
      
      if (timeLeft <= 0) {
        clearInterval(verificationTimer)
        timerDisplay.textContent = "Verification code expired"
        timerDisplay.style.color = "#e74c3c"
        verificationTimer = null
        sendCodeBtn.disabled = false
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

  // Global variables for forgot password Firebase
  let forgotPasswordFirebaseConfirmationResult = null

      const resetMobileInput = document.getElementById("reset-mobile");

      // Function to format phone numbers
      function formatPhoneNumber(value) {
      // Remove spaces and hyphens first
      value = value.replace(/[\s-]/g, '');

      // Allow only digits and limit to 10 characters
      value = value.replace(/\D/g, '').substring(0, 10);

      // Format the number: XXX XXX XXXX
      if (value.length >= 7) {
      return `${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6)}`;
      } else if (value.length >= 4) {
      return `${value.substring(0, 3)} ${value.substring(3)}`;
      }

      return value;
      }

      // Add event listener to the reset mobile input
      resetMobileInput.addEventListener("input", function (e) {
      e.target.value = formatPhoneNumber(e.target.value);
      });

  // Send verification code
  sendCodeBtn.addEventListener("click", async function () {
    const resetEmail = document.getElementById("reset-email").value.trim()
    const resetMobile = resetMobileInput.value.replace(/\D/g, ''); 
    const verificationMethod = document.querySelector('input[name="verification"]:checked').value

    loadingOverlay.style.display = 'flex'

    resetError.textContent = ""    

    let contactInfo = ""
    if (verificationMethod === "email") {
      if (!resetEmail) {
        resetError.textContent = "Please enter your email"
        loadingOverlay.style.display = 'none'
        return
      }
      if (!validateEmail(resetEmail)) {
        resetError.textContent = "Please enter a valid email address"
        loadingOverlay.style.display = 'none'
        return
      }
      contactInfo = resetEmail
    } else {
      if (!resetMobile) {
        resetError.textContent = "Please enter your mobile number"
        loadingOverlay.style.display = 'none'
        return
      }
      if (!validatePhilippineMobile(resetMobile)) {
        resetError.textContent = "Please enter a valid Philippine mobile number"
        loadingOverlay.style.display = 'none'
        return
      }
      contactInfo = `+63${resetMobile}`
    }

    try {
      // First check if user exists
      const checkFormData = new FormData()
      checkFormData.append('method', verificationMethod)
      checkFormData.append('contact', contactInfo)

      const checkResponse = await fetch('../php_file/forgotPassword.php', {
        method: 'POST',
        body: checkFormData
      })

      const checkResult = await checkResponse.json()
      
      if (checkResult.success) {
        // User exists, now send OTP
        if (verificationMethod === 'mobile') {
          // Use Firebase for mobile OTP
          await sendForgotPasswordFirebaseOTP(contactInfo);
          loadingOverlay.style.display = 'none'
        } else {
          // Use Firebase for email link
          await sendForgotPasswordEmailLink(contactInfo);
          loadingOverlay.style.display = 'none'
        }
      } else {
        resetError.textContent = verificationMethod === "email" ? "Email Not Found" : "Mobile Number Not Found"
        loadingOverlay.style.display = 'none'
      }
    } catch (error) {
      resetError.textContent = "Network error. Please try again."
      loadingOverlay.style.display = 'none'
    }
  })

  // Send Firebase Email Link for forgot password
  async function sendForgotPasswordEmailLink(email) {
    try {
      // First, register the request in PHP backend
      const formData = new FormData()
      formData.append('method', 'email')
      formData.append('contact', email)
      formData.append('purpose', 'password-reset')

      const response = await fetch('../php_file/sendOTP.php', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message)
      }

      // Send OTP via Firebase custom email OTP
      const { sendCustomEmailOTP } = await import('./firebase-auth.js')
      const firebaseResult = await sendCustomEmailOTP(email)
      
      if (firebaseResult.success) {
        forgotPasswordFirebaseConfirmationResult = firebaseResult.confirmationResult
        
        // Show verification section
        verificationCodeSection.style.display = "block"
        sendCodeBtn.textContent = "RESEND CODE"
        
        // Clear reset OTP inputs
        const resetOtpInputs = document.querySelectorAll('.reset-otp-digit')
        resetOtpInputs.forEach(input => {
          input.value = ''
          input.classList.remove('filled', 'error')
        })
        
        // Focus first input
        resetOtpInputs[0].focus()
        
        // Start timer
        startTimer(300) // 5 minutes
        
        alert('Verification code sent to your Email')
      } else {
        throw new Error(firebaseResult.error || 'Failed to send Firebase OTP')
      }
    } catch (error) {
      console.error('Firebase email OTP error:', error)
      alert('Failed to send email OTP: ' + error.message)
    }
  }

  // Send Firebase OTP for forgot password
  async function sendForgotPasswordFirebaseOTP(phoneNumber) {
    try {
      // First, register the request in PHP backend
      const formData = new FormData()
      formData.append('method', 'mobile')
      formData.append('contact', phoneNumber)
      formData.append('purpose', 'password_reset')

      const response = await fetch('../php_file/sendOTP.php', {
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
        forgotPasswordFirebaseConfirmationResult = firebaseResult.confirmationResult
        
        // Show verification section
        verificationCodeSection.style.display = "block"
        sendCodeBtn.textContent = "RESEND CODE"
        
        // Clear reset OTP inputs
        const resetOtpInputs = document.querySelectorAll('.reset-otp-digit')
        resetOtpInputs.forEach(input => {
          input.value = ''
          input.classList.remove('filled', 'error')
        })
        
        // Focus first input
        resetOtpInputs[0].focus()
        
        // Start timer
        startTimer(120) // 2 minutes
        
        alert('Verification code sent to your mobile number')
      } else {
        throw new Error(firebaseResult.error || 'Failed to send Firebase OTP')
      }
    } catch (error) {
      console.error('Firebase OTP error:', error)
      resetError.textContent = 'Failed to send OTP: ' + error.message
    }
  }

  // Reset password form submission
  forgotPasswordForm.addEventListener("submit", async function (e) {
    e.preventDefault()

    if (verificationCodeSection.style.display === "block") {
      // Get OTP from individual input boxes
      const resetOtpInputs = document.querySelectorAll('.reset-otp-digit')
      const inputCode = Array.from(resetOtpInputs).map(input => input.value).join('')
      const newPassword = document.getElementById("reset-new-password").value
      const confirmPassword = document.getElementById("reset-confirm-password").value

      loadingOverlay.style.display = 'flex'

      resetError.textContent = ""

      // Validation
      if (inputCode.length !== 6) {
        loadingOverlay.style.display = 'none'
        resetError.textContent = "Please enter all 6 digits of the verification code"
        resetOtpInputs.forEach(input => input.classList.add('error'))
        return
      }

      if (!newPassword || !confirmPassword) {
        loadingOverlay.style.display = 'none'
        resetError.textContent = "Please fill in all fields"
        return
      }

      if (!validatePassword(newPassword)) {
        loadingOverlay.style.display = 'none'
        resetError.textContent = "Password must be at least 6 characters long"
        return
      }

      if (newPassword !== confirmPassword) {
        loadingOverlay.style.display = 'none'
        resetError.textContent = "Passwords do not match"        
        return
      }

      // Get contact info
      const verificationMethod = document.querySelector('input[name="verification"]:checked').value
      const resetEmail = document.getElementById("reset-email").value.trim()
      const resetMobile = document.getElementById("reset-mobile")
      const contactInfo = verificationMethod === "email" ? resetEmail : `+63${resetMobile}`

      try {
        // Handle Firebase mobile OTP verification
        if (verificationMethod === 'mobile' && forgotPasswordFirebaseConfirmationResult) {
          // Verify Firebase mobile OTP
          const { verifyPhoneOTP } = await import('./firebase-auth.js')
          const firebaseResult = await verifyPhoneOTP(forgotPasswordFirebaseConfirmationResult, inputCode)
          
          if (!firebaseResult.success) {
            loadingOverlay.style.display = 'none'
            resetError.textContent = firebaseResult.error || 'Invalid OTP code'
            resetOtpInputs.forEach(input => input.classList.add('error'))            
            return
          }
        } else {
          // Email OTP verification
          const verifyFormData = new FormData()
          verifyFormData.append('contact', contactInfo)
          verifyFormData.append('otp', inputCode)
          verifyFormData.append('method', verificationMethod)

          const verifyResponse = await fetch('../php_file/verifyOTP.php', {
            method: 'POST',
            body: verifyFormData
          })

          const verifyResult = await verifyResponse.json()
          
          if (!verifyResult.success) {
            loadingOverlay.style.display = 'none'
            resetError.textContent = verifyResult.message
            resetOtpInputs.forEach(input => input.classList.add('error'))
            return
          }
        }

        // OTP verified, now reset password
        const formData = new FormData()
        formData.append('method', verificationMethod)
        formData.append('contact', contactInfo.trim())
        formData.append('newPassword', newPassword)

        const response = await fetch('../php_file/resetPassword.php', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        
        if (result.success) {
          loadingOverlay.style.display = 'none'
          alert("Password reset successfully!")
          forgotPasswordForm.classList.remove("active")
          refresh();
        } else {
          loadingOverlay.style.display = 'none'
          resetError.textContent = "Error resetting password. Please try again."
        }
      } catch (error) {
        loadingOverlay.style.display = 'none'
        console.error('Password reset error:', error)
        resetError.textContent = "Network error. Please try again."
      }
    }
  })

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
