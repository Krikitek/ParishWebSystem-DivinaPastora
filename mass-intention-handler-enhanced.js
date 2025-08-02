// Mass Intention Form Handler - Multiple Intentions Support with GCash Payment
document.addEventListener("DOMContentLoaded", () => {
  // State Management
  const IntentionState = {
    allIntentions: [],
    currentIntentionIndex: 0,
    currentStep: 1,
    referenceNumber: null,
    transactionId: null,

    // Form sections
    sections: {
      intentionForm: document.getElementById("intention-form-section"),
      intentionsReview: document.getElementById("intentions-review-section"),
      acknowledgement: document.getElementById("acknowledgement-section"),
      payment: document.getElementById("payment-section"),
      success: document.getElementById("success-section"),
    },

    // Navigation buttons
    buttons: {
      saveAndContinue: document.getElementById("save-and-continue-btn"),
      addAnother: document.getElementById("add-another-intention-btn"),
      addNewIntention: document.getElementById("add-new-intention-btn"),
      addMoreIntentions: document.getElementById("add-more-intentions-btn"),
      backToForm: document.getElementById("back-to-form-btn"),
      proceedToAcknowledgement: document.getElementById("proceed-to-acknowledgement-btn"),
      backToReview: document.getElementById("back-to-review-btn"),
      toPayment: document.getElementById("to-payment-btn"),
      backToAcknowledgement: document.getElementById("back-to-acknowledgement-btn"),
      payWithGcash: document.getElementById("pay-with-gcash-btn"),
      verifyOtp: document.getElementById("verify-otp-btn"),
      cancelOtp: document.getElementById("cancel-otp-btn"),
      resendOtp: document.getElementById("resend-otp-btn"),
      cancelIntention: document.getElementById("cancel-intention-btn"),
      returnDashboard: document.getElementById("return-dashboard-btn"),
      printReceipt: document.getElementById("print-receipt-btn"),
      tryAgain: document.getElementById("try-again-btn"),
      contactSupport: document.getElementById("contact-support-btn"),
    },

    // Form fields
    fields: {
      preferredDate: document.getElementById("preferredIntentionDate"),
      preferredTime: document.getElementById("preferredIntentionTime"),
      intentionType: document.getElementById("intentionType"),
      intentionMessage: document.getElementById("intentionMessage"),
      requesterName: document.getElementById("requesterName"),
      requesterCellphone: document.getElementById("requesterCellphone"),
      massOffering: document.getElementById("massOffering"),
      gcashMobile: document.getElementById("gcash-mobile"),
      gcashAmount: document.getElementById("gcash-amount"),
    },
  }

  // Name field limits based on intention type
  const nameFieldLimits = {
    PASASALAMAT: { min: 1, max: 1, label: "Taong pasasalamatan", englishLabel: "Person to thank" },
    KAARAWAN: { min: 1, max: 1, label: "Nagse-celebrate ng kaarawan", englishLabel: "Birthday celebrant" },
    KAHILINGAN: { min: 1, max: 1, label: "Taong ipapanalangin", englishLabel: "Person to pray for" },
    ANIBERSARYO_NG_KASAL: { min: 2, max: 2, label: "Mag-asawang nag-anniversary", englishLabel: "Anniversary couple" },
    KALULUWA: { min: 1, max: 2, label: "Mga yumao na", englishLabel: "Deceased persons" },
  }

  // Initialize the form
  init()

  function init() {
    loadExistingIntentions()
    setupEventListeners()
    setupDateRestrictions()
    updateIntentionsCounter()
    updateProgressSteps(1) // Initialize with step 1
    showSection(IntentionState.sections.intentionForm)
  }

  // Add this function after the init() function
  function updateProgressSteps(currentStep) {
    // Define the steps
    const steps = [
      {
        number: 1,
        filipino: "Detalye ng Intensyon",
        english: "Intention Details",
      },
      {
        number: 2,
        filipino: "Pagsusuri",
        english: "Review",
      },
      {
        number: 3,
        filipino: "Pagkilala",
        english: "Acknowledgement",
      },
      {
        number: 4,
        filipino: "Bayad",
        english: "Payment",
      },
    ]

    // Find all progress containers
    const progressContainers = document.querySelectorAll(".form-progress")

    progressContainers.forEach((container) => {
      container.innerHTML = ""

      steps.forEach((step, index) => {
        const stepElement = document.createElement("div")
        stepElement.className = "progress-step"
        stepElement.setAttribute("data-step", step.number)

        // Determine step status
        if (step.number < currentStep) {
          stepElement.classList.add("completed")
        } else if (step.number === currentStep) {
          stepElement.classList.add("active")
        }

        stepElement.innerHTML = `
          <div class="step-number">${step.number}</div>
          <div class="step-label">
            ${step.filipino}
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              ${step.english}
            </span>
          </div>
        `

        container.appendChild(stepElement)
      })
    })
  }

  function loadExistingIntentions() {
    const storedIntentions = localStorage.getItem("allMassIntentions")
    if (storedIntentions) {
      try {
        IntentionState.allIntentions = JSON.parse(storedIntentions)
      } catch (error) {
        console.error("Error loading intentions:", error)
        IntentionState.allIntentions = []
      }
    }
  }

  function setupEventListeners() {
    // Navigation buttons
    IntentionState.buttons.saveAndContinue?.addEventListener("click", saveCurrentIntentionAndContinue)
    IntentionState.buttons.addAnother?.addEventListener("click", addAnotherIntention)
    IntentionState.buttons.addNewIntention?.addEventListener("click", addNewIntention)
    IntentionState.buttons.addMoreIntentions?.addEventListener("click", addMoreIntentions)
    IntentionState.buttons.backToForm?.addEventListener("click", () => {
      IntentionState.currentStep = 1
      updateProgressSteps(1)
      showSection(IntentionState.sections.intentionForm)
    })
    IntentionState.buttons.proceedToAcknowledgement?.addEventListener("click", proceedToAcknowledgement)
    IntentionState.buttons.backToReview?.addEventListener("click", () => {
      IntentionState.currentStep = 2
      updateProgressSteps(2)
      showSection(IntentionState.sections.intentionsReview)
    })
    IntentionState.buttons.toPayment?.addEventListener("click", proceedToPayment)
    IntentionState.buttons.backToAcknowledgement?.addEventListener("click", () => {
      IntentionState.currentStep = 3
      updateProgressSteps(3)
      showSection(IntentionState.sections.acknowledgement)
    })
    IntentionState.buttons.payWithGcash?.addEventListener("click", handleGCashPayment)
    IntentionState.buttons.verifyOtp?.addEventListener("click", verifyOTP)
    IntentionState.buttons.cancelOtp?.addEventListener("click", () => {
      document.getElementById("otp-modal").style.display = "none"
    })
    IntentionState.buttons.resendOtp?.addEventListener("click", resendOTP)
    IntentionState.buttons.cancelIntention?.addEventListener("click", cancelAllIntentions)
    IntentionState.buttons.returnDashboard?.addEventListener(
      "click",
      () => (window.location.href = "dashboard-user.html"),
    )
    IntentionState.buttons.printReceipt?.addEventListener("click", printReceipt)
    IntentionState.buttons.tryAgain?.addEventListener("click", showPaymentForm)
    IntentionState.buttons.contactSupport?.addEventListener("click", () => {
      alert("Please contact our support team at support@chronos.com or call (02) 8123-4567")
    })

    // Form field listeners
    document.addEventListener("input", handleFormInput)
    document.addEventListener("change", handleFormChange)

    // Acknowledgement terms checkbox
    const acknowledgementTerms = document.getElementById("acknowledgementTerms")
    acknowledgementTerms?.addEventListener("change", updatePaymentButton)

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
  }

  function setupDateRestrictions() {
    const dateField = IntentionState.fields.preferredDate
    if (dateField) {
      // Set minimum date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      dateField.min = tomorrow.toISOString().split("T")[0]
    }
  }

  // Global function for updating available times
  window.updateAvailableTimes = () => {
    const dateField = IntentionState.fields.preferredDate
    const timeField = IntentionState.fields.preferredTime

    if (!dateField.value) {
      timeField.disabled = true
      timeField.innerHTML = '<option value="" disabled selected>PUMILI MUNA NG PETSA</option>'
      return
    }

    const selectedDate = new Date(dateField.value)
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    timeField.disabled = false
    timeField.innerHTML = '<option value="" disabled selected>PUMILI NG ORAS</option>'

    let timeOptions = []

    if (dayOfWeek === 0) {
      // Sunday
      timeOptions = [
        { value: "05:30", text: "5:30 AM" },
        { value: "09:00", text: "9:00 AM" },
        { value: "15:30", text: "3:30 PM" },
        { value: "17:00", text: "5:00 PM" },
        { value: "19:00", text: "7:00 PM" },
      ]
    } else {
      // Monday-Saturday
      timeOptions = [
        { value: "05:30", text: "5:30 AM" },
        { value: "07:00", text: "7:00 AM" },
        { value: "17:00", text: "5:00 PM" },
      ]
    }

    timeOptions.forEach((option) => {
      const optionElement = document.createElement("option")
      optionElement.value = option.value
      optionElement.textContent = option.text
      timeField.appendChild(optionElement)
    })
  }

  // Global function for updating name fields
  window.updateNameFields = () => {
    const intentionType = IntentionState.fields.intentionType.value
    const container = document.getElementById("nameFieldsContainer")

    if (!intentionType) {
      container.innerHTML = `
        <div class="name-limits-info">
          <i class="fas fa-info-circle"></i> 
          <span id="nameLimitsText">
            Pumili muna ng uri ng intensyon upang makita ang limitasyon sa bilang ng pangalan.
            <br>
            <span style="font-style: italic; font-size: 0.95em; color: #555;">
              Choose intention type first to see name limitations.
            </span>
          </span>
        </div>
      `
      return
    }

    const limits = nameFieldLimits[intentionType]
    if (!limits) return

    // Create name input fields
    let nameFieldsHTML = `
      <div class="name-limits-info">
        <i class="fas fa-info-circle"></i> 
        <span id="nameLimitsText">
          ${limits.label}: ${limits.min === limits.max ? limits.min : `${limits.min}-${limits.max}`} pangalan
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            ${limits.englishLabel}: ${limits.min === limits.max ? limits.min : `${limits.min}-${limits.max}`} names
          </span>
        </span>
      </div>
    `

    for (let i = 1; i <= limits.max; i++) {
      const isRequired = i <= limits.min
      nameFieldsHTML += `
        <div class="form-row">
          <div class="form-group">
            <label>
              Pangalan ${i} ${isRequired ? '<span class="required">*</span>' : ""}
              <br>
              <span style="font-style: italic; font-size: 0.95em; color: #555;">
                Name ${i}
              </span>
            </label>
            <div class="input-field">
              <input type="text" id="intentionName${i}" name="intentionName${i}" ${isRequired ? "required" : ""} placeholder="Ilagay ang pangalan">
            </div>
          </div>
        </div>
      `
    }

    container.innerHTML = nameFieldsHTML
  }

  function generateTransactionId() {
    const transactionId = "GC" + Date.now().toString().slice(-8)
    IntentionState.transactionId = transactionId
    return transactionId
  }

  function collectCurrentIntentionData() {
    const intentionType = IntentionState.fields.intentionType.value
    const limits = nameFieldLimits[intentionType]

    // Collect names
    const names = []
    if (limits) {
      for (let i = 1; i <= limits.max; i++) {
        const nameField = document.getElementById(`intentionName${i}`)
        if (nameField && nameField.value.trim()) {
          names.push(nameField.value.trim())
        }
      }
    }

    return {
      id: `intention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      preferredDate: IntentionState.fields.preferredDate.value,
      preferredTime: IntentionState.fields.preferredTime.value,
      intentionType: intentionType,
      names: names,
      intentionMessage: IntentionState.fields.intentionMessage.value.trim(),
      requesterName: IntentionState.fields.requesterName.value.trim(),
      requesterCellphone: IntentionState.fields.requesterCellphone.value.trim(),
      massOffering: Number.parseInt(IntentionState.fields.massOffering.value),
      createdAt: new Date().toISOString(),
    }
  }

  // Update the saveCurrentIntentionAndContinue function to call updateProgressSteps
  function saveCurrentIntentionAndContinue() {
    if (!window.validateIntentionForm()) {
      alert("Mangyaring punan ang lahat ng kinakailangang field nang tama.")
      return
    }

    const intentionData = collectCurrentIntentionData()

    // If editing existing intention
    if (IntentionState.currentIntentionIndex < IntentionState.allIntentions.length) {
      IntentionState.allIntentions[IntentionState.currentIntentionIndex] = intentionData
    } else {
      IntentionState.allIntentions.push(intentionData)
    }

    saveAllIntentions()
    updateIntentionsReviewTable()
    showFlashMessage("Matagumpay na nai-save ang intensyon!")
    IntentionState.currentStep = 2
    updateProgressSteps(2) // Update progress to step 2
    showSection(IntentionState.sections.intentionsReview)
  }

  function addAnotherIntention() {
    if (!window.validateIntentionForm()) {
      alert("Mangyaring punan muna ang kasalukuyang form bago magdagdag ng bago.")
      return
    }

    const intentionData = collectCurrentIntentionData()

    // If editing existing intention
    if (IntentionState.currentIntentionIndex < IntentionState.allIntentions.length) {
      IntentionState.allIntentions[IntentionState.currentIntentionIndex] = intentionData
    } else {
      IntentionState.allIntentions.push(intentionData)
    }

    saveAllIntentions()
    clearForm()
    IntentionState.currentIntentionIndex = IntentionState.allIntentions.length
    updateIntentionsCounter()
    showFlashMessage("Naidagdag na ang intensyon! Maaari na kayong magdagdag pa.")
  }

  function addNewIntention() {
    if (confirm("Magsisimula ito ng bagong intensyon. Ang kasalukuyang progress ay ma-save. Magpatuloy?")) {
      // Save current progress if form has data
      if (hasFormData()) {
        const intentionData = collectCurrentIntentionData()
        IntentionState.allIntentions.push(intentionData)
        saveAllIntentions()
      }

      // Clear form and start new intention
      clearForm()
      IntentionState.currentIntentionIndex = IntentionState.allIntentions.length
      updateIntentionsCounter()
      showFlashMessage("Nagsimula na ang bagong intensyon!")
    }
  }

  function addMoreIntentions() {
    clearForm()
    IntentionState.currentIntentionIndex = IntentionState.allIntentions.length
    IntentionState.currentStep = 1
    showSection(IntentionState.sections.intentionForm)
  }

  function hasFormData() {
    return (
      IntentionState.fields.intentionType.value ||
      IntentionState.fields.preferredDate.value ||
      IntentionState.fields.requesterName.value ||
      IntentionState.fields.requesterCellphone.value
    )
  }

  function showFlashMessage(message, type = "success") {
    const flashElement = document.getElementById("flash-message")
    const flashText = document.getElementById("flash-text")

    if (flashElement && flashText) {
      // Remove existing type classes
      flashElement.className = "flash-message"

      // Add type-specific class
      if (type !== "success") {
        flashElement.classList.add(`flash-${type}`)
      }

      flashText.textContent = message
      flashElement.style.display = "flex"

      // Auto-hide after 4 seconds
      setTimeout(() => {
        flashElement.style.display = "none"
      }, 4000)
    }
  }

  function clearForm() {
    // Reset all form fields
    Object.values(IntentionState.fields).forEach((field) => {
      if (field) {
        field.value = ""
      }
    })

    // Clear name fields
    const nameContainer = document.getElementById("nameFieldsContainer")
    if (nameContainer) {
      nameContainer.innerHTML = `
        <div class="name-limits-info">
          <i class="fas fa-info-circle"></i> 
          <span id="nameLimitsText">
            Pumili muna ng uri ng intensyon upang makita ang limitasyon sa bilang ng pangalan.
            <br>
            <span style="font-style: italic; font-size: 0.95em; color: #555;">
              Choose intention type first to see name limitations.
            </span>
          </span>
        </div>
      `
    }

    // Reset time field
    const timeField = IntentionState.fields.preferredTime
    if (timeField) {
      timeField.disabled = true
      timeField.innerHTML = '<option value="" disabled selected>PUMILI MUNA NG PETSA</option>'
    }

    // Clear errors
    document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"))
    document.querySelectorAll(".error-message").forEach((el) => (el.style.display = "none"))
  }

  function updateIntentionsCounter() {
    const counter = document.getElementById("intentions-count")
    const reviewCounter = document.getElementById("review-intentions-count")
    const addAnotherBtn = document.getElementById("add-another-intention-btn")

    if (counter) counter.textContent = IntentionState.allIntentions.length + 1
    if (reviewCounter) reviewCounter.textContent = IntentionState.allIntentions.length

    // Show add another button if there are intentions
    if (addAnotherBtn) {
      addAnotherBtn.style.display = IntentionState.allIntentions.length > 0 ? "flex" : "none"
    }
  }

  function updateIntentionsReviewTable() {
    const tbody = document.getElementById("intentions-review-tbody")
    if (!tbody) return

    tbody.innerHTML = ""

    IntentionState.allIntentions.forEach((intention, index) => {
      const row = document.createElement("tr")

      // Add highlight class to newly added intentions
      if (index === IntentionState.allIntentions.length - 1) {
        row.classList.add("highlight-new")
        setTimeout(() => {
          row.classList.remove("highlight-new")
        }, 3000)
      }

      const formattedDate = formatDate(intention.preferredDate)
      const formattedTime = formatTime(intention.preferredTime)
      const namesDisplay = intention.names.join(", ")

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${getIntentionTypeDisplay(intention.intentionType)}</td>
        <td>${formattedDate} - ${formattedTime}</td>
        <td>${namesDisplay}</td>
        <td>PHP ${intention.massOffering.toFixed(2)}</td>
        <td class="action-buttons">
          <button class="action-btn edit-btn" onclick="editIntention(${index})">
            <i class="fas fa-edit"></i> I-edit
          </button>
          <button class="action-btn delete-btn" onclick="deleteIntention(${index})">
            <i class="fas fa-trash"></i> Burahin
          </button>
          <button class="action-btn view-btn" onclick="viewIntention(${index})">
            <i class="fas fa-eye"></i> Tingnan
          </button>
        </td>
      `
      tbody.appendChild(row)
    })

    updateIntentionsCounter()
  }

  // Update the proceedToAcknowledgement function
  function proceedToAcknowledgement() {
    if (IntentionState.allIntentions.length === 0) {
      alert("Walang mga intensyon na ma-proceed. Magdagdag muna ng intensyon.")
      return
    }

    // Generate reference number
    const referenceNumber = generateReferenceNumber()
    displayAcknowledgementDetails(referenceNumber)

    IntentionState.currentStep = 3
    updateProgressSteps(3) // Update progress to step 3
    showSection(IntentionState.sections.acknowledgement)
  }

  function displayAcknowledgementDetails(refNumber) {
    // Display reference number
    const referenceElement = document.getElementById("acknowledgement-reference-number")
    if (referenceElement) {
      referenceElement.textContent = refNumber
    }

    // Display mass intention summary
    const summaryContainer = document.getElementById("acknowledgement-summary")
    if (summaryContainer) {
      let totalAmount = 0
      let summaryHTML = ""

      IntentionState.allIntentions.forEach((intention, index) => {
        totalAmount += intention.massOffering
        const formattedDate = formatDate(intention.preferredDate)
        const formattedTime = formatTime(intention.preferredTime)
        const namesDisplay = intention.names.join(", ")

        summaryHTML += `
          <div class="intention-item">
            <div class="intention-header">
              <div class="intention-type">${getIntentionTypeDisplay(intention.intentionType)}</div>
              <div class="intention-amount">₱${intention.massOffering.toFixed(2)}</div>
            </div>
            <div class="intention-details">
              <div class="detail-item">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${formattedDate} - ${formattedTime}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Names:</span>
                <span class="detail-value">${namesDisplay}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Requester:</span>
                <span class="detail-value">${intention.requesterName}</span>
              </div>
              ${
                intention.intentionMessage
                  ? `
                <div class="detail-item">
                  <span class="detail-label">Message:</span>
                  <span class="detail-value">${intention.intentionMessage}</span>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        `
      })

      summaryHTML += `
        <div class="total-summary">
          <div class="total-intentions">Total Intentions: ${IntentionState.allIntentions.length}</div>
          <div class="total-amount">₱${totalAmount.toFixed(2)}</div>
        </div>
      `

      summaryContainer.innerHTML = summaryHTML
    }
  }

  // Update the proceedToPayment function
  function proceedToPayment() {
    const acknowledgementTerms = document.getElementById("acknowledgementTerms")
    if (!acknowledgementTerms.checked) {
      alert("Mangyaring tanggapin ang mga tuntunin at kondisyon.")
      return
    }

    initializePaymentPage()
    IntentionState.currentStep = 4
    updateProgressSteps(4) // Update progress to step 4
    showSection(IntentionState.sections.payment)
  }

  function initializePaymentPage() {
    let totalAmount = 0
    let orderSummaryHTML = ""

    // Calculate total and build order summary
    orderSummaryHTML += `
      <div class="summary-row">
        <span class="summary-label">Reference Number:</span>
        <span class="summary-value">${IntentionState.referenceNumber}</span>
      </div>
    `

    IntentionState.allIntentions.forEach((intention, index) => {
      totalAmount += intention.massOffering
      orderSummaryHTML += `
        <div class="summary-row">
          <span class="summary-label">${getIntentionTypeDisplay(intention.intentionType)}:</span>
          <span class="summary-value">₱${intention.massOffering.toFixed(2)}</span>
        </div>
      `
    })

    orderSummaryHTML += `
      <div class="summary-row">
        <span class="summary-label">Number of Intentions:</span>
        <span class="summary-value">${IntentionState.allIntentions.length}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Total Amount:</span>
        <span class="summary-value">₱${totalAmount.toFixed(2)}</span>
      </div>
    `

    // Update order summary
    const orderSummaryContainer = document.getElementById("payment-order-summary")
    if (orderSummaryContainer) {
      orderSummaryContainer.innerHTML = orderSummaryHTML
    }

    // Update GCash amount field
    const gcashAmountField = document.getElementById("gcash-amount")
    if (gcashAmountField) {
      gcashAmountField.value = totalAmount.toFixed(2)
    }

    // Pre-fill mobile number if available
    if (IntentionState.allIntentions.length > 0) {
      const firstIntention = IntentionState.allIntentions[0]
      if (firstIntention.requesterCellphone) {
        const gcashMobileField = document.getElementById("gcash-mobile")
        if (gcashMobileField) {
          gcashMobileField.value = firstIntention.requesterCellphone
        }
      }
    }
  }

  function handleGCashPayment() {
    const gcashMobile = IntentionState.fields.gcashMobile.value.trim()
    const amount = Number.parseFloat(IntentionState.fields.gcashAmount.value)

    // Validate GCash mobile number
    if (!/^09\d{9}$/.test(gcashMobile)) {
      alert("Please enter a valid GCash mobile number (format: 09XXXXXXXXX)")
      IntentionState.fields.gcashMobile.focus()
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
    const otpInputs = document.querySelectorAll(".otp-input")
    otpInputs.forEach((input) => (input.value = ""))

    document.getElementById("otp-error-message").textContent = ""

    startOTPTimer()

    document.getElementById("otp-modal").style.display = "flex"
    otpInputs[0].focus()
  }

  function startOTPTimer() {
    let timeLeft = 180 // 3 minutes
    const timerElement = document.getElementById("otp-timer")
    const resendBtn = IntentionState.buttons.resendOtp

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

  function verifyOTP() {
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
      processSuccessfulPayment()
    }, 1500)
  }

  function resendOTP() {
    const resendBtn = IntentionState.buttons.resendOtp
    resendBtn.disabled = true

    const otpInputs = document.querySelectorAll(".otp-input")
    otpInputs.forEach((input) => (input.value = ""))

    document.getElementById("otp-error-message").textContent = ""

    startOTPTimer()

    const errorElement = document.getElementById("otp-error-message")
    errorElement.textContent = "A new OTP has been sent to your GCash mobile number."
    errorElement.style.color = "#28a745"

    setTimeout(() => {
      errorElement.style.color = ""
      errorElement.textContent = ""
    }, 3000)
  }

  function processSuccessfulPayment() {
    const transactionId = generateTransactionId()
    const currentDate = new Date()
    const gcashNumber = IntentionState.fields.gcashMobile.value
    const amount = Number.parseFloat(IntentionState.fields.gcashAmount.value)

    const paymentData = {
      referenceNumber: IntentionState.referenceNumber,
      transactionId: transactionId,
      intentions: IntentionState.allIntentions,
      totalAmount: amount,
      gcashNumber: gcashNumber,
      paymentDate: currentDate.toISOString(),
      status: "PAID",
    }

    localStorage.setItem("massIntentionPayment", JSON.stringify(paymentData))

    showPaymentSuccess(transactionId, gcashNumber, amount, currentDate)
  }

  function showPaymentSuccess(transactionId, gcashNumber, amount, date) {
    document.getElementById("gcash-payment-form").style.display = "none"
    document.getElementById("payment-action-buttons").style.display = "none"

    document.getElementById("receipt-date").textContent = date.toLocaleString()
    document.getElementById("receipt-transaction-id").textContent = transactionId
    document.getElementById("receipt-gcash-number").textContent = gcashNumber
    document.getElementById("receipt-amount").textContent = `₱${amount.toFixed(2)}`

    document.getElementById("payment-success").style.display = "block"

    localStorage.removeItem("allMassIntentions")
  }

  function showPaymentFailed(errorMessage, errorCode) {
    document.getElementById("gcash-payment-form").style.display = "none"
    document.getElementById("payment-action-buttons").style.display = "none"

    document.getElementById("payment-error-message").textContent = errorMessage
    document.getElementById("payment-error-code").textContent = `Error Code: ${errorCode}`

    document.getElementById("payment-failed").style.display = "block"
  }

  function showPaymentForm() {
    document.getElementById("payment-failed").style.display = "none"

    document.getElementById("gcash-payment-form").style.display = "block"
    document.getElementById("payment-action-buttons").style.display = "flex"
  }

  function generateReferenceNumber() {
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "")
    const timeStr = now.getTime().toString().slice(-4)
    const refNumber = `MI-${dateStr}-${timeStr}`
    IntentionState.referenceNumber = refNumber
    return refNumber
  }

  function printReceipt() {
    window.print()
  }

  function cancelAllIntentions() {
    if (confirm("Sigurado ba kayong gusto ninyong kanselahin ang lahat ng intensyon?")) {
      localStorage.removeItem("allMassIntentions")
      window.location.href = "dashboard-user.html"
    }
  }

  function saveAllIntentions() {
    localStorage.setItem("allMassIntentions", JSON.stringify(IntentionState.allIntentions))
  }

  function showSection(section) {
    Object.values(IntentionState.sections).forEach((s) => {
      if (s) s.style.display = "none"
    })

    if (section) {
      section.style.display = "block"
      section.classList.add("fade-in")
      window.scrollTo(0, 0)
    }
  }

  function updatePaymentButton() {
    const acknowledgementTerms = document.getElementById("acknowledgementTerms")
    const toPaymentBtn = IntentionState.buttons.toPayment

    if (toPaymentBtn) {
      toPaymentBtn.disabled = !acknowledgementTerms.checked
    }
  }

  function handleFormInput(e) {
    if (e.target.type === "text" && e.target.id !== "requesterCellphone" && e.target.id !== "gcash-mobile") {
      e.target.value = e.target.value.toUpperCase()
    }
  }

  function handleFormChange(e) {
    // Handle any form changes
  }

  // Global functions for table actions
  window.editIntention = (index) => {
    const intention = IntentionState.allIntentions[index]
    if (!intention) return

    IntentionState.fields.preferredDate.value = intention.preferredDate
    IntentionState.fields.intentionType.value = intention.intentionType
    IntentionState.fields.intentionMessage.value = intention.intentionMessage
    IntentionState.fields.requesterName.value = intention.requesterName
    IntentionState.fields.requesterCellphone.value = intention.requesterCellphone
    IntentionState.fields.massOffering.value = intention.massOffering

    window.updateAvailableTimes()
    setTimeout(() => {
      IntentionState.fields.preferredTime.value = intention.preferredTime
      window.updateNameFields()

      setTimeout(() => {
        intention.names.forEach((name, i) => {
          const nameField = document.getElementById(`intentionName${i + 1}`)
          if (nameField) {
            nameField.value = name
          }
        })
      }, 100)
    }, 100)

    IntentionState.currentIntentionIndex = index
    IntentionState.currentStep = 1
    showSection(IntentionState.sections.intentionForm)
    showFlashMessage("Nai-load na ang intensyon para sa pag-edit.", "info")
  }

  window.deleteIntention = (index) => {
    if (confirm("Sigurado ba kayong gusto ninyong burahin ang intensyong ito?")) {
      IntentionState.allIntentions.splice(index, 1)
      saveAllIntentions()
      updateIntentionsReviewTable()
      showFlashMessage("Matagumpay na nabura ang intensyon.", "warning")

      if (IntentionState.allIntentions.length === 0) {
        IntentionState.currentStep = 1
        showSection(IntentionState.sections.intentionForm)
      }
    }
  }

  window.viewIntention = (index) => {
    const intention = IntentionState.allIntentions[index]
    if (!intention) return

    const formattedDate = formatDate(intention.preferredDate)
    const formattedTime = formatTime(intention.preferredTime)
    const namesDisplay = intention.names.join(", ")

    const details = `
Uri ng Intensyon: ${getIntentionTypeDisplay(intention.intentionType)}
Petsa at Oras: ${formattedDate} - ${formattedTime}
Mga Pangalan: ${namesDisplay}
Mensahe: ${intention.intentionMessage || "Walang espesyal na mensahe"}
Nag-request: ${intention.requesterName}
Cellphone: ${intention.requesterCellphone}
Limos: PHP ${intention.massOffering.toFixed(2)}
    `

    alert(details)
  }

  // Utility functions
  function formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const options = { year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("tl-PH", options).toUpperCase()
  }

  function formatTime(timeString) {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  function getIntentionTypeDisplay(type) {
    const typeMap = {
      PASASALAMAT: "PASASALAMAT (THANKSGIVING)",
      KAARAWAN: "KAARAWAN (BIRTHDAY)",
      KAHILINGAN: "KAHILINGAN (PRAYER REQUEST)",
      ANIBERSARYO_NG_KASAL: "ANIBERSARYO NG KASAL (WEDDING ANNIVERSARY)",
      KALULUWA: "KALULUWA (FOR THE SOULS)",
    }
    return typeMap[type] || type
  }
})
