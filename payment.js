// Updated payment.js to handle both baptism and confirmation certificates
document.addEventListener("DOMContentLoaded", () => {
  // Load data from localStorage
  const baptismRequestData = JSON.parse(localStorage.getItem("baptismRequestData") || "{}")

  // Get certificate type
  const certificateType = baptismRequestData.requestDetails?.certificateType || "BAPTISMAL"

  // Initialize progress labels first
  updateProgressLabels(certificateType)

  // Update page title
  const pageTitle = document.querySelector("h1, h2")
  if (pageTitle) {
    const certificateName = certificateType === "KUMPIL" ? "Confirmation" : "Baptismal"
    pageTitle.textContent = `${certificateName} Certificate Payment`
  }

  // Update certificate type in payment summary
  const certificateTypeElement = document.getElementById("certificate-type-display")
  if (certificateTypeElement) {
    const certificateName = certificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"
    certificateTypeElement.textContent = `${certificateName} Certificate`
  }

  // Update reference number
  const referenceNumberElement = document.getElementById("reference-number")
  if (referenceNumberElement) {
    const defaultRef = certificateType === "KUMPIL" ? "CONF-2023-12345" : "BAPT-2023-12345"
    referenceNumberElement.textContent = baptismRequestData.referenceNumber || defaultRef
  }

  // Update copies count
  const copies = baptismRequestData.requestDetails?.numberOfCopies || 1
  const copiesElement = document.getElementById("copies-count")
  if (copiesElement) {
    copiesElement.textContent = copies
  }

  // Use calculated fees from localStorage for consistency
  let certificateFee = 100
  const deliveryFee = 0
  let totalAmount = 100

  if (baptismRequestData.calculatedFees) {
    const fees = baptismRequestData.calculatedFees
    certificateFee = fees.processingFee || 100
    totalAmount = fees.totalAmount || 100

    // Update certificate fee display
    const certFeeElement = document.getElementById("certificate-fee-display")
    if (certFeeElement) {
      certFeeElement.textContent = `₱${certificateFee.toFixed(2)}`
    }

    // Hide delivery fee row since it's processing fee only
    const deliveryFeeRow = document.getElementById("delivery-fee-row")
    if (deliveryFeeRow) {
      deliveryFeeRow.style.display = "none"
    }
  } else {
    // Fallback calculation if no saved fees
    const copies = Number.parseInt(baptismRequestData.requestDetails?.numberOfCopies || "1")
    certificateFee = 100

    // Hide delivery fee row for processing fee only
    const deliveryFeeRow = document.getElementById("delivery-fee-row")
    if (deliveryFeeRow) {
      deliveryFeeRow.style.display = "none"
    }

    totalAmount = certificateFee
  }

  // Update total amount display
  const totalAmountElement = document.getElementById("total-amount")
  if (totalAmountElement) {
    totalAmountElement.textContent = `₱${totalAmount.toFixed(2)}`
  }

  // Update GCash amount field
  const gcashAmountInput = document.getElementById("gcash-amount")
  if (gcashAmountInput) {
    gcashAmountInput.value = totalAmount.toFixed(2)
  }

  // Update certificate details in payment summary
  if (baptismRequestData.requestDetails) {
    const details = baptismRequestData.requestDetails

    // Update requester name in payment summary
    const paymentRequesterName = document.getElementById("payment-requester-name")
    if (paymentRequesterName) {
      const fullName = `${details.firstName || ""} ${details.lastName || ""}`.trim()
      paymentRequesterName.textContent = fullName
    }

    // Update sacrament date in payment summary
    const paymentSacramentDate = document.getElementById("payment-sacrament-date")
    const paymentSacramentLabel = document.getElementById("payment-sacrament-label")
    if (paymentSacramentDate && details.sacramentDate) {
      const date = new Date(details.sacramentDate)
      paymentSacramentDate.textContent = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (paymentSacramentLabel) {
        paymentSacramentLabel.textContent = certificateType === "KUMPIL" ? "Confirmation Date:" : "Baptism Date:"
      }
    }
  }

  function updateProgressLabels(certificateType) {
    const certificateNameFilipino = certificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"
    const certificateNameEnglish = certificateType === "KUMPIL" ? "Confirmation" : "Baptism"

    // Update Step 1
    const step1Label = document.getElementById("progress-step1-label")
    if (step1Label) {
      step1Label.innerHTML = `Mga Detalye ng Kahilingan - ${certificateNameFilipino}<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Request Details - ${certificateNameEnglish})
        </span>`
    }

    // Update Step 2
    const step2Label = document.getElementById("progress-step2-label")
    if (step2Label) {
      step2Label.innerHTML = `Mga Detalye ng Paghahatid<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Delivery Details)
        </span>`
    }

    // Update Step 3
    const step3Label = document.getElementById("progress-step3-label")
    if (step3Label) {
      step3Label.innerHTML = `Buod<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Summary)
        </span>`
    }

    // Update Step 4
    const step4Label = document.getElementById("progress-step4-label")
    if (step4Label) {
      step4Label.innerHTML = `Pagkilala<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Acknowledgement)
        </span>`
    }

    // Update Step 5
    const step5Label = document.getElementById("progress-step5-label")
    if (step5Label) {
      step5Label.innerHTML = `Bayad<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Payment)
        </span>`
    }
  }

  // Payment method selection
  const paymentOptions = document.querySelectorAll(".payment-option")
  const creditCardForm = document.getElementById("credit-card-form")

  paymentOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove selected class from all options
      paymentOptions.forEach((opt) => opt.classList.remove("selected"))

      // Add selected class to clicked option
      this.classList.add("selected")

      // Check the radio button
      const radio = this.querySelector('input[type="radio"]')
      if (radio) {
        radio.checked = true

        // Show/hide credit card form
        if (radio.id === "credit-card") {
          if (creditCardForm) creditCardForm.style.display = "block"
        } else {
          if (creditCardForm) creditCardForm.style.display = "none"
        }
      }
    })
  })

  // Format credit card number with spaces
  const cardNumberInput = document.getElementById("card-number")
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
      let formattedValue = ""

      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += " "
        }
        formattedValue += value[i]
      }

      e.target.value = formattedValue
    })
  }

  // Format expiry date (MM/YY)
  const expiryDateInput = document.getElementById("expiry-date")
  if (expiryDateInput) {
    expiryDateInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")

      if (value.length > 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4)
      }

      e.target.value = value
    })
  }

  // Back button
  const backBtn = document.getElementById("back-btn")
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "acknowledgement-final.html"
    })
  }

  // Pay button
  const payBtn = document.getElementById("pay-btn")
  if (payBtn) {
    payBtn.addEventListener("click", () => {
      // Simple validation
      const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked')

      if (!selectedPaymentMethod) {
        alert("Please select a payment method.")
        return
      }

      if (selectedPaymentMethod.id === "credit-card") {
        const cardNumber = document.getElementById("card-number")?.value
        const expiryDate = document.getElementById("expiry-date")?.value
        const cvv = document.getElementById("cvv")?.value
        const cardholderName = document.getElementById("cardholder-name")?.value

        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          alert("Please fill in all card details.")
          return
        }
      }

      // Show success message
      const paymentFormContainer = document.getElementById("payment-form-container")
      const paymentSuccess = document.getElementById("payment-success")

      if (paymentFormContainer) paymentFormContainer.style.display = "none"
      if (paymentSuccess) paymentSuccess.style.display = "block"

      // Update success message based on certificate type
      const successMessage = document.getElementById("success-certificate-message")
      if (successMessage) {
        const certificateName = certificateType === "KUMPIL" ? "confirmation" : "baptismal"
        successMessage.textContent = `Your ${certificateName} certificate request is now being processed.`
      }

      // Clear request data from localStorage
      localStorage.removeItem("baptismRequestData")
    })
  }

  // Pay with GCash button - Enhanced functionality
  const payWithGcashBtn = document.getElementById("pay-with-gcash-btn")
  if (payWithGcashBtn) {
    payWithGcashBtn.addEventListener("click", () => {
      const gcashMobile = document.getElementById("gcash-mobile")?.value
      const gcashAmount = document.getElementById("gcash-amount")?.value

      // Validate GCash mobile number
      if (!gcashMobile) {
        alert("Please enter your GCash mobile number.")
        return
      }

      if (gcashMobile.length !== 11 || !gcashMobile.startsWith("09")) {
        alert("Please enter a valid GCash mobile number (09XXXXXXXXX).")
        return
      }

      if (!gcashAmount || Number.parseFloat(gcashAmount) <= 0) {
        alert("Invalid payment amount.")
        return
      }

      // Show processing overlay
      const processingOverlay = document.getElementById("payment-processing-overlay")
      if (processingOverlay) {
        processingOverlay.style.display = "flex"
      }

      // Simulate GCash API call and processing
      setTimeout(() => {
        // Hide processing overlay
        if (processingOverlay) {
          processingOverlay.style.display = "none"
        }

        // Show OTP modal for verification
        const otpModal = document.getElementById("otp-modal")
        if (otpModal) {
          otpModal.style.display = "flex"
          startOTPTimer()
        }
      }, 2000)
    })
  }

  // OTP Timer function
  function startOTPTimer() {
    let timeLeft = 180 // 3 minutes in seconds
    const timerElement = document.getElementById("otp-timer")
    const resendBtn = document.getElementById("resend-otp-btn")

    const timer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60

      if (timerElement) {
        timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }

      if (timeLeft <= 0) {
        clearInterval(timer)
        if (resendBtn) resendBtn.disabled = false
        if (timerElement) timerElement.textContent = "00:00"
      }

      timeLeft--
    }, 1000)
  }

  // OTP Input handling
  const otpInputs = document.querySelectorAll(".otp-input")
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value

      // Only allow numbers
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

  // Verify OTP button - Enhanced with transaction storage
  const verifyOtpBtn = document.getElementById("verify-otp-btn")
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", () => {
      const otpValue = Array.from(otpInputs)
        .map((input) => input.value)
        .join("")

      if (otpValue.length !== 6) {
        const errorElement = document.getElementById("otp-error-message")
        if (errorElement) {
          errorElement.textContent = "Please enter the complete 6-digit OTP."
          errorElement.style.display = "block"
        }
        return
      }

      // Simulate OTP verification
      const processingOverlay = document.getElementById("payment-processing-overlay")
      const otpModal = document.getElementById("otp-modal")

      if (processingOverlay) processingOverlay.style.display = "flex"
      if (otpModal) otpModal.style.display = "none"

      setTimeout(() => {
        if (processingOverlay) processingOverlay.style.display = "none"

        // Generate transaction details
        const transactionId = "GC" + Date.now().toString().slice(-8)
        const currentDate = new Date()
        const gcashNumber = document.getElementById("gcash-mobile")?.value
        const amount = document.getElementById("gcash-amount")?.value
        const referenceNumber = document.getElementById("reference-number")?.textContent

        // Create transaction record for admin panel
        const transactionData = {
          id: transactionId,
          referenceNumber: referenceNumber,
          transactionId: transactionId,
          paymentMethod: "GCash",
          gcashNumber: gcashNumber,
          amount: Number.parseFloat(amount),
          status: "COMPLETED",
          paymentDate: currentDate.toISOString(),
          certificateType: certificateType,
          customerName: baptismRequestData.requestDetails
            ? `${baptismRequestData.requestDetails.firstName || ""} ${baptismRequestData.requestDetails.lastName || ""}`.trim()
            : "Unknown Customer",
          customerEmail: baptismRequestData.requesterEmail || "",
          customerMobile: baptismRequestData.requesterMobile || gcashNumber,
          processingFee: Number.parseFloat(amount),
          deliveryFee: 0,
          totalAmount: Number.parseFloat(amount),
          paymentGateway: "GCash",
          authorizationCode: "AUTH" + Math.random().toString(36).substr(2, 8).toUpperCase(),
          receiptNumber: "RCP" + Date.now().toString().slice(-6),
          notes: `Payment for ${certificateType === "KUMPIL" ? "Confirmation" : "Baptismal"} Certificate`,
        }

        // Store transaction in localStorage for admin panel
        storeTransactionData(transactionData)

        // Update receipt details
        document.getElementById("transaction-id").textContent = transactionId
        document.getElementById("receipt-date").textContent = currentDate.toLocaleString()
        document.getElementById("receipt-gcash-number").textContent = gcashNumber
        document.getElementById("receipt-amount").textContent = `₱${Number.parseFloat(amount).toFixed(2)}`

        // Show success message
        const paymentFormContainer = document.getElementById("payment-form-container")
        const paymentSuccess = document.getElementById("payment-success")

        if (paymentFormContainer) paymentFormContainer.style.display = "none"
        if (paymentSuccess) paymentSuccess.style.display = "block"

        // Update success message based on certificate type
        const successMessage = document.getElementById("success-certificate-message")
        if (successMessage) {
          const certificateType = baptismRequestData.requestDetails?.certificateType || "BAPTISMAL"
          const certificateName = certificateType === "KUMPIL" ? "confirmation" : "baptismal"
          successMessage.textContent = `Your ${certificateName} certificate request is now being processed.`
        }

        // Update the request status to include payment information
        updateRequestWithPayment(referenceNumber, transactionData)

        // Clear request data from localStorage
        localStorage.removeItem("baptismRequestData")
      }, 1500)
    })
  }

  // Function to store transaction data for admin panel
  function storeTransactionData(transactionData) {
    try {
      // Get existing transactions
      const existingTransactions = JSON.parse(localStorage.getItem("adminTransactions") || "[]")

      // Add new transaction
      existingTransactions.push(transactionData)

      // Store updated transactions
      localStorage.setItem("adminTransactions", JSON.stringify(existingTransactions))

      console.log("Transaction stored successfully:", transactionData.transactionId)
    } catch (error) {
      console.error("Error storing transaction data:", error)
    }
  }

  // Function to update request with payment information
  function updateRequestWithPayment(referenceNumber, transactionData) {
    try {
      // Get existing requests
      const existingRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")

      // Find and update the request
      const requestIndex = existingRequests.findIndex((req) => req.refNumber === referenceNumber)

      if (requestIndex !== -1) {
        existingRequests[requestIndex] = {
          ...existingRequests[requestIndex],
          status: "paid",
          paymentStatus: "COMPLETED",
          transactionId: transactionData.transactionId,
          paymentDate: transactionData.paymentDate,
          paymentMethod: transactionData.paymentMethod,
          amountPaid: transactionData.amount,
          dateApproved: new Date().toISOString().split("T")[0],
        }

        // Store updated requests
        localStorage.setItem("adminRequests", JSON.stringify(existingRequests))

        console.log("Request updated with payment information:", referenceNumber)
      }
    } catch (error) {
      console.error("Error updating request with payment:", error)
    }
  }

  // Cancel OTP button
  const cancelOtpBtn = document.getElementById("cancel-otp-btn")
  if (cancelOtpBtn) {
    cancelOtpBtn.addEventListener("click", () => {
      const otpModal = document.getElementById("otp-modal")
      if (otpModal) {
        otpModal.style.display = "none"
        // Clear OTP inputs
        otpInputs.forEach((input) => (input.value = ""))
      }
    })
  }

  // Resend OTP button
  const resendOtpBtn = document.getElementById("resend-otp-btn")
  if (resendOtpBtn) {
    resendOtpBtn.addEventListener("click", () => {
      resendOtpBtn.disabled = true
      // Clear OTP inputs
      otpInputs.forEach((input) => (input.value = ""))
      // Restart timer
      startOTPTimer()

      // Clear any error messages
      const errorElement = document.getElementById("otp-error-message")
      if (errorElement) {
        errorElement.style.display = "none"
      }
    })
  }

  // Print receipt button
  const printReceiptBtn = document.getElementById("print-receipt-btn")
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener("click", () => {
      window.print()
    })
  }
})
