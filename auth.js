document.addEventListener("DOMContentLoaded", () => {
  // Predefined user credentials
  const predefinedUsers = [
    {
      name: "Admin User",
      email: "admin@chronos.com",
      password: "Chronos123",
      mobile: "1234567890",
      role: "admin",
    },
    {
      name: "Regular User",
      email: "user@chronos.com",
      password: "User123",
      mobile: "0987654321",
      role: "user",
    },
  ]

  // Initialize users in localStorage if not exists
  if (!localStorage.getItem("chronos_users")) {
    localStorage.setItem("chronos_users", JSON.stringify(predefinedUsers))
  }

  // Check if user is already logged in
  const isLoggedIn = sessionStorage.getItem("chronos_session") === "active"
  if (isLoggedIn) {
    window.location.href = "dashboard-user.html"
  }

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
  })

  // Show Forgot Password form
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault()
    signinForm.classList.remove("active")
    forgotPasswordForm.classList.add("active")
  })

  // Back to Sign In from Create Account
  backToSignin.addEventListener("click", (e) => {
    e.preventDefault()
    createAccountForm.classList.remove("active")
    signinForm.classList.add("active")
  })

  // Back to Sign In from Forgot Password
  backToSigninFromForgot.addEventListener("click", (e) => {
    e.preventDefault()
    forgotPasswordForm.classList.remove("active")
    signinForm.classList.add("active")
  })

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

  // Send verification code
  const sendCodeBtn = document.getElementById("send-code-btn")
  const verificationCodeSection = document.getElementById("verification-code-section")
  const resetError = document.getElementById("reset-error")

  sendCodeBtn.addEventListener("click", function () {
    const resetEmail = document.getElementById("reset-email").value
    const resetMobile = document.getElementById("reset-mobile").value
    const verificationMethod = document.querySelector('input[name="verification"]:checked').value

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("chronos_users"))

    // Check if email/mobile exists
    let userExists = false
    if (verificationMethod === "email") {
      userExists = users.some((user) => user.email === resetEmail)
      if (!resetEmail) {
        resetError.textContent = "Please enter your email"
        return
      }
      if (!userExists) {
        resetError.textContent = "Email not found"
        return
      }
    } else {
      userExists = users.some((user) => user.mobile === resetMobile)
      if (!resetMobile) {
        resetError.textContent = "Please enter your mobile number"
        return
      }
      if (!userExists) {
        resetError.textContent = "Mobile number not found"
        return
      }
    }

    // Clear error message
    resetError.textContent = ""

    // In a real application, you would send the verification code to the user's email or mobile
    // For this demo, we'll just show the verification code section
    this.textContent = "RESEND CODE"
    verificationCodeSection.style.display = "block"

    // Simulate sending a verification code
    alert("Verification code sent! For demo purposes, use code: 123456")

    // Store verification info in sessionStorage
    sessionStorage.setItem("chronos_reset_method", verificationMethod)
    sessionStorage.setItem("chronos_reset_contact", verificationMethod === "email" ? resetEmail : resetMobile)
  })

  // Form validation and submission
  const signinFormElement = document.getElementById("signin-form")
  const loginError = document.getElementById("login-error")

  signinFormElement.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    // Basic validation
    if (!email || !password) {
      loginError.textContent = "Please enter both email and password"
      return
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("chronos_users"))

    // Check if credentials match
    const user = users.find((user) => user.email === email && user.password === password)

    if (!user) {
      loginError.textContent = "Invalid email or password"
      return
    }

    // Clear error message
    loginError.textContent = ""

    // Check if trying to access admin page
    const currentPage = window.location.pathname
    const isAdminPage =
      currentPage.includes("admin-dashboard-refined.html") ||
      currentPage.includes("admin-dashboard-refined.html") ||
      sessionStorage.getItem("redirect_to_admin") === "true"

    if (isAdminPage && user.role !== "admin") {
      loginError.textContent = "Access denied. Admin credentials required."
      return
    }

    // Store user info in localStorage/sessionStorage (keep existing code)
    const userData = {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role, // Add role to stored user data
      loggedIn: true,
      loginTime: new Date().toISOString(),
    }

    localStorage.setItem("chronos_current_user", JSON.stringify(userData))
    sessionStorage.setItem("chronos_session", "active")

    // Redirect logic
    if (isAdminPage || sessionStorage.getItem("redirect_to_admin") === "true") {
      sessionStorage.removeItem("redirect_to_admin")
      window.location.href = "admin-dashboard-refined.html"
    } else {
      window.location.href = "dashboard-user.html"
    }
  })

  // Create account form submission
  const createAccountFormElement = document.getElementById("create-account-form")
  const createError = document.getElementById("create-error")

  createAccountFormElement.addEventListener("submit", (e) => {
    e.preventDefault()

    const name = document.getElementById("name").value
    const mobile = document.getElementById("mobile").value
    const email = document.getElementById("new-email").value
    const password = document.getElementById("new-password").value
    const confirmPassword = document.getElementById("confirm-password").value

    // Basic validation
    if (!name || !mobile || !email || !password || !confirmPassword) {
      createError.textContent = "Please fill in all fields"
      return
    }

    if (password !== confirmPassword) {
      createError.textContent = "Passwords do not match"
      return
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("chronos_users"))

    // Check if email already exists
    if (users.some((user) => user.email === email)) {
      createError.textContent = "Email already exists"
      return
    }

    // Clear error message
    createError.textContent = ""

    // Add new user
    const newUser = {
      name: name,
      mobile: mobile,
      email: email,
      password: password,
      role: "user", // Default role for new accounts
    }

    users.push(newUser)
    localStorage.setItem("chronos_users", JSON.stringify(users))

    // Store user info for current session
    const userData = {
      name: name,
      email: email,
      mobile: mobile,
      loggedIn: true,
      loginTime: new Date().toISOString(),
    }

    localStorage.setItem("chronos_current_user", JSON.stringify(userData))
    sessionStorage.setItem("chronos_session", "active")

    alert("Account created successfully!")

    // Redirect to dashboard
    window.location.href = "dashboard-user.html"
  })

  // Forgot password form submission
  const forgotPasswordFormElement = document.getElementById("forgot-password-form")

  forgotPasswordFormElement.addEventListener("submit", function (e) {
    e.preventDefault()

    // Only process if verification code section is visible
    if (verificationCodeSection.style.display === "block") {
      const verificationCode = document.getElementById("verification-code").value
      const newPassword = document.getElementById("reset-new-password").value
      const confirmNewPassword = document.getElementById("reset-confirm-password").value

      // Basic validation
      if (!verificationCode || !newPassword || !confirmNewPassword) {
        resetError.textContent = "Please fill in all fields"
        return
      }

      if (newPassword !== confirmNewPassword) {
        resetError.textContent = "Passwords do not match"
        return
      }

      // For demo purposes, accept only code 123456
      if (verificationCode !== "123456") {
        resetError.textContent = "Invalid verification code"
        return
      }

      // Get reset info from sessionStorage
      const resetMethod = sessionStorage.getItem("chronos_reset_method")
      const resetContact = sessionStorage.getItem("chronos_reset_contact")

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("chronos_users"))

      // Find user and update password
      const userIndex = users.findIndex((user) =>
        resetMethod === "email" ? user.email === resetContact : user.mobile === resetContact,
      )

      if (userIndex !== -1) {
        users[userIndex].password = newPassword
        localStorage.setItem("chronos_users", JSON.stringify(users))

        // Clear sessionStorage
        sessionStorage.removeItem("chronos_reset_method")
        sessionStorage.removeItem("chronos_reset_contact")

        alert("Password reset successfully!")

        // Reset form and go back to sign in
        this.reset()
        forgotPasswordForm.classList.remove("active")
        signinForm.classList.add("active")
        verificationCodeSection.style.display = "none"
        sendCodeBtn.textContent = "SEND VERIFICATION CODE"
      }
    }
  })

  // Chatbot functionality
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
          "For demo purposes, use the predefined account: admin@chronos.com / Chronos123",
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

  // Admin access protection function
  function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem("chronos_current_user"))
    const isLoggedIn = sessionStorage.getItem("chronos_session") === "active"

    if (!isLoggedIn || !currentUser) {
      sessionStorage.setItem("redirect_to_admin", "true")
      window.location.href = "index.html" // or your login page
      return false
    }

    if (currentUser.role !== "admin") {
      alert("Access denied. Admin credentials required.")
      window.location.href = "dashboard-user.html"
      return false
    }

    return true
  }

  // Make function globally available
  window.checkAdminAccess = checkAdminAccess
})
