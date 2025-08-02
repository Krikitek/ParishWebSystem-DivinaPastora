// Combined Church Scheduling Validation System
document.addEventListener("DOMContentLoaded", () => {
  // Detailed validation rules from church-scheduling-validation.js
  const validationRules = {
    // Personal Information
    fullName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Full name is required and must contain only letters, spaces, hyphens, and periods",
    },
    contactNumber: {
      required: true,
      pattern: /^09[0-9]{9}$/,
      message: "Valid 11-digit mobile number is required (format: 09XXXXXXXXX)",
    },
    emailAddress: {
      required: true,
      email: true,
      message: "Valid email address is required",
    },
    completeAddress: {
      required: true,
      minLength: 10,
      message: "Complete address is required and must be detailed",
    },

    // Service Information
    serviceTypeSelect: {
      required: true,
      message: "Service type is required",
    },
    serviceDate: {
      required: true,
      date: true,
      futureDate: true,
      businessDays: true,
      message: "Valid future service date is required (weekdays only)",
    },
    serviceTime: {
      required: true,
      time: true,
      businessHours: true,
      message: "Valid service time is required (8:00 AM - 5:00 PM)",
    },

    // Baptism specific fields
    childName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Child's name is required and must contain only letters",
    },
    birthDate: {
      required: true,
      date: true,
      pastDate: true,
      maxAge: 18,
      message: "Valid birth date is required (child must be under 18)",
    },
    dateOfBirth: {
      required: true,
      date: true,
      pastDate: true,
      message: "Valid birth date is required",
    },
    fatherName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Father's name is required and must contain only letters",
    },
    motherName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Mother's name is required and must contain only letters",
    },
    godfatherName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Godfather's name is required and must contain only letters",
    },
    godmotherName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Godmother's name is required and must contain only letters",
    },
    birthCertificate: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 5 * 1024 * 1024, // 5MB
      message: "Birth certificate is required (JPG, PNG, or PDF, max 5MB)",
    },

    // Confirmation specific fields
    confirmandName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Confirmand's name is required and must contain only letters",
    },
    confirmandAge: {
      required: true,
      min: 7,
      max: 25,
      message: "Confirmand's age must be between 7 and 25 years",
    },
    dateOfBaptism: {
      required: true,
      date: true,
      pastDate: true,
      message: "Valid baptism date is required",
    },
    dateOfConfirmation: {
      required: true,
      date: true,
      futureDate: true,
      message: "Valid confirmation date is required",
    },
    sponsorName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Sponsor's name is required and must contain only letters",
    },
    baptismCertificate: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 5 * 1024 * 1024,
      message: "Baptismal certificate is required (JPG, PNG, or PDF, max 5MB)",
    },

    // Communion specific fields
    childAge: {
      required: true,
      min: 7,
      max: 12,
      message: "Child's age must be between 7 and 12 years",
    },
    parentName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Parent/Guardian's name is required and must contain only letters",
    },

    // Wedding specific fields
    groomName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Groom's name is required and must contain only letters",
    },
    brideName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Bride's name is required and must contain only letters",
    },
    groomBaptismal: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 5 * 1024 * 1024,
      message: "Groom's baptismal certificate is required (JPG, PNG, or PDF, max 5MB)",
    },
    brideBaptismal: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 5 * 1024 * 1024,
      message: "Bride's baptismal certificate is required (JPG, PNG, or PDF, max 5MB)",
    },
    cenomar: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 5 * 1024 * 1024,
      message: "CENOMAR is required (JPG, PNG, or PDF, max 5MB)",
    },
    marriageLicense: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 5 * 1024 * 1024,
      message: "Marriage license is required (JPG, PNG, or PDF, max 5MB)",
    },

    // Funeral specific fields
    deceasedName: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Deceased's name is required and must contain only letters",
    },
    deathDate: {
      required: true,
      date: true,
      pastDate: true,
      message: "Valid death date is required (must be in the past)",
    },
    requestorRelation: {
      required: true,
      minLength: 2,
      message: "Requestor's relation to the deceased is required",
    },
    burialLocation: {
      required: true,
      minLength: 5,
      message: "Burial location is required and must be detailed",
    },
    deathCertificate: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 5 * 1024 * 1024,
      message: "Death certificate is required (JPG, PNG, or PDF, max 5MB)",
    },

    // Mass Intention specific fields
    intentionType: {
      required: true,
      message: "Intention type is required",
    },
    intentionFor: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z\s\-.]+$/,
      message: "Intention for (name) is required and must contain only letters",
    },

    // Payment fields
    gcashMobile: {
      required: true,
      pattern: /^09[0-9]{9}$/,
      message: "Valid GCash mobile number is required",
    },
    paymentScreenshot: {
      required: true,
      fileType: ["image/jpeg", "image/png", "image/jpg"],
      maxSize: 3 * 1024 * 1024,
      message: "Payment screenshot is required (JPG or PNG, max 3MB)",
    },
    referenceNumber: {
      required: true,
      minLength: 5,
      pattern: /^[A-Za-z0-9-]+$/,
      message: "Payment reference number is required",
    },

    // Terms and conditions
    acknowledgementTerms: {
      required: true,
      message: "You must accept the terms and conditions",
    },
  }

  // Service-specific validation groups
  const serviceValidationGroups = {
    BAPTISM: [
      "childName",
      "birthDate",
      "fatherName",
      "motherName",
      "godfatherName",
      "godmotherName",
      "birthCertificate",
    ],
    CONFIRMATION: [
      "confirmandName",
      "confirmandAge",
      "sponsorName",
      "baptismCertificate",
      "dateOfBaptism",
      "dateOfConfirmation",
    ],
    COMMUNION: ["childName", "childAge", "parentName", "baptismCertificate"],
    WEDDING: ["groomName", "brideName", "groomBaptismal", "brideBaptismal", "cenomar", "marriageLicense"],
    FUNERAL: ["deceasedName", "deathDate", "requestorRelation", "burialLocation", "deathCertificate"],
    INTENTION: ["intentionType", "intentionFor"],
  }

  // Enhanced FormValidationController with detailed validation rules
  const FormValidationController = {
    // Validation state
    validationState: {
      personalInfo: false,
      serviceInfo: false,
      serviceSpecific: false,
      payment: false,
      files: false,
    },

    // Initialize all validation systems
    init() {
      this.addErrorElements()
      this.addGlobalValidationListeners()
      this.setupFormSubmissionValidation()
      this.setupRealTimeValidation()
      this.setupCrossFieldValidation()
    },

    // Add error message elements to form fields
    addErrorElements() {
      const formFields = document.querySelectorAll(".input-field, .select-field")

      formFields.forEach((field) => {
        if (!field.querySelector(".error-message")) {
          const errorMessage = document.createElement("div")
          errorMessage.className = "error-message validation-error"
          errorMessage.style.color = "#ea4335"
          errorMessage.style.fontSize = "12px"
          errorMessage.style.marginTop = "5px"
          errorMessage.style.display = "none"
          field.appendChild(errorMessage)
        }
      })
    },

    // Add global validation listeners
    addGlobalValidationListeners() {
      // Form submission prevention for invalid forms
      const forms = document.querySelectorAll("form")
      forms.forEach((form) => {
        form.addEventListener("submit", (e) => {
          if (!this.validateEntireForm()) {
            e.preventDefault()
            this.showValidationSummary()
          }
        })
      })

      // Button click validation
      const submitButtons = document.querySelectorAll(".next-btn, .confirm-btn, .pay-btn")
      submitButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const section = button.closest(".form-section")
          if (section && !this.validateSection(section)) {
            e.preventDefault()
            this.focusFirstError(section)
          }
        })
      })
    },

    // Setup form submission validation
    setupFormSubmissionValidation() {
      // Override existing validation functions
      const originalValidateScheduleForm = window.validateScheduleForm
      const originalValidatePaymentForm = window.validatePaymentForm

      window.validateScheduleForm = () => {
        const basicValid = originalValidateScheduleForm ? originalValidateScheduleForm() : true
        const comprehensiveValid = this.validateScheduleFormComprehensive()
        return basicValid && comprehensiveValid
      }

      window.validatePaymentForm = () => {
        const basicValid = originalValidatePaymentForm ? originalValidatePaymentForm() : true
        const comprehensiveValid = this.validatePaymentFormComprehensive()
        return basicValid && comprehensiveValid
      }
    },

    // Setup real-time validation with debouncing
    setupRealTimeValidation() {
      let validationTimeout

      // Input validation with debouncing
      document.addEventListener("input", (e) => {
        clearTimeout(validationTimeout)
        validationTimeout = setTimeout(() => {
          if (e.target.matches("input, select, textarea")) {
            this.validateFieldRealTime(e.target)
          }
        }, 300)
      })

      // Immediate validation for file inputs and selects
      document.addEventListener("change", (e) => {
        if (e.target.matches('input[type="file"], select')) {
          this.validateFieldRealTime(e.target)
        }
      })

      // Clear error state on input
      document.addEventListener("input", (e) => {
        if (e.target.matches("input, select, textarea")) {
          this.clearFieldError(e.target)
        }
      })

      // Blur validation
      document.addEventListener(
        "blur",
        (e) => {
          if (e.target.matches("input, select, textarea")) {
            this.validateFieldRealTime(e.target)
          }
        },
        true,
      )
    },

    // Setup cross-field validation
    setupCrossFieldValidation() {
      // Date consistency validation
      const birthDate = document.getElementById("dateOfBirth") || document.getElementById("birthDate")
      const serviceDate = document.getElementById("serviceDate")
      const baptismDate = document.getElementById("dateOfBaptism")
      const confirmationDate = document.getElementById("dateOfConfirmation")

      // Validate date relationships
      if (birthDate && baptismDate) {
        ;[birthDate, baptismDate].forEach((field) => {
          field.addEventListener("change", () => {
            this.validateDateConsistency()
          })
        })
      }

      if (birthDate && confirmationDate) {
        ;[birthDate, confirmationDate].forEach((field) => {
          field.addEventListener("change", () => {
            this.validateDateConsistency()
          })
        })
      }

      // Service date validation
      if (serviceDate) {
        serviceDate.addEventListener("change", () => {
          this.validateServiceDate()
        })
      }

      // Age-based validation
      const ageFields = document.querySelectorAll("#confirmandAge, #childAge")
      ageFields.forEach((field) => {
        field.addEventListener("input", () => {
          this.validateAgeConsistency(field)
        })
      })

      // Service type change validation
      const serviceTypeSelect = document.getElementById("serviceTypeSelect")
      if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener("change", () => {
          this.clearServiceSpecificErrors()
        })
      }
    },

    // Enhanced field validation using detailed rules
    validateField(field) {
      const fieldName = field.id
      const fieldValue = field.value ? field.value.trim() : ""
      const fieldType = field.type
      const rule = validationRules[fieldName]

      if (!rule) return true

      const fieldContainer = field.closest(".input-field") || field.closest(".select-field")
      const errorElement = fieldContainer ? fieldContainer.querySelector(".error-message") : null

      // Reset validation state
      this.clearFieldError(field)

      // Required validation
      if (rule.required && !fieldValue && fieldType !== "file") {
        return this.showFieldError(field, rule.message)
      }

      // File validation
      if (fieldType === "file" && rule.required) {
        if (field.files.length === 0) {
          return this.showFieldError(field, rule.message)
        }

        const file = field.files[0]

        // File type validation
        if (rule.fileType && !rule.fileType.includes(file.type)) {
          return this.showFieldError(field, rule.message)
        }

        // File size validation
        if (rule.maxSize && file.size > rule.maxSize) {
          return this.showFieldError(
            field,
            `File size must be less than ${(rule.maxSize / (1024 * 1024)).toFixed(1)}MB`,
          )
        }
      }

      // Checkbox validation
      if (fieldType === "checkbox" && rule.required && !field.checked) {
        return this.showFieldError(field, rule.message)
      }

      // Skip other validations if field is empty and not required
      if (!fieldValue && fieldType !== "file") return true

      // Min length validation
      if (rule.minLength && fieldValue.length < rule.minLength) {
        return this.showFieldError(field, rule.message)
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(fieldValue)) {
        return this.showFieldError(field, rule.message)
      }

      // Email validation
      if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
        return this.showFieldError(field, rule.message)
      }

      // Number validations
      if (fieldType === "number" || rule.min || rule.max) {
        const numValue = Number.parseInt(fieldValue)

        if (rule.min && numValue < rule.min) {
          return this.showFieldError(field, rule.message)
        }

        if (rule.max && numValue > rule.max) {
          return this.showFieldError(field, rule.message)
        }
      }

      // Date validations
      if (rule.date || fieldType === "date") {
        const dateValue = new Date(fieldValue)

        if (isNaN(dateValue.getTime())) {
          return this.showFieldError(field, rule.message)
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Future date validation
        if (rule.futureDate && dateValue <= today) {
          return this.showFieldError(field, "Date must be in the future")
        }

        // Past date validation
        if (rule.pastDate && dateValue >= today) {
          return this.showFieldError(field, "Date must be in the past")
        }

        // Business days validation (Monday to Friday)
        if (rule.businessDays) {
          const dayOfWeek = dateValue.getDay()
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            return this.showFieldError(field, "Service date must be a weekday (Monday to Friday)")
          }
        }

        // Age validation for birth dates
        if (rule.maxAge) {
          const age = Math.floor((today - dateValue) / (365.25 * 24 * 60 * 60 * 1000))
          if (age > rule.maxAge) {
            return this.showFieldError(field, `Age must be ${rule.maxAge} years or younger`)
          }
        }
      }

      // Time validations
      if (rule.time || fieldType === "time") {
        if (rule.businessHours) {
          const [hours, minutes] = fieldValue.split(":").map(Number)
          const timeInMinutes = hours * 60 + minutes
          const startTime = 8 * 60 // 8:00 AM
          const endTime = 17 * 60 // 5:00 PM

          if (timeInMinutes < startTime || timeInMinutes > endTime) {
            return this.showFieldError(field, "Service time must be between 8:00 AM and 5:00 PM")
          }
        }
      }

      return true
    },

    // Validate service-specific fields
    validateServiceFields(serviceType) {
      const fieldsToValidate = serviceValidationGroups[serviceType] || []
      let isValid = true

      fieldsToValidate.forEach((fieldName) => {
        const field = document.getElementById(fieldName)
        if (field && field.offsetParent !== null) {
          // Skip hidden fields
          const fieldValid = this.validateField(field)
          isValid = isValid && fieldValid
        }
      })

      return isValid
    },

    // Validate date consistency with enhanced logic
    validateDateConsistency() {
      const birthDate = document.getElementById("dateOfBirth") || document.getElementById("birthDate")
      const baptismDate = document.getElementById("dateOfBaptism")
      const confirmationDate = document.getElementById("dateOfConfirmation")

      if (birthDate && baptismDate && birthDate.value && baptismDate.value) {
        const birth = new Date(birthDate.value)
        const baptism = new Date(baptismDate.value)

        if (baptism < birth) {
          this.showFieldError(baptismDate, "Baptism date cannot be before birth date")
          return false
        }
      }

      if (birthDate && confirmationDate && birthDate.value && confirmationDate.value) {
        const birth = new Date(birthDate.value)
        const confirmation = new Date(confirmationDate.value)
        const ageDiff = confirmation.getFullYear() - birth.getFullYear()

        if (confirmation < birth) {
          this.showFieldError(confirmationDate, "Confirmation date cannot be before birth date")
          return false
        }

        if (ageDiff < 7) {
          this.showFieldError(confirmationDate, "Confirmation typically occurs at age 7 or older")
          return false
        }
      }

      return true
    },

    // Validate service date with enhanced rules
    validateServiceDate() {
      const serviceDate = document.getElementById("serviceDate")
      if (!serviceDate || !serviceDate.value) return true

      const selectedDate = new Date(serviceDate.value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Must be future date
      if (selectedDate <= today) {
        this.showFieldError(serviceDate, "Service date must be in the future")
        return false
      }

      // Must be weekday
      const dayOfWeek = selectedDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        this.showFieldError(serviceDate, "Service date must be a weekday (Monday to Friday)")
        return false
      }

      // Must be at least 3 days in advance
      const threeDaysFromNow = new Date(today)
      threeDaysFromNow.setDate(today.getDate() + 3)

      if (selectedDate < threeDaysFromNow) {
        this.showFieldError(serviceDate, "Service date must be at least 3 days in advance")
        return false
      }

      return true
    },

    // Validate age consistency
    validateAgeConsistency(ageField) {
      const age = Number.parseInt(ageField.value)
      const fieldId = ageField.id

      if (fieldId === "confirmandAge") {
        if (age < 7 || age > 25) {
          this.showFieldError(ageField, "Confirmand age must be between 7 and 25 years")
          return false
        }
      } else if (fieldId === "childAge") {
        if (age < 7 || age > 12) {
          this.showFieldError(ageField, "Child age for communion must be between 7 and 12 years")
          return false
        }
      }

      return true
    },

    // Validate field in real-time
    validateFieldRealTime(field) {
      // Skip hidden fields
      if (field.offsetParent === null) return true

      // Use enhanced validation
      const isValid = this.validateField(field)

      // Update validation state
      this.updateValidationState()

      return isValid
    },

    // Validate entire form comprehensively
    validateEntireForm() {
      let isValid = true

      // Validate all visible sections
      const sections = document.querySelectorAll('.form-section:not([style*="display: none"])')
      sections.forEach((section) => {
        const sectionValid = this.validateSection(section)
        isValid = isValid && sectionValid
      })

      // Cross-field validation
      const crossFieldValid = this.validateDateConsistency() && this.validateServiceDate()
      isValid = isValid && crossFieldValid

      return isValid
    },

    // Validate schedule form comprehensively
    validateScheduleFormComprehensive() {
      const serviceType = document.getElementById("serviceTypeSelect")?.value
      let isValid = true

      // Basic field validation for visible fields
      const requiredFields = document.querySelectorAll(
        "#schedule-form-section input[required], #schedule-form-section select[required]",
      )
      requiredFields.forEach((field) => {
        if (field.offsetParent !== null) {
          // Skip hidden fields
          if (!this.validateField(field)) {
            isValid = false
          }
        }
      })

      // Service-specific validation
      if (serviceType) {
        const serviceValid = this.validateServiceFields(serviceType)
        isValid = isValid && serviceValid
      }

      // Cross-field validation
      const crossFieldValid = this.validateDateConsistency() && this.validateServiceDate()
      isValid = isValid && crossFieldValid

      return isValid
    },

    // Validate payment form comprehensively
    validatePaymentFormComprehensive() {
      let isValid = true

      // Payment field validation
      const paymentFields = ["gcashMobile", "referenceNumber", "paymentScreenshot"]
      paymentFields.forEach((fieldName) => {
        const field = document.getElementById(fieldName)
        if (field && field.offsetParent !== null) {
          if (!this.validateField(field)) {
            isValid = false
          }
        }
      })

      return isValid
    },

    // Validate section
    validateSection(section) {
      const fields = section.querySelectorAll("input, select, textarea")
      let isValid = true

      fields.forEach((field) => {
        if (field.offsetParent !== null) {
          // Skip hidden fields
          if (!this.validateField(field)) {
            isValid = false
          }
        }
      })

      return isValid
    },

    // Show field error
    showFieldError(field, message) {
      const container = field.closest(".input-field") || field.closest(".select-field") || field.parentNode
      let errorElement = container.querySelector(".validation-error")

      if (!errorElement) {
        errorElement = document.createElement("div")
        errorElement.className = "validation-error error-message"
        errorElement.style.color = "#ea4335"
        errorElement.style.fontSize = "12px"
        errorElement.style.marginTop = "5px"
        container.appendChild(errorElement)
      }

      errorElement.textContent = message
      errorElement.style.display = "block"
      field.style.borderColor = "#ea4335"
      container.classList?.add("error")

      return false
    },

    // Clear field error
    clearFieldError(field) {
      const container = field.closest(".input-field") || field.closest(".select-field")
      const errorElement = container ? container.querySelector(".validation-error") : null

      container?.classList.remove("error")
      field.style.borderColor = "#dee2e6"
      if (errorElement) {
        errorElement.style.display = "none"
      }
    },

    // Clear service-specific field errors
    clearServiceSpecificErrors() {
      const dynamicFields = document.getElementById("dynamic-service-fields")
      if (dynamicFields) {
        const fields = dynamicFields.querySelectorAll("input, select, textarea")
        fields.forEach((field) => {
          this.clearFieldError(field)
        })
      }
    },

    // Focus first error
    focusFirstError(section) {
      const firstError = section.querySelector(
        'input[style*="border-color: rgb(234, 67, 53)"], select[style*="border-color: rgb(234, 67, 53)"]',
      )
      if (firstError) {
        firstError.focus()
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    },

    // Show validation summary
    showValidationSummary() {
      const errors = document.querySelectorAll('.validation-error:not([style*="display: none"])')
      if (errors.length > 0) {
        const errorMessages = Array.from(errors).map((error) => error.textContent)
        const uniqueErrors = [...new Set(errorMessages)]

        alert(
          `Please fix the following errors:\n\n${uniqueErrors.slice(0, 5).join("\n")}${uniqueErrors.length > 5 ? "\n...and more" : ""}`,
        )
      }
    },

    // Update validation state
    updateValidationState() {
      // Update button states based on validation
      const nextButtons = document.querySelectorAll(".next-btn")
      const confirmButtons = document.querySelectorAll(".confirm-btn")

      nextButtons.forEach((button) => {
        const section = button.closest(".form-section")
        const isValid = section ? this.validateSection(section) : false
        button.disabled = !isValid
      })

      confirmButtons.forEach((button) => {
        const section = button.closest(".form-section")
        const isValid = section ? this.validateSection(section) : false
        button.disabled = !isValid
      })
    },
  }

  // Initialize comprehensive validation
  FormValidationController.init()

  // Export for global access
  window.FormValidationController = FormValidationController
  window.validateScheduleForm =
    FormValidationController.validateScheduleFormComprehensive.bind(FormValidationController)
  window.validatePaymentForm = FormValidationController.validatePaymentFormComprehensive.bind(FormValidationController)
  window.validateField = FormValidationController.validateField.bind(FormValidationController)
  window.validateServiceFields = FormValidationController.validateServiceFields.bind(FormValidationController)

  // Export validation system for external use
  window.ChurchSchedulingValidation = {
    controller: FormValidationController,
    validationRules,
    serviceValidationGroups,
  }
})
