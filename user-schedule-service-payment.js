// enhanced-payment-validation.js - Comprehensive payment validation
document.addEventListener("DOMContentLoaded", () => {
  // Payment validation rules
  const paymentValidationRules = {
    gcashMobile: {
      required: true,
      pattern: /^09[0-9]{9}$/,
      message: "Valid GCash mobile number is required (format: 09XXXXXXXXX)",
    },
    gcashAmount: {
      required: true,
      min: 1,
      max: 50000,
      message: "Payment amount must be between ₱1.00 and ₱50,000.00",
    },
    referenceNumber: {
      required: true,
      minLength: 8,
      maxLength: 20,
      pattern: /^[A-Za-z0-9-]+$/,
      message: "Reference number must be 8-20 characters (letters, numbers, and hyphens only)",
    },
    paymentScreenshot: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg"],
      maxSize: 3 * 1024 * 1024, // 3MB
      message: "Payment screenshot is required (JPG or PNG, max 3MB)",
    },
  }

  // Validate payment field
  function validatePaymentField(field) {
    const fieldName = field.id
    const fieldValue = field.value ? field.value.trim() : ""
    const rule = paymentValidationRules[fieldName]

    if (!rule) return true

    const errorElement = field.parentNode.querySelector(".payment-error") || createPaymentErrorElement(field)

    // Clear previous error
    errorElement.textContent = ""
    errorElement.style.display = "none"
    field.style.borderColor = "#dee2e6"

    // Required validation
    if (rule.required && !fieldValue && field.type !== "file") {
      return showPaymentError(field, errorElement, rule.message)
    }

    // File validation
    if (field.type === "file" && rule.required) {
      if (field.files.length === 0) {
        return showPaymentError(field, errorElement, rule.message)
      }

      const file = field.files[0]

      // File type validation
      if (rule.fileType && !rule.fileType.includes(file.type)) {
        return showPaymentError(field, errorElement, "Please upload a valid image file (JPG or PNG)")
      }

      // File size validation
      if (rule.maxSize && file.size > rule.maxSize) {
        return showPaymentError(
          field,
          errorElement,
          `File size must be less than ${(rule.maxSize / (1024 * 1024)).toFixed(1)}MB`,
        )
      }
    }

    // Skip other validations if field is empty and not required
    if (!fieldValue && field.type !== "file") return true

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(fieldValue)) {
      return showPaymentError(field, errorElement, rule.message)
    }

    // Length validations
    if (rule.minLength && fieldValue.length < rule.minLength) {
      return showPaymentError(field, errorElement, rule.message)
    }

    if (rule.maxLength && fieldValue.length > rule.maxLength) {
      return showPaymentError(field, errorElement, rule.message)
    }

    // Number validations
    if (rule.min || rule.max) {
      const numValue = Number.parseFloat(fieldValue.replace(/[^\d.]/g, ""))

      if (rule.min && numValue < rule.min) {
        return showPaymentError(field, errorElement, rule.message)
      }

      if (rule.max && numValue > rule.max) {
        return showPaymentError(field, errorElement, rule.message)
      }
    }

    return true
  }

  // Create payment error element
  function createPaymentErrorElement(field) {
    const errorElement = document.createElement("div")
    errorElement.className = "payment-error"
    errorElement.style.color = "#ea4335"
    errorElement.style.fontSize = "12px"
    errorElement.style.marginTop = "5px"
    errorElement.style.display = "none"
    field.parentNode.appendChild(errorElement)
    return errorElement
  }

  // Show payment error
  function showPaymentError(field, errorElement, message) {
    field.style.borderColor = "#ea4335"
    errorElement.textContent = message
    errorElement.style.display = "block"
    return false
  }

  // Validate entire payment form
  function validatePaymentForm() {
    const paymentFields = ["gcashMobile", "referenceNumber", "paymentScreenshot"]
    let isValid = true

    paymentFields.forEach((fieldName) => {
      const field = document.getElementById(fieldName)
      if (field) {
        const fieldValid = validatePaymentField(field)
        isValid = isValid && fieldValid
      }
    })

    return isValid
  }

  // Add payment validation listeners
  function addPaymentValidationListeners() {
    const paymentFields = document.querySelectorAll("#gcashMobile, #referenceNumber, #paymentScreenshot")

    paymentFields.forEach((field) => {
      field.addEventListener("blur", () => {
        validatePaymentField(field)
      })

      field.addEventListener("input", () => {
        const errorElement = field.parentNode.querySelector(".payment-error")
        if (errorElement) {
          errorElement.style.display = "none"
        }
        field.style.borderColor = "#dee2e6"
      })

      if (field.type === "file") {
        field.addEventListener("change", () => {
          validatePaymentField(field)
        })
      }
    })

    // Format GCash mobile number
    const gcashMobile = document.getElementById("gcashMobile")
    if (gcashMobile) {
      gcashMobile.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value.length > 11) {
          value = value.substring(0, 11)
        }
        e.target.value = value
      })
    }

    // Format reference number
    const referenceNumber = document.getElementById("referenceNumber")
    if (referenceNumber) {
      referenceNumber.addEventListener("input", (e) => {
        e.target.value = e.target.value.toUpperCase()
      })
    }
  }

  // Initialize payment validation
  addPaymentValidationListeners()

  // Export validation function
  window.validatePaymentForm = validatePaymentForm
  window.validatePaymentField = validatePaymentField
})
