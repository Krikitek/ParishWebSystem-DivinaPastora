// Enhanced validation system for unified certificate forms
document.addEventListener("DOMContentLoaded", () => {
  // Comprehensive validation rules
  const validationRules = {
    // Certificate type validation
    certificateTypeSelect: {
      required: true,
      message: "Kinakailangan ang uri ng sertipiko",
    },

    // Personal information validation
    lastName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-'.]+$/,
      message:
        "Kinakailangan ang apelyido at dapat naglalaman lamang ng mga titik, espasyo, gitling, kudlit, at tuldok",
    },
    firstName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-'.]+$/,
      message:
        "Kinakailangan ang unang pangalan at dapat naglalaman lamang ng mga titik, espasyo, gitling, kudlit, at tuldok",
    },
    middleName: {
      pattern: /^[A-Za-z\s\-'.]*$/,
      message: "Ang gitnang pangalan ay dapat naglalaman lamang ng mga titik, espasyo, gitling, kudlit, at tuldok",
    },
    dateOfBirth: {
      required: true,
      date: true,
      pastDate: true,
      message: "Kinakailangan ang wastong petsa ng kapanganakan at dapat nasa nakaraan",
    },
    sacramentDate: {
      date: true,
      customValidation: validateSacramentDate,
      message: "Wastong petsa ng sakramento",
    },

    birthProvince: {
      required: true,
      message: "Kinakailangan ang lalawigan ng kapanganakan",
    },
    birthCity: {
      required: true,
      message: "Kinakailangan ang lungsod/bayan ng kapanganakan",
    },
    birthDistrict: {
      required: true,
      message: "Kinakailangan ang barangay ng kapanganakan",
    },

    // Parent information validation (now optional)
    fatherLastName: {
      pattern: /^[A-Za-z\s\-'.]*$/,
      message: "Ang apelyido ng ama ay dapat naglalaman lamang ng mga titik",
    },
    fatherFirstName: {
      pattern: /^[A-Za-z\s\-'.]*$/,
      message: "Ang unang pangalan ng ama ay dapat naglalaman lamang ng mga titik",
    },
    fatherMiddleName: {
      pattern: /^[A-Za-z\s\-'.]*$/,
      message: "Ang gitnang pangalan ng ama ay dapat naglalaman lamang ng mga titik",
    },
    motherLastName: {
      pattern: /^[A-Za-z\s\-'.]*$/,
      message: "Ang apelyido ng ina ay dapat naglalaman lamang ng mga titik",
    },
    motherFirstName: {
      pattern: /^[A-Za-z\s\-'.]*$/,
      message: "Ang unang pangalan ng ina ay dapat naglalaman lamang ng mga titik",
    },
    motherMiddleName: {
      pattern: /^[A-Za-z\s\-'.]*$/,
      message: "Ang gitnang pangalan ng ina ay dapat naglalaman lamang ng mga titik",
    },

    // Request information validation
    relationship: {
      required: true,
      message: "Kinakailangan ang relasyon sa may-ari ng dokumento",
    },
    purpose: {
      required: true,
      message: "Kinakailangan ang layunin ng kahilingan",
    },
    otherPurpose: {
      conditionalRequired: () => getPurposeValue() === "OTHERS",
      minLength: 3,
      message: "Mangyaring tukuyin ang layunin ng kahilingan",
    },

    // Contact information validation
    mobileNumber: {
      required: true,
      pattern: /^09[0-9]{9}$/,
      message: "Kinakailangan ang wastong 11-digit na numero ng mobile (format: 09XXXXXXXXX)",
    },
    emailAddress: {
      required: true,
      email: true,
      message: "Kinakailangan ang wastong email address",
    },

    // Unified delivery validation
    unifiedAddressLine1: {
      conditionalRequired: () => getUnifiedDeliveryOption() === "delivery",
      minLength: 10,
      message: "Kinakailangan ang detalyadong address para sa paghahatid (minimum 10 characters)",
    },
    unifiedZipCode: {
      conditionalRequired: () => getUnifiedDeliveryOption() === "delivery",
      pattern: /^[0-9]{4}$/,
      message: "Kinakailangan ang wastong 4-digit na zip/postal code para sa paghahatid",
    },

    // Unified pickup validation
    unifiedPickupDate: {
      conditionalRequired: () => getUnifiedDeliveryOption() === "pickup",
      date: true,
      futureDate: true,
      businessDay: true,
      message: "Kinakailangan ang wastong hinaharap na petsa ng pagkuha (Lunes-Biyernes lamang)",
    },
    unifiedPickupContactNumber: {
      conditionalRequired: () => getUnifiedDeliveryOption() === "pickup",
      pattern: /^09[0-9]{9}$/,
      message: "Kinakailangan ang wastong 11-digit na numero ng telepono para sa abiso ng pagkuha",
    },

    // Terms validation
    unifiedDeliveryTermsCheckbox: {
      required: true,
      checkbox: true,
      message: "Dapat ninyong tanggapin ang mga tuntunin at kondisyon upang magpatuloy",
    },
  }

  // Initialize validation system
  function initValidation() {
    addErrorElements()
    addValidationListeners()
  }

  // Add error message containers to form fields
  function addErrorElements() {
    const formFields = document.querySelectorAll(".input-field, .select-field")

    formFields.forEach((field) => {
      if (!field.querySelector(".error-message")) {
        const errorMessage = document.createElement("div")
        errorMessage.className = "error-message"
        errorMessage.style.color = "#eb2424ff"
        errorMessage.style.fontSize = "12px"
        errorMessage.style.marginTop = "4px"
        errorMessage.style.display = "none"
        field.appendChild(errorMessage)
      }
    })
  }

  // Add validation event listeners
  function addValidationListeners() {
    const allFields = document.querySelectorAll("input, select, textarea")

    allFields.forEach((field) => {
      // Validate on blur (when user leaves field)
      field.addEventListener("blur", () => {
        validateField(field)
      })

      // Clear errors on input (when user starts typing)
      field.addEventListener("input", () => {
        clearFieldError(field)
      })

      // Validate on change for select elements
      field.addEventListener("change", () => {
        validateField(field)
      })
    })
  }

  // Validate individual field
  function validateField(field) {
    const fieldName = field.id
    const fieldValue = field.value.trim()
    const fieldType = field.type
    const rule = validationRules[fieldName]

    if (!rule) return true

    const fieldContainer = field.closest(".input-field") || field.closest(".select-field")
    const errorElement = fieldContainer?.querySelector(".error-message")

    // Clear previous error state
    clearFieldError(field)

    // Check conditional requirements
    if (rule.conditionalRequired && typeof rule.conditionalRequired === "function") {
      if (rule.conditionalRequired() && !fieldValue) {
        showFieldError(field, rule.message)
        return false
      }
    }

    // Required field validation
    if (rule.required && !fieldValue) {
      showFieldError(field, rule.message)
      return false
    }

    // Checkbox validation
    if (rule.checkbox && !field.checked) {
      showFieldError(field, rule.message)
      return false
    }

    // Skip other validations if field is empty and not required
    if (!fieldValue && !rule.required && !rule.conditionalRequired) return true

    // Minimum length validation
    if (rule.minLength && fieldValue.length < rule.minLength) {
      showFieldError(field, rule.message)
      return false
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(fieldValue)) {
      showFieldError(field, rule.message)
      return false
    }

    // Email validation
    if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
      showFieldError(field, rule.message)
      return false
    }

    // Date validation
    if (rule.date) {
      const dateValue = new Date(fieldValue)
      if (isNaN(dateValue.getTime())) {
        showFieldError(field, rule.message)
        return false
      }

      // Past date validation
      if (rule.pastDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (dateValue >= today) {
          showFieldError(field, "Ang petsa ay dapat nasa nakaraan")
          return false
        }
      }

      // Future date validation
      if (rule.futureDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (dateValue <= today) {
          showFieldError(field, "Ang petsa ay dapat sa hinaharap")
          return false
        }
      }

      // Business day validation
      if (rule.businessDay) {
        const dayOfWeek = dateValue.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          showFieldError(field, "Mangyaring pumili ng weekday (Lunes-Biyernes)")
          return false
        }
      }
    }

    // Custom validation
    if (rule.customValidation && typeof rule.customValidation === "function") {
      const customResult = rule.customValidation(fieldValue, field)
      if (customResult !== true) {
        showFieldError(field, customResult || rule.message)
        return false
      }
    }

    return true
  }

  // Custom validation for sacrament date
  function validateSacramentDate(dateValue, field) {
    if (!dateValue) return true // Optional field now

    const certificateType = getCurrentCertificateType()
    const birthDateField = document.getElementById("dateOfBirth")

    if (!birthDateField || !birthDateField.value) {
      return "Mangyaring ilagay muna ang petsa ng kapanganakan"
    }

    const birthDate = new Date(birthDateField.value)
    const sacramentDate = new Date(dateValue)

    if (sacramentDate <= birthDate) {
      return `Ang petsa ng ${certificateType === "KUMPIL" ? "kumpil" : "binyag"} ay dapat pagkatapos ng petsa ng kapanganakan`
    }

    // Calculate age at sacrament
    const ageAtSacrament = sacramentDate.getFullYear() - birthDate.getFullYear()
    const monthDiff = sacramentDate.getMonth() - birthDate.getMonth()
    const dayDiff = sacramentDate.getDate() - birthDate.getDate()

    let actualAge = ageAtSacrament
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--
    }

    if (certificateType === "KUMPIL") {
      // Confirmation typically occurs between ages 7-25
      if (actualAge < 7) {
        return "Ang kumpil ay karaniwang ginagawa sa edad na 7 o mas matanda"
      }
      if (actualAge > 25) {
        return "Mangyaring i-verify ang petsa ng kumpil - mukhang napakahuli nito"
      }
    } else {
      // Baptism can occur at any age, but warn for unusual cases
      if (actualAge > 18) {
        return "Mangyaring i-verify ang petsa ng binyag - ang adult baptism ay hindi gaanong karaniwan"
      }
    }

    return true
  }

  // Show field error
  function showFieldError(field, message) {
  const fieldContainer = field.closest(".input-field") || field.closest(".select-field");
  const errorElement = fieldContainer?.querySelector(".error-message");

  if (fieldContainer) {
    fieldContainer.classList.add("error");
    fieldContainer.style.borderColor = "#ea4335";
  }

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}


  // Clear field error
  function clearFieldError(field) {
    const fieldContainer = field.closest(".input-field") || field.closest(".select-field")
    const errorElement = fieldContainer?.querySelector(".error-message")

    if (fieldContainer) {
      fieldContainer.classList.remove("error")
      fieldContainer.style.borderColor = "#dee2e6"
    }

    if (errorElement) {
      errorElement.textContent = ""
      errorElement.style.display = "none"
    }
  }

  // Validate entire form section
  function validateFormSection(sectionId, isAutoFilled = false) {
  const section = document.getElementById(sectionId);
  if (!section) return true;

  const fields = section.querySelectorAll("input, select, textarea");
  let isValid = true;

  fields.forEach((field) => {
    // ✅ Skip hidden fields
    if (field.offsetParent === null) return;

    // ✅ Skip fields in hidden sections
    const fieldSection = field.closest(".form-group, .form-row");
    if (fieldSection && fieldSection.offsetParent === null) return;

    // ✅ If field is auto-filled by handleRelationshipChange
    if (isAutoFilled && field.value.trim() !== "") {
      // Remove invalid classes if previously marked
      field.classList.remove("is-invalid");
      field.classList.add("is-valid");

      // ✅ Remove associated error message if present
      const errorEl = field.parentElement.querySelector(".invalid-feedback");
      if (errorEl) {
        errorEl.style.display = "none";
        errorEl.textContent = "";
      }
      return; // Skip validation since it's auto-filled
    }

    // ✅ Validate only if not auto-filled or empty
    const fieldValid = validateField(field);
    isValid = isValid && fieldValid;
  });

  return isValid;
}

  function scrollToFirstInvalidField(sectionId) {
  const section = document.getElementById(sectionId);
  const firstInvalid = section.querySelector(".error-message:visible, .error");

  if (firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });

    const input = firstInvalid.querySelector("input, select, textarea") || firstInvalid;
    if (input && input.focus) {
      input.focus();
    }
  }
}


  // Update button states based on validation
  function updateButtonStates() {
  const saveAndContinueBtn = document.getElementById("save-and-continue-btn");
  const proceedToSummaryBtn = document.getElementById("proceed-to-summary-btn");
  const requestFormSection = document.getElementById("request-form-section");
  const unifiedDeliverySection = document.getElementById("unified-delivery-section");

  // Keep buttons always enabled but block navigation later
  if (saveAndContinueBtn && requestFormSection && requestFormSection.style.display !== "none") {

    saveAndContinueBtn.addEventListener("click", function (e) {
      const isValid = validateFormSection("request-form-section");
      if (!isValid) {
        e.preventDefault();
        scrollToFirstInvalidField("request-form-section");
      } else {
        goToNextSection(); // <-- Replace with your actual navigation logic
      }
    });
  }

  if (proceedToSummaryBtn && unifiedDeliverySection && unifiedDeliverySection.style.display !== "none") {
    proceedToSummaryBtn.disabled = false;

    proceedToSummaryBtn.addEventListener("click", function (e) {
      const isValid = validateFormSection("unified-delivery-section");
      if (!isValid) {
        e.preventDefault();
        scrollToFirstInvalidField("unified-delivery-section");
      } else {
        goToSummary(); // <-- Replace with your actual navigation logic
      }
    });
  }
}


  // Utility functions
  function getCurrentCertificateType() {
    const certificateTypeSelect = document.getElementById("certificateTypeSelect")
    return certificateTypeSelect ? certificateTypeSelect.value : "BAPTISMAL"
  }

  function getUnifiedDeliveryOption() {
    const deliveryOption = document.querySelector('input[name="unifiedDeliveryOption"]:checked')
    return deliveryOption ? deliveryOption.value : "delivery"
  }

  function getPurposeValue() {
    const purpose = document.getElementById("purpose")
    return purpose ? purpose.value : ""
  }

  // Public validation functions
  window.validateRequestForm = () => validateFormSection("request-form-section")
  window.validateUnifiedDeliveryForm = () => validateFormSection("unified-delivery-section")
  window.validateField = validateField
  window.clearFieldError = clearFieldError
  window.showFieldError = showFieldError

  // Initialize validation system
  initValidation()
})
