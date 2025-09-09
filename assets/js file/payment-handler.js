document.addEventListener("DOMContentLoaded", () => {
  // Get reference number from localStorage
  const referenceNumber = localStorage.getItem("paymentReferenceNumber")

  if (!referenceNumber) {
    alert("Payment reference not found. Redirecting to dashboard.")
    window.location.href = "dashboard-user.html"
    return
  }

  // Initialize payment page
  initializePaymentPage(referenceNumber)

  // Set up event listeners
  setupEventListeners(referenceNumber)
})

function initializePaymentPage(referenceNumber) {
  // Get request details from admin system
  const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")
  const request = adminRequests.find((req) => req.refNumber === referenceNumber)

  if (!request) {
    alert("Request not found. Redirecting to dashboard.")
    window.location.href = "dashboard-user.html"
    return
  }

  // Update payment summary
  document.getElementById("reference-number").textContent = referenceNumber

  const certificateTypeDisplay =
    request.certificateType === "KUMPIL" ? "Confirmation Certificate" : "Baptismal Certificate"
  document.getElementById("certificate-type-display").textContent = certificateTypeDisplay

  document.getElementById("copies-count").textContent = request.numberOfCopies || "1"

  const certificateFee = request.totalAmount || 100
  document.getElementById("certificate-fee-display").textContent = `₱${certificateFee.toFixed(2)}`
  document.getElementById("total-amount").textContent = `₱${certificateFee.toFixed(2)}`
  document.getElementById("gcash-amount").value = certificateFee.toFixed(2)

  // Pre-fill mobile number if available
  if (request.mobile) {
    document.getElementById("gcash-mobile").value = request.mobile
  }
}

function setupEventListeners(referenceNumber) {
  // Back button
  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "acknowledgement-request-certificate-user.html"
  })

  // Pay with GCash button
  document.getElementById("pay-with-gcash-btn").addEventListener("click", () => {
    handleGCashPayment(referenceNumber)
  })

  // OTP input handling
  const otpInputs = document.querySelectorAll(".otp-input")
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value

      // Only allow digits
      if (!/^\d$/.test(value)) {
        e.target.value = ""
        return
      }

      // Move to next input
      if (value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus()
      }
    })

    input.addEventListener("keydown", (e) => {
      // Move to previous input on backspace
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus()
      }
    })
  })

  // OTP modal buttons
  document.getElementById("verify-otp-btn").addEventListener("click", () => {
    verifyOTP(referenceNumber)
  })

  document.getElementById("cancel-otp-btn").addEventListener("click", () => {
    document.getElementById("otp-modal").style.display = "none"
  })

  document.getElementById("resend-otp-btn").addEventListener("click", () => {
    resendOTP()
  })

  // Success/Failure buttons
  document.getElementById("print-receipt-btn").addEventListener("click", () => {
    window.print()
  })

  document.getElementById("go-to-dashboard-btn").addEventListener("click", () => {
    window.location.href = "dashboard-user.html"
  })

  document.getElementById("try-again-btn").addEventListener("click", () => {
    showPaymentForm()
  })

  document.getElementById("contact-support-btn").addEventListener("click", () => {
    alert("Please contact our support team at support@chronos.com or call (02) 8123-4567")
  })
}

function handleGCashPayment(referenceNumber) {
  const gcashMobile = document.getElementById("gcash-mobile").value.trim()
  const amount = Number.parseFloat(document.getElementById("gcash-amount").value)

  // Validate GCash mobile number
  if (!/^09\d{9}$/.test(gcashMobile)) {
    alert("Please enter a valid GCash mobile number (format: 09XXXXXXXXX)")
    document.getElementById("gcash-mobile").focus()
    return
  }

  // Show processing overlay
  document.getElementById("payment-processing-overlay").style.display = "flex"

  // Simulate payment processing
  setTimeout(() => {
    document.getElementById("payment-processing-overlay").style.display = "none"
    showOTPModal()
  }, 2000)
}

function showOTPModal() {
  // Clear OTP inputs
  const otpInputs = document.querySelectorAll(".otp-input")
  otpInputs.forEach((input) => (input.value = ""))

  // Clear error message
  document.getElementById("otp-error-message").textContent = ""

  // Start OTP timer
  startOTPTimer()

  // Show modal and focus first input
  document.getElementById("otp-modal").style.display = "flex"
  otpInputs[0].focus()
}

function startOTPTimer() {
  let timeLeft = 180 // 3 minutes
  const timerElement = document.getElementById("otp-timer")
  const resendBtn = document.getElementById("resend-otp-btn")

  const timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    if (timeLeft <= 0) {
      clearInterval(timer)
      resendBtn.disabled = false
      timerElement.textContent = "00:00"
    }

    timeLeft--
  }, 1000)
}

function verifyOTP(referenceNumber) {
  const otpInputs = document.querySelectorAll(".otp-input")
  const otpValue = Array.from(otpInputs)
    .map((input) => input.value)
    .join("")

  if (otpValue.length !== 6) {
    document.getElementById("otp-error-message").textContent = "Please enter the complete 6-digit OTP."
    return
  }

  // Show processing overlay
  document.getElementById("payment-processing-overlay").style.display = "flex"

  // Simulate OTP verification
  setTimeout(() => {
    document.getElementById("payment-processing-overlay").style.display = "none"
    document.getElementById("otp-modal").style.display = "none"

    // For demo purposes, accept any 6-digit OTP except 000000
    if (otpValue === "000000") {
      showPaymentFailed("Invalid OTP. Please try again.", "GC-1004")
      return
    }

    // Process successful payment
    processSuccessfulPayment(referenceNumber)
  }, 1500)
}

function resendOTP() {
  const resendBtn = document.getElementById("resend-otp-btn")
  resendBtn.disabled = true

  // Clear OTP inputs
  const otpInputs = document.querySelectorAll(".otp-input")
  otpInputs.forEach((input) => (input.value = ""))

  // Clear error message
  document.getElementById("otp-error-message").textContent = ""

  // Restart timer
  startOTPTimer()

  // Show success message
  const errorElement = document.getElementById("otp-error-message")
  errorElement.textContent = "A new OTP has been sent to your GCash mobile number."
  errorElement.style.color = "#28a745"

  setTimeout(() => {
    errorElement.style.color = ""
    errorElement.textContent = ""
  }, 3000)
}

function processSuccessfulPayment(referenceNumber) {
  // Generate transaction details
  const transactionId = "GC" + Date.now().toString().slice(-8)
  const currentDate = new Date()
  const gcashNumber = document.getElementById("gcash-mobile").value
  const amount = Number.parseFloat(document.getElementById("gcash-amount").value)

  // Update request status in admin system
  updateRequestPaymentStatus(referenceNumber, transactionId, amount, gcashNumber)

  // Store transaction for admin panel
  storeTransactionData({
    id: transactionId,
    referenceNumber: referenceNumber,
    transactionId: transactionId,
    paymentMethod: "GCash",
    gcashNumber: gcashNumber,
    amount: amount,
    status: "COMPLETED",
    paymentDate: currentDate.toISOString(),
    processingFee: amount,
    deliveryFee: 0,
    totalAmount: amount,
    paymentGateway: "GCash",
    authorizationCode: "AUTH" + Math.random().toString(36).substr(2, 8).toUpperCase(),
    receiptNumber: "RCP" + Date.now().toString().slice(-6),
    notes: "Payment for Certificate Request",
  })

  // Show success page
  showPaymentSuccess(transactionId, gcashNumber, amount, currentDate)
}

function updateRequestPaymentStatus(referenceNumber, transactionId, amount, gcashNumber) {
  try {
    const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")
    const requestIndex = adminRequests.findIndex((req) => req.refNumber === referenceNumber)

    if (requestIndex !== -1) {
      adminRequests[requestIndex] = {
        ...adminRequests[requestIndex],
        status: "paid",
        paymentStatus: "COMPLETED",
        transactionId: transactionId,
        paymentDate: new Date().toISOString(),
        paymentMethod: "GCash",
        amountPaid: amount,
        gcashNumber: gcashNumber,
      }

      localStorage.setItem("adminRequests", JSON.stringify(adminRequests))
    }
  } catch (error) {
    console.error("Error updating request payment status:", error)
  }
}

function storeTransactionData(transactionData) {
  try {
    const existingTransactions = JSON.parse(localStorage.getItem("adminTransactions") || "[]")
    existingTransactions.push(transactionData)
    localStorage.setItem("adminTransactions", JSON.stringify(existingTransactions))
  } catch (error) {
    console.error("Error storing transaction data:", error)
  }
}

function showPaymentSuccess(transactionId, gcashNumber, amount, date) {
  // Hide payment form
  document.getElementById("payment-form-container").style.display = "none"

  // Update receipt details
  document.getElementById("receipt-date").textContent = date.toLocaleString()
  document.getElementById("transaction-id").textContent = transactionId
  document.getElementById("receipt-gcash-number").textContent = gcashNumber
  document.getElementById("receipt-amount").textContent = `₱${amount.toFixed(2)}`

  // Show success container
  document.getElementById("payment-success").style.display = "block"

  // Clear payment reference
  localStorage.removeItem("paymentReferenceNumber")
}

function showPaymentFailed(errorMessage, errorCode) {
  // Hide payment form
  document.getElementById("payment-form-container").style.display = "none"

  // Set error details
  document.getElementById("payment-error-message").textContent = errorMessage
  document.getElementById("payment-error-code").textContent = `Error Code: ${errorCode}`

  // Show failed container
  document.getElementById("payment-failed").style.display = "block"
}

function showPaymentForm() {
  // Hide failed container
  document.getElementById("payment-failed").style.display = "none"

  // Show payment form
  document.getElementById("payment-form-container").style.display = "block"
}
