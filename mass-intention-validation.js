// Mass Intention Form Validation
window.validateIntentionForm = () => {
  let isValid = true
  const errors = []

  // Clear previous errors
  document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"))
  document.querySelectorAll(".error-message").forEach((el) => (el.style.display = "none"))

  // Validate preferred date
  const preferredDate = document.getElementById("preferredIntentionDate")
  if (!preferredDate.value) {
    showFieldError(preferredDate, "Mangyaring pumili ng petsa.")
    isValid = false
  } else {
    const selectedDate = new Date(preferredDate.value)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    if (selectedDate < tomorrow) {
      showFieldError(preferredDate, "Ang petsa ay dapat mas malayo sa ngayon.")
      isValid = false
    }
  }

  // Validate preferred time
  const preferredTime = document.getElementById("preferredIntentionTime")
  if (!preferredTime.value) {
    showFieldError(preferredTime, "Mangyaring pumili ng oras.")
    isValid = false
  }

  // Validate intention type
  const intentionType = document.getElementById("intentionType")
  if (!intentionType.value) {
    showFieldError(intentionType, "Mangyaring pumili ng uri ng intensyon.")
    isValid = false
  }

  // Validate names based on intention type
  if (intentionType.value) {
    const nameFieldLimits = {
      PASASALAMAT: { min: 1, max: 10 },
      KAARAWAN: { min: 1, max: 1 },
      KAHILINGAN: { min: 1, max: 10 },
      ANIBERSARYO_NG_KASAL: { min: 2, max: 2 },
      KALULUWA: { min: 1, max: 10 },
    }

    const limits = nameFieldLimits[intentionType.value]
    if (limits) {
      let filledNames = 0
      for (let i = 1; i <= limits.max; i++) {
        const nameField = document.getElementById(`intentionName${i}`)
        if (nameField && nameField.value.trim()) {
          filledNames++
        }
      }

      if (filledNames < limits.min) {
        const firstNameField = document.getElementById("intentionName1")
        if (firstNameField) {
          showFieldError(firstNameField, `Kailangan ng hindi bababa sa ${limits.min} pangalan.`)
        }
        isValid = false
      }

      // Validate required name fields
      for (let i = 1; i <= limits.min; i++) {
        const nameField = document.getElementById(`intentionName${i}`)
        if (nameField && !nameField.value.trim()) {
          showFieldError(nameField, "Kinakailangan ang field na ito.")
          isValid = false
        }
      }
    }
  }

  // Validate requester name
  const requesterName = document.getElementById("requesterName")
  if (!requesterName.value.trim()) {
    showFieldError(requesterName, "Mangyaring ilagay ang inyong pangalan.")
    isValid = false
  }

  // Validate cellphone number
  const requesterCellphone = document.getElementById("requesterCellphone")
  if (!requesterCellphone.value.trim()) {
    showFieldError(requesterCellphone, "Mangyaring ilagay ang inyong cellphone number.")
    isValid = false
  } else if (!/^09\d{9}$/.test(requesterCellphone.value.trim())) {
    showFieldError(requesterCellphone, "Mangyaring ilagay ang tamang format (09XXXXXXXXX).")
    isValid = false
  }

  // Validate mass offering
  const massOffering = document.getElementById("massOffering")
  if (!massOffering.value) {
    showFieldError(massOffering, "Mangyaring pumili ng halaga ng limos.")
    isValid = false
  }

  return isValid
}

function showFieldError(field, message) {
  field.classList.add("error")

  // Find or create error message element
  let errorElement = field.parentNode.querySelector(".error-message")
  if (!errorElement) {
    errorElement = document.createElement("div")
    errorElement.className = "error-message"
    field.parentNode.appendChild(errorElement)
  }

  errorElement.textContent = message
  errorElement.style.display = "block"
  errorElement.style.color = "#dc3545"
  errorElement.style.fontSize = "0.875rem"
  errorElement.style.marginTop = "0.25rem"
}

// Real-time validation
document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("save-and-continue-btn")

  function updateSaveButton() {
    if (saveButton) {
      const isFormValid = checkFormCompleteness()
      saveButton.disabled = !isFormValid
    }
  }

  function checkFormCompleteness() {
    const requiredFields = [
      "preferredIntentionDate",
      "preferredIntentionTime",
      "intentionType",
      "requesterName",
      "requesterCellphone",
      "massOffering",
    ]

    // Check basic required fields
    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId)
      if (!field || !field.value.trim()) {
        return false
      }
    }

    // Check name fields based on intention type
    const intentionType = document.getElementById("intentionType").value
    if (intentionType) {
      const nameFieldLimits = {
        PASASALAMAT: { min: 1, max: 10 },
        KAARAWAN: { min: 1, max: 1 },
        KAHILINGAN: { min: 1, max: 10 },
        ANIBERSARYO_NG_KASAL: { min: 2, max: 2 },
        KALULUWA: { min: 1, max: 10 },
      }

      const limits = nameFieldLimits[intentionType]
      if (limits) {
        for (let i = 1; i <= limits.min; i++) {
          const nameField = document.getElementById(`intentionName${i}`)
          if (!nameField || !nameField.value.trim()) {
            return false
          }
        }
      }
    }

    return true
  }

  // Add event listeners for real-time validation
  document.addEventListener("input", updateSaveButton)
  document.addEventListener("change", updateSaveButton)

  // Initial check
  updateSaveButton()
})
