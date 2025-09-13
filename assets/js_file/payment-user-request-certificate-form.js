// Unified Certificate Form Handler - Supports both Baptism and Confirmation certificates
document.addEventListener("DOMContentLoaded", () => {
  // Get form sections
  const requestFormSection = document.getElementById("request-form-section")
  const step1ReviewSection = document.getElementById("step1-review-section")
  const deliverySection = document.getElementById("delivery-section")
  const step2ReviewSection = document.getElementById("step2-review-section")

  // Get navigation buttons
  const nextBtn = document.getElementById("next-btn")
  const editStep1Btn = document.getElementById("edit-step1-btn")
  const confirmStep1Btn = document.getElementById("confirmStep1Btn") // This is the incorrect ID
  const backToStep1ReviewBtn = document.getElementById("back-to-step1-review-btn")
  const toStep2ReviewBtn = document.getElementById("to-step2-review-btn")
  const backToDeliveryBtn = document.getElementById("back-to-delivery-btn")
  const confirmBtn = document.getElementById("confirm-btn")
  const cancelRequestBtn = document.getElementById("cancel-request-btn")

  // Fix the ID to match the HTML
  const correctConfirmStep1Btn = document.getElementById("confirm-step1-btn")

  // Form fields
  const certificateTypeSelect = document.getElementById("certificateTypeSelect")
  const requestType = document.getElementById("requestType")
  const numberOfCopies = document.getElementById("numberOfCopies")
  const lastName = document.getElementById("lastName")
  const firstName = document.getElementById("firstName")
  const middleName = document.getElementById("middleName")
  const dateOfBirth = document.getElementById("dateOfBirth")
  const sacramentDate = document.getElementById("sacramentDate")
  const sacramentDateLabel = document.getElementById("sacramentDateLabel")
  const birthCountry = document.getElementById("birthCountry")
  const birthProvince = document.getElementById("birthProvince")
  const birthCity = document.getElementById("birthCity")
  const sexRadios = document.querySelectorAll('input[name="sex"]')
  const fatherLastName = document.getElementById("fatherLastName")
  const fatherFirstName = document.getElementById("fatherFirstName")
  const fatherMiddleName = document.getElementById("fatherMiddleName")
  const motherLastName = document.getElementById("motherLastName")
  const motherFirstName = document.getElementById("motherFirstName")
  const motherMiddleName = document.getElementById("motherMiddleName")
  const sponsorSection = document.getElementById("sponsorSection")
  const sponsorLastName = document.getElementById("sponsorLastName")
  const sponsorFirstName = document.getElementById("sponsorFirstName")
  const sponsorMiddleName = document.getElementById("sponsorMiddleName")
  const relationship = document.getElementById("relationship")
  const purpose = document.getElementById("purpose")
  const otherPurposeRow = document.getElementById("otherPurposeRow")
  const otherPurpose = document.getElementById("otherPurpose")
  const mobileNumber = document.getElementById("mobileNumber")
  const emailAddress = document.getElementById("emailAddress")

  // Delivery/Pickup fields
  const deliveryRadio = document.getElementById("deliveryRadio")
  const pickupRadio = document.getElementById("pickupRadio")
  const deliveryAddressSection = document.getElementById("deliveryAddressSection")
  const pickupSection = document.getElementById("pickupSection")
  const deliveryText = document.getElementById("deliveryText")
  const pickupText = document.getElementById("pickupText")
  const deliveryProvince = document.getElementById("deliveryProvince")
  const deliveryCity = document.getElementById("deliveryCity")
  const deliveryBarangay = document.getElementById("deliveryBarangay")
  const pickupDate = document.getElementById("pickupDate")
  const pickupContactNumber = document.getElementById("pickupContactNumber")
  const deliveryTermsCheckbox = document.getElementById("deliveryTermsCheckbox")

  // Current certificate type - don't default to BAPTISMAL, get from form or localStorage
  let currentCertificateType = null

  // City data by province
  const cityData = {
    BATANGAS: [
      "TANAUAN CITY",
      "LIPA CITY",
      "BATANGAS CITY",
      "STO. TOMAS",
      "TAAL",
      "BAUAN",
      "NASUGBU",
      "LEMERY",
      "ROSARIO",
      "MALVAR",
    ],
    CAVITE: [
      "BACOOR",
      "DASMARIÑAS",
      "IMUS",
      "GENERAL TRIAS",
      "TRECE MARTIRES",
      "TAGAYTAY",
      "KAWIT",
      "SILANG",
      "CARMONA",
      "TANZA",
    ],
    LAGUNA: [
      "SAN PABLO CITY",
      "SANTA ROSA CITY",
      "CALAMBA CITY",
      "BIÑAN",
      "SAN PEDRO",
      "CABUYAO",
      "LOS BAÑOS",
      "PAGSANJAN",
      "ALAMINOS",
      "PILA",
    ],
    RIZAL: [
      "ANTIPOLO CITY",
      "CAINTA",
      "TAYTAY",
      "ANGONO",
      "BINANGONAN",
      "RODRIGUEZ",
      "SAN MATEO",
      "TANAY",
      "MORONG",
      "PILILLA",
    ],
    "METRO MANILA": [
      "MANILA",
      "QUEZON CITY",
      "MAKATI",
      "TAGUIG",
      "PASIG",
      "PARAÑAQUE",
      "MANDALUYONG",
      "SAN JUAN",
      "MARIKINA",
      "PASAY",
    ],
    BULACAN: [
      "MALOLOS",
      "MEYCAUAYAN",
      "SAN JOSE DEL MONTE",
      "BALIUAG",
      "PLARIDEL",
      "HAGONOY",
      "BUSTOS",
      "CALUMPIT",
      "PULILAN",
      "SANTA MARIA",
    ],
    PAMPANGA: [
      "SAN FERNANDO",
      "ANGELES CITY",
      "MABALACAT",
      "LUBAO",
      "GUAGUA",
      "FLORIDABLANCA",
      "PORAC",
      "ARAYAT",
      "MEXICO",
      "BACOLOR",
    ],
    CEBU: [
      "CEBU CITY",
      "MANDAUE CITY",
      "LAPU-LAPU CITY",
      "TALISAY",
      "DANAO",
      "TOLEDO",
      "CARCAR",
      "NAGA",
      "BOGO",
      "MINGLANILLA",
    ],
    DAVAO: ["DAVAO CITY", "TAGUM", "PANABO", "DIGOS", "MATI", "SAMAL", "MALITA", "NABUNTURAN", "MACO", "PANTUKAN"],
    ILOILO: [
      "ILOILO CITY",
      "OTON",
      "PAVIA",
      "LEGANES",
      "SANTA BARBARA",
      "CABATUAN",
      "SAN MIGUEL",
      "ZARRAGA",
      "DUMANGAS",
      "BAROTAC NUEVO",
    ],
  }

  // Barangay data by city
  const barangayData = {
    "TANAUAN CITY": ["BARANGAY 1", "BARANGAY 2", "BARANGAY 3", "BARANGAY 4", "BARANGAY 5"],
    "LIPA CITY": ["BARANGAY A", "BARANGAY B", "BARANGAY C", "BARANGAY D", "BARANGAY E"],
    MANILA: [
      "TONDO",
      "BINONDO",
      "QUIAPO",
      "SAN NICOLAS",
      "SANTA CRUZ",
      "SAMPALOC",
      "SAN MIGUEL",
      "ERMITA",
      "MALATE",
      "PACO",
    ],
    "QUEZON CITY": [
      "BAHAY TORO",
      "BATASAN HILLS",
      "COMMONWEALTH",
      "CULIAT",
      "FAIRVIEW",
      "HOLY SPIRIT",
      "KAMUNING",
      "LOYOLA HEIGHTS",
      "NEW ERA",
      "TANDANG SORA",
    ],
  }

  // Initialize form
  init()

  function init() {
    // Initialize certificate type first
    initializeCertificateType()

    // Set up event listeners
    setupEventListeners()

    // Set up location dropdowns
    setupLocationDropdowns()

    // Set up delivery/pickup toggle
    setupDeliveryPickupToggle()

    // Make text inputs uppercase
    setupUppercaseInputs()

    // Set minimum dates
    setupDateConstraints()

    // Initialize certificate type handling
    handleCertificateTypeChange()

    // Setup purpose dropdown handling
    setupPurposeHandling()

    // Check for returning navigation
    checkReturnNavigation()
  }

  function initializeCertificateType() {
    // Check localStorage first
    const baptismRequestData = JSON.parse(localStorage.getItem("baptismRequestData") || "{}")

    if (baptismRequestData.requestDetails?.certificateType) {
      currentCertificateType = baptismRequestData.requestDetails.certificateType
      if (certificateTypeSelect) {
        certificateTypeSelect.value = currentCertificateType
      }
    } else if (certificateTypeSelect && certificateTypeSelect.value) {
      currentCertificateType = certificateTypeSelect.value
    } else {
      // Only default to BAPTISMAL if no other option is available
      currentCertificateType = "BAPTISMAL"
      if (certificateTypeSelect) {
        certificateTypeSelect.value = "BAPTISMAL"
      }
    }
  }

  function setupEventListeners() {
    // Certificate type change
    if (certificateTypeSelect) {
      certificateTypeSelect.addEventListener("change", handleCertificateTypeChange)
    }

    // Navigation buttons
    if (nextBtn) nextBtn.addEventListener("click", goToStep1Review)
    if (editStep1Btn) editStep1Btn.addEventListener("click", goBackToRequestForm)

    // Use the correct button ID for the confirm step 1 button
    if (correctConfirmStep1Btn) correctConfirmStep1Btn.addEventListener("click", goToDeliverySection)

    if (backToStep1ReviewBtn) backToStep1ReviewBtn.addEventListener("click", goBackToStep1Review)
    if (toStep2ReviewBtn) toStep2ReviewBtn.addEventListener("click", goToStep2Review)
    if (backToDeliveryBtn) backToDeliveryBtn.addEventListener("click", goBackToDeliverySection)
    if (confirmBtn) confirmBtn.addEventListener("click", goToSummary)
    if (cancelRequestBtn) cancelRequestBtn.addEventListener("click", cancelRequest)

    // Real-time validation
    document.addEventListener("input", handleInputChange)
    document.addEventListener("change", handleInputChange)
  }

  function setupLocationDropdowns() {
    // Birth place dropdowns
    if (birthProvince && birthCity) {
      birthProvince.addEventListener("change", function () {
        populateCityDropdown(this.value, birthCity)
      })
    }

    // Delivery address dropdowns
    if (deliveryProvince && deliveryCity) {
      deliveryProvince.addEventListener("change", function () {
        populateCityDropdown(this.value, deliveryCity)
      })
    }

    if (deliveryCity && deliveryBarangay) {
      deliveryCity.addEventListener("change", function () {
        populateBarangayDropdown(this.value, deliveryBarangay)
      })
    }
  }

  function populateCityDropdown(province, cityDropdown) {
    cityDropdown.innerHTML = '<option value="" disabled selected>PUMILI NG LUNGSOD/BAYAN</option>'

    if (province && cityData[province]) {
      cityData[province].forEach((city) => {
        const option = document.createElement("option")
        option.value = city
        option.textContent = city
        cityDropdown.appendChild(option)
      })
    }
  }

  function populateBarangayDropdown(city, barangayDropdown) {
    barangayDropdown.innerHTML = '<option value="" disabled selected>PUMILI NG BARANGAY</option>'

    if (city && barangayData[city]) {
      barangayData[city].forEach((barangay) => {
        const option = document.createElement("option")
        option.value = barangay
        option.textContent = barangay
        barangayDropdown.appendChild(option)
      })
    }
  }

  function setupDeliveryPickupToggle() {
    if (deliveryRadio && pickupRadio) {
      deliveryRadio.addEventListener("change", function () {
        if (this.checked) {
          showDeliverySection()
        }
      })

      pickupRadio.addEventListener("change", function () {
        if (this.checked) {
          showPickupSection()
        }
      })
    }
  }

  function showDeliverySection() {
    if (deliveryAddressSection) deliveryAddressSection.style.display = "block"
    if (pickupSection) pickupSection.style.display = "none"
    if (deliveryText) deliveryText.style.display = "block"
    if (pickupText) pickupText.style.display = "none"

    updateDeliveryText()
  }

  function showPickupSection() {
    if (deliveryAddressSection) deliveryAddressSection.style.display = "none"
    if (pickupSection) pickupSection.style.display = "block"
    if (deliveryText) deliveryText.style.display = "none"
    if (pickupText) pickupText.style.display = "block"

    updatePickupText()
  }

  function updateDeliveryText() {
    const certificateName = currentCertificateType === "KUMPIL" ? "kumpil" : "binyag"
    if (deliveryText) {
      deliveryText.textContent = `Ang inyong sertipiko ng ${certificateName} ay ihahatid direkta sa inyong address.`
    }
  }

  function updatePickupText() {
    const certificateName = currentCertificateType === "KUMPIL" ? "kumpil" : "binyag"
    if (pickupText) {
      pickupText.textContent = `Maaari ninyong kunin ang inyong sertipiko ng ${certificateName} sa opisina ng parokya.`
    }
  }

  function setupUppercaseInputs() {
    const textInputs = document.querySelectorAll('input[type="text"]')
    textInputs.forEach((input) => {
      // Skip email field
      if (input.id !== "emailAddress") {
        input.addEventListener("input", function () {
          this.value = this.value.toUpperCase()
        })
      }
    })
  }

  function setupDateConstraints() {
    // Set minimum date to today for pickup date
    if (pickupDate) {
      const today = new Date().toISOString().split("T")[0]
      pickupDate.min = today
    }

    // Set maximum date for birth date (must be in the past)
    if (dateOfBirth) {
      const today = new Date().toISOString().split("T")[0]
      dateOfBirth.max = today
    }
  }

  function setupPurposeHandling() {
    if (purpose) {
      purpose.addEventListener("change", function () {
        if (this.value === "OTHERS") {
          otherPurposeRow.style.display = "block"
          otherPurpose.required = true
        } else {
          otherPurposeRow.style.display = "none"
          otherPurpose.required = false
          otherPurpose.value = ""
        }
      })
    }
  }

  function handleCertificateTypeChange() {
    // Get the actual selected value from the dropdown
    if (certificateTypeSelect) {
      currentCertificateType = certificateTypeSelect.value
    }

    // Update form fields based on certificate type
    updateFormForCertificateType(currentCertificateType)

    // Update progress labels
    updateProgressLabels(currentCertificateType)

    // Update delivery/pickup text
    updateDeliveryText()
    updatePickupText()
  }

  function updateFormForCertificateType(certificateType) {
    if (certificateType === "KUMPIL") {
      // Update sacrament date label for confirmation
      if (sacramentDateLabel) {
        sacramentDateLabel.innerHTML = "Petsa ng Kumpil"
        // Create an English translation element
        const englishLabel = document.createElement("div")
        englishLabel.innerHTML = "(Date of Confirmation)"
        englishLabel.style.fontSize = "0.9em"
        englishLabel.style.fontStyle = "italic"
        englishLabel.style.color = "#555"
        sacramentDateLabel.appendChild(englishLabel)
      }

      // Show sponsor section
      if (sponsorSection) {
        sponsorSection.style.display = "block"
        if (sponsorLastName) sponsorLastName.required = true
        if (sponsorFirstName) sponsorFirstName.required = true
      }
    } else {
      // Update sacrament date label for baptism
      if (sacramentDateLabel) {
        sacramentDateLabel.innerHTML = "Petsa ng Binyag"
        // Create an English translation element
        const englishLabel = document.createElement("div")
        englishLabel.innerHTML = "(Date of Baptism)"
        englishLabel.style.fontSize = "0.9em"
        englishLabel.style.fontStyle = "italic"
        englishLabel.style.color = "#555"
        sacramentDateLabel.appendChild(englishLabel)
      }

      // Hide sponsor section
      if (sponsorSection) {
        sponsorSection.style.display = "none"
        if (sponsorLastName) sponsorLastName.required = false
        if (sponsorFirstName) sponsorFirstName.required = false
      }
    }
  }

  function updateProgressLabels(certificateType) {
    const certificateNameFilipino = certificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"
    const certificateNameEnglish = certificateType === "KUMPIL" ? "Confirmation" : "Baptism"
    const stepLabels = document.querySelectorAll(".step-label")

    stepLabels.forEach((label, idx) => {
      // Step 1: Mga Detalye ng Kahilingan
      if (label.textContent.includes("Mga Detalye ng Kahilingan")) {
        label.textContent = `Mga Detalye ng Kahilingan - ${certificateNameFilipino}`
        const englishLabel = document.createElement("div")
        englishLabel.innerHTML = `(Request Details - ${certificateNameEnglish})`
        englishLabel.style.fontSize = "0.9em"
        englishLabel.style.fontStyle = "italic"
        englishLabel.style.color = "#888"
        label.appendChild(englishLabel)
      }
      // Step 2: Mga Detalye ng Paghahatid
      else if (label.textContent.includes("Mga Detalye ng Paghahatid")) {
        label.textContent = "Mga Detalye ng Paghahatid"
        const englishLabel = document.createElement("div")
        englishLabel.innerHTML = "(Delivery Details)"
        englishLabel.style.fontSize = "0.9em"
        englishLabel.style.fontStyle = "italic"
        englishLabel.style.color = "#888"
        label.appendChild(englishLabel)
      }
      // Step 3: Buod
      else if (label.textContent.trim() === "Buod") {
        label.textContent = "Buod"
        const englishLabel = document.createElement("div")
        englishLabel.innerHTML = "(Summary)"
        englishLabel.style.fontSize = "0.9em"
        englishLabel.style.fontStyle = "italic"
        englishLabel.style.color = "#888"
        label.appendChild(englishLabel)
      }
      // Step 4: Pagkilala
      else if (label.textContent.trim() === "Pagkilala") {
        label.textContent = "Pagkilala"
        const englishLabel = document.createElement("div")
        englishLabel.innerHTML = "(Acknowledgement)"
        englishLabel.style.fontSize = "0.9em"
        englishLabel.style.fontStyle = "italic"
        englishLabel.style.color = "#888"
        label.appendChild(englishLabel)
      }
      // Step 5: Bayad
      else if (label.textContent.trim() === "Bayad") {
        label.textContent = "Bayad"
        const englishLabel = document.createElement("div")
        englishLabel.innerHTML = "(Payment)"
        englishLabel.style.fontSize = "0.9em"
        englishLabel.style.fontStyle = "italic"
        englishLabel.style.color = "#888"
        label.appendChild(englishLabel)
      }
    })
  }

  function handleInputChange(e) {
    // Clear error styling when user starts typing
    const field = e.target
    const fieldContainer = field.closest(".input-field") || field.closest(".select-field")
    if (fieldContainer) {
      fieldContainer.classList.remove("error")
      const errorElement = fieldContainer.querySelector(".error-message")
      if (errorElement) {
        errorElement.textContent = ""
      }
    }

    // Enable/disable next buttons based on validation
    if (requestFormSection && requestFormSection.style.display !== "none") {
      nextBtn.disabled = !validateCurrentSection()
    } else if (deliverySection && deliverySection.style.display !== "none") {
      toStep2ReviewBtn.disabled = !validateCurrentSection()
    }
  }

  function validateCurrentSection() {
    if (requestFormSection && requestFormSection.style.display !== "none") {
      return validateRequestForm()
    } else if (deliverySection && deliverySection.style.display !== "none") {
      return validateDeliveryForm()
    }
    return true
  }

  function validateRequestForm() {
    const requiredFields = requestFormSection.querySelectorAll("input[required], select[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      // Skip sponsor fields if not confirmation
      if (currentCertificateType !== "KUMPIL" && field.closest("#sponsorSection")) {
        return
      }

      // Skip other purpose field if not selected
      if (field.id === "otherPurpose" && purpose.value !== "OTHERS") {
        return
      }

      if (!field.value.trim()) {
        isValid = false
      }
    })

    // Check if "Others" is selected and otherPurpose is filled
    if (purpose.value === "OTHERS" && !otherPurpose.value.trim()) {
      isValid = false
    }

    return isValid
  }

  function validateDeliveryForm() {
    const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked')?.value
    let isValid = true

    if (deliveryOption === "delivery") {
      const deliveryFields = deliveryAddressSection.querySelectorAll("input[required], select[required]")
      deliveryFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false
        }
      })
    } else if (deliveryOption === "pickup") {
      const pickupFields = pickupSection.querySelectorAll("input[required], select[required]")
      pickupFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false
        }
      })
    }

    // Check terms acceptance
    if (!deliveryTermsCheckbox?.checked) {
      isValid = false
    }

    return isValid
  }

  // Navigation functions
  function goToStep1Review() {
    if (validateRequestForm()) {
      updateStep1Review()
      showSection(step1ReviewSection)
    } else {
      alert("Mangyaring punan ang lahat ng kinakailangang field nang tama.")
    }
  }

  function goBackToRequestForm() {
    showSection(requestFormSection)
  }

  function goToDeliverySection() {
    showSection(deliverySection)
  }

  function goBackToStep1Review() {
    showSection(step1ReviewSection)
  }

  function goToStep2Review() {
    if (validateDeliveryForm()) {
      updateStep2Review()
      showSection(step2ReviewSection)
    } else {
      alert("Mangyaring punan ang lahat ng kinakailangang detalye ng paghahatid at tanggapin ang mga tuntunin.")
    }
  }

  function goBackToDeliverySection() {
    showSection(deliverySection)
  }

  function goToSummary() {
    saveFormDataToLocalStorage()
    window.location.href = "summary.html"
  }

  function cancelRequest() {
    if (
      confirm(
        "Sigurado ba kayong gusto ninyong kanselahin ang kahilingang ito? Mawawala ang lahat ng naipasok na datos.",
      )
    ) {
      localStorage.removeItem("baptismRequestData")
      window.location.href = "dashboard.html"
    }
  }

  function showSection(section) {
    const sections = [requestFormSection, step1ReviewSection, deliverySection, step2ReviewSection]
    sections.forEach((s) => {
      if (s) s.style.display = "none"
    })

    if (section) section.style.display = "block"
    window.scrollTo(0, 0)
  }

  function updateStep1Review() {
    // Update certificate type
    const reviewCertificateType = document.getElementById("review-certificate-type")
    if (reviewCertificateType) {
      reviewCertificateType.textContent = currentCertificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"
    }

    // Update basic details
    updateElement("review-request-type", requestType?.value)
    updateElement("review-copies", numberOfCopies?.value)

    // Format and update name
    const formattedName = formatName(lastName?.value, firstName?.value, middleName?.value)
    updateElement("review-name", formattedName)

    // Update dates
    updateElement("review-dob", formatDate(dateOfBirth?.value))

    // Update sacrament date and label
    const reviewSacramentLabel = document.getElementById("review-sacrament-label")
    const reviewSacramentDate = document.getElementById("review-sacrament-date")
    if (reviewSacramentLabel && reviewSacramentDate) {
      reviewSacramentLabel.textContent = currentCertificateType === "KUMPIL" ? "Petsa ng Kumpil:" : "Petsa ng Binyag:"
      reviewSacramentDate.textContent = sacramentDate?.value ? formatDate(sacramentDate.value) : "Hindi nabanggit"
    }

    // Update place of birth
    const birthPlace = formatLocation(birthCity?.value, birthProvince?.value, birthCountry?.value)
    updateElement("review-pob", birthPlace)

    // Update sex
    const selectedSex = document.querySelector('input[name="sex"]:checked')
    updateElement("review-sex", selectedSex?.value === "Male" ? "LALAKI" : "BABAE")

    // Update parent information
    const fatherName = formatName(fatherLastName?.value, fatherFirstName?.value, fatherMiddleName?.value)
    const motherName = formatName(motherLastName?.value, motherFirstName?.value, motherMiddleName?.value)
    updateElement("review-father", fatherName || "Hindi nabanggit")
    updateElement("review-mother", motherName || "Hindi nabanggit")

    // Update sponsor information for confirmation
    const sponsorReviewSection = document.getElementById("sponsor-review-section")
    if (currentCertificateType === "KUMPIL") {
      if (sponsorReviewSection) {
        sponsorReviewSection.style.display = "block"
        const sponsorName = formatName(sponsorLastName?.value, sponsorFirstName?.value, sponsorMiddleName?.value)
        updateElement("review-sponsor", sponsorName)
      }
    } else {
      if (sponsorReviewSection) {
        sponsorReviewSection.style.display = "none"
      }
    }

    // Update request information
    updateElement("review-relationship", relationship?.value)

    // Handle purpose display
    let purposeText = purpose?.value
    if (purpose?.value === "OTHERS" && otherPurpose?.value) {
      purposeText = otherPurpose.value
    }
    updateElement("review-purpose", purposeText)

    updateElement("review-mobile", mobileNumber?.value)
    updateElement("review-email", emailAddress?.value)
  }

  function updateStep2Review() {
    // Update requester information
    const requesterName = formatName(lastName?.value, firstName?.value, middleName?.value)
    updateElement("final-review-name", requesterName)
    updateElement("final-review-mobile", mobileNumber?.value)
    updateElement("final-review-email", emailAddress?.value)

    // Update certificate details
    const finalReviewCertificateType = document.getElementById("final-review-certificate-type")
    if (finalReviewCertificateType) {
      finalReviewCertificateType.textContent = currentCertificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"
    }

    updateElement("final-review-request-type", requestType?.value)
    updateElement("final-review-copies", numberOfCopies?.value)
    updateElement("final-review-cert-name", requesterName)

    // Handle purpose display
    let purposeText = purpose?.value
    if (purpose?.value === "OTHERS" && otherPurpose?.value) {
      purposeText = otherPurpose.value
    }
    updateElement("final-review-purpose", purposeText)

    // Update sacrament date and label
    const finalReviewSacramentLabel = document.getElementById("final-review-sacrament-label")
    const finalReviewSacramentDate = document.getElementById("final-review-sacrament-date")
    if (finalReviewSacramentLabel && finalReviewSacramentDate) {
      finalReviewSacramentLabel.textContent =
        currentCertificateType === "KUMPIL" ? "Petsa ng Kumpil:" : "Petsa ng Binyag:"
      finalReviewSacramentDate.textContent = sacramentDate?.value ? formatDate(sacramentDate.value) : "Hindi nabanggit"
    }

    // Update delivery information
    const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked')?.value
    const finalReviewDeliveryMethod = document.getElementById("final-review-delivery-method")

    if (finalReviewDeliveryMethod) {
      finalReviewDeliveryMethod.textContent = deliveryOption === "pickup" ? "KUKUNIN SA PAROKYA" : "PAGHAHATID"
    }

    const finalReviewDeliveryAddress = document.getElementById("final-review-delivery-address")
    const finalReviewPickupInfo = document.getElementById("final-review-pickup-info")

    if (deliveryOption === "delivery") {
      if (finalReviewDeliveryAddress) finalReviewDeliveryAddress.style.display = "block"
      if (finalReviewPickupInfo) finalReviewPickupInfo.style.display = "none"

      // Format delivery address
      const finalReviewAddress = document.getElementById("final-review-address")
      if (finalReviewAddress) {
        const addressLine1 = document.getElementById("addressLine1")
        const addressLine2 = document.getElementById("addressLine2")
        const deliveryBarangay = document.getElementById("deliveryBarangay")
        const deliveryCity = document.getElementById("deliveryCity")
        const deliveryProvince = document.getElementById("deliveryProvince")
        const deliveryCountry = document.getElementById("deliveryCountry")
        const zipCode = document.getElementById("zipCode")

        let addressText = ""
        if (addressLine1?.value) addressText += addressLine1.value + "<br>"
        if (addressLine2?.value) addressText += addressLine2.value + "<br>"
        if (deliveryBarangay?.value) addressText += deliveryBarangay.value + ", "
        if (deliveryCity?.value) addressText += deliveryCity.value + "<br>"
        if (deliveryProvince?.value) addressText += deliveryProvince.value + ", "
        if (deliveryCountry?.value) addressText += deliveryCountry.value + " "
        if (zipCode?.value) addressText += zipCode.value

        finalReviewAddress.innerHTML = addressText
      }
    } else {
      if (finalReviewDeliveryAddress) finalReviewDeliveryAddress.style.display = "none"
      if (finalReviewPickupInfo) finalReviewPickupInfo.style.display = "block"

      // Update pickup information
      updateElement("final-review-pickup-date", formatDate(pickupDate?.value))
      updateElement("final-review-pickup-contact", pickupContactNumber?.value)
    }
  }

  function saveFormDataToLocalStorage() {
    const formData = {
      requestDetails: {
        certificateType: currentCertificateType,
        requestType: requestType?.value || "SERTIPIKASYON",
        numberOfCopies: numberOfCopies?.value || "1",
        lastName: lastName?.value || "",
        firstName: firstName?.value || "",
        middleName: middleName?.value || "",
        dateOfBirth: dateOfBirth?.value || "",
        birthCountry: birthCountry?.value || "",
        birthProvince: birthProvince?.value || "",
        birthCity: birthCity?.value || "",
        sacramentDate: sacramentDate?.value || "",
        sex: document.querySelector('input[name="sex"]:checked')?.value || "Male",
        fatherLastName: fatherLastName?.value || "",
        fatherFirstName: fatherFirstName?.value || "",
        fatherMiddleName: fatherMiddleName?.value || "",
        motherLastName: motherLastName?.value || "",
        motherFirstName: motherFirstName?.value || "",
        motherMiddleName: motherMiddleName?.value || "",
        relationship: relationship?.value || "",
        purpose: purpose?.value === "OTHERS" ? otherPurpose?.value || "" : purpose?.value || "",
      },
      deliveryDetails: {
        deliveryOption: document.querySelector('input[name="deliveryOption"]:checked')?.value || "delivery",
        termsAccepted: deliveryTermsCheckbox?.checked || false,
      },
      requesterEmail: emailAddress?.value || "",
      requesterMobile: mobileNumber?.value || "",
      requesterName: formatName(lastName?.value, firstName?.value, middleName?.value),
    }

    // Add sponsor information for confirmation
    if (currentCertificateType === "KUMPIL") {
      formData.requestDetails.sponsorLastName = sponsorLastName?.value || ""
      formData.requestDetails.sponsorFirstName = sponsorFirstName?.value || ""
      formData.requestDetails.sponsorMiddleName = sponsorMiddleName?.value || ""
    }

    // Add delivery-specific details
    if (formData.deliveryDetails.deliveryOption === "delivery") {
      formData.deliveryDetails.deliveryCountry = document.getElementById("deliveryCountry")?.value || ""
      formData.deliveryDetails.deliveryProvince = deliveryProvince?.value || ""
      formData.deliveryDetails.deliveryCity = deliveryCity?.value || ""
      formData.deliveryDetails.deliveryBarangay = deliveryBarangay?.value || ""
      formData.deliveryDetails.addressLine1 = document.getElementById("addressLine1")?.value || ""
      formData.deliveryDetails.addressLine2 = document.getElementById("addressLine2")?.value || ""
      formData.deliveryDetails.zipCode = document.getElementById("zipCode")?.value || ""
    } else {
      formData.deliveryDetails.pickupDate = pickupDate?.value || ""
      formData.deliveryDetails.pickupContactNumber = pickupContactNumber?.value || ""
    }

    localStorage.setItem("baptismRequestData", JSON.stringify(formData))
  }

  function checkReturnNavigation() {
    const baptismRequestData = JSON.parse(localStorage.getItem("baptismRequestData") || "{}")

    if (baptismRequestData.currentStep) {
      switch (baptismRequestData.currentStep) {
        case "step1":
          showSection(requestFormSection)
          break
        case "delivery":
          showSection(deliverySection)
          break
        case "step2-review":
          showSection(step2ReviewSection)
          break
        default:
          showSection(requestFormSection)
      }

      // Clear the current step
      baptismRequestData.currentStep = ""
      localStorage.setItem("baptismRequestData", JSON.stringify(baptismRequestData))
    }

    // Load existing data if available
    if (baptismRequestData.requestDetails) {
      loadFormData(baptismRequestData)
    }
  }

  function loadFormData(data) {
    const details = data.requestDetails

    // Load certificate type FIRST and trigger change
    if (details.certificateType) {
      currentCertificateType = details.certificateType
      if (certificateTypeSelect) {
        certificateTypeSelect.value = details.certificateType
      }
      handleCertificateTypeChange()
    }

    // Load basic details
    if (requestType && details.requestType) requestType.value = details.requestType
    if (numberOfCopies && details.numberOfCopies) numberOfCopies.value = details.numberOfCopies
    if (lastName && details.lastName) lastName.value = details.lastName
    if (firstName && details.firstName) firstName.value = details.firstName
    if (middleName && details.middleName) middleName.value = details.middleName
    if (dateOfBirth && details.dateOfBirth) dateOfBirth.value = details.dateOfBirth
    if (sacramentDate && details.sacramentDate) sacramentDate.value = details.sacramentDate
    if (birthCountry && details.birthCountry) birthCountry.value = details.birthCountry
    if (birthProvince && details.birthProvince) birthProvince.value = details.birthProvince
    if (birthCity && details.birthCity) birthCity.value = details.birthCity

    // Load sex selection
    if (details.sex) {
      const sexRadio = document.querySelector(`input[name="sex"][value="${details.sex}"]`)
      if (sexRadio) sexRadio.checked = true
    }

    // Load parent information
    if (fatherLastName && details.fatherLastName) fatherLastName.value = details.fatherLastName
    if (fatherFirstName && details.fatherFirstName) fatherFirstName.value = details.fatherFirstName
    if (fatherMiddleName && details.fatherMiddleName) fatherMiddleName.value = details.fatherMiddleName
    if (motherLastName && details.motherLastName) motherLastName.value = details.motherLastName
    if (motherFirstName && details.motherFirstName) motherFirstName.value = details.motherFirstName
    if (motherMiddleName && details.motherMiddleName) motherMiddleName.value = details.motherMiddleName

    // Load sponsor information for confirmation
    if (details.certificateType === "KUMPIL") {
      if (sponsorLastName && details.sponsorLastName) sponsorLastName.value = details.sponsorLastName
      if (sponsorFirstName && details.sponsorFirstName) sponsorFirstName.value = details.sponsorFirstName
      if (sponsorMiddleName && details.sponsorMiddleName) sponsorMiddleName.value = details.sponsorMiddleName
    }

    // Load request information
    if (relationship && details.relationship) relationship.value = details.relationship
    if (purpose && details.purpose) {
      // Check if it's a predefined purpose or "others"
      const purposeOptions = Array.from(purpose.options).map((option) => option.value)
      if (purposeOptions.includes(details.purpose)) {
        purpose.value = details.purpose
      } else {
        purpose.value = "OTHERS"
        otherPurposeRow.style.display = "block"
        otherPurpose.required = true
        otherPurpose.value = details.purpose
      }
    }

    // Load contact information
    if (mobileNumber && data.requesterMobile) mobileNumber.value = data.requesterMobile
    if (emailAddress && data.requesterEmail) emailAddress.value = data.requesterEmail
  }

  // Utility functions
  function updateElement(id, value) {
    const element = document.getElementById(id)
    if (element && value) {
      element.textContent = value
    }
  }

  function formatName(lastName, firstName, middleName) {
    if (!lastName || !firstName) return ""
    const middle = middleName ? ` ${middleName.toUpperCase()}` : ""
    return `${lastName.toUpperCase()}, ${firstName.toUpperCase()}${middle}`
  }

  function formatLocation(city, province, country) {
    const parts = [city, province, country].filter(Boolean)
    return parts.join(", ")
  }

  function formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const options = { year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("tl-PH", options).toUpperCase()
  }
})
