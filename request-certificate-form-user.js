// Enhanced Multi-Request Certificate Form Handler with Flash Messaging
document.addEventListener("DOMContentLoaded", () => {
  // State Management
  const FormState = {
    allRequests: [],
    currentRequestIndex: 0,
    currentStep: 1,
    unifiedDeliveryDetails: null,

    // Form sections
    sections: {
      requestForm: document.getElementById("request-form-section"),
      requestsReview: document.getElementById("requests-review-section"),
      step1Review: document.getElementById("step1-review-section"),
      delivery: document.getElementById("delivery-section"),
      step2Review: document.getElementById("step2-review-section"),
    },

    // Navigation buttons
    buttons: {
      next: document.getElementById("next-btn"),
      saveAndAdd: document.getElementById("save-and-add-btn"),
      addAnother: document.getElementById("add-another-btn"),
      addMoreRequests: document.getElementById("add-more-requests-btn"),
      backToForm: document.getElementById("back-to-form-btn"),
      proceedToDelivery: document.getElementById("proceed-to-delivery-btn"),
      editStep1: document.getElementById("edit-step1-btn"),
      confirmStep1: document.getElementById("confirm-step1-btn"),
      backToStep1Review: document.getElementById("back-to-step1-review-btn"),
      toStep2Review: document.getElementById("to-step2-review-btn"),
      backToDelivery: document.getElementById("back-to-delivery-btn"),
      confirm: document.getElementById("confirm-btn"),
      cancelRequest: document.getElementById("cancel-request-btn"),
    },

    // Form fields
    fields: {
      certificateType: document.getElementById("certificateTypeSelect"),
      lastName: document.getElementById("lastName"),
      firstName: document.getElementById("firstName"),
      middleName: document.getElementById("middleName"),
      dateOfBirth: document.getElementById("dateOfBirth"),
      sacramentDate: document.getElementById("sacramentDate"),
      fatherLastName: document.getElementById("fatherLastName"),
      fatherFirstName: document.getElementById("fatherFirstName"),
      fatherMiddleName: document.getElementById("fatherMiddleName"),
      motherLastName: document.getElementById("motherLastName"),
      motherFirstName: document.getElementById("motherFirstName"),
      motherMiddleName: document.getElementById("motherMiddleName"),
      sponsorLastName: document.getElementById("sponsorLastName"),
      sponsorFirstName: document.getElementById("sponsorFirstName"),
      sponsorMiddleName: document.getElementById("sponsorMiddleName"),
      relationship: document.getElementById("relationship"),
      purpose: document.getElementById("purpose"),
      otherPurpose: document.getElementById("otherPurpose"),
      mobileNumber: document.getElementById("mobileNumber"),
      emailAddress: document.getElementById("emailAddress"),
    },
  }

  // Get form sections
  const requestFormSection = document.getElementById("request-form-section")
  const step1ReviewSection = document.getElementById("step1-review-section")
  const deliverySection = document.getElementById("delivery-section")
  const step2ReviewSection = document.getElementById("step2-review-section")

  // Get navigation buttons
  const nextBtn = document.getElementById("next-btn")
  const editStep1Btn = document.getElementById("edit-step1-btn")
  const confirmStep1Btn = document.getElementById("confirm-step1-btn")
  const backToStep1ReviewBtn = document.getElementById("back-to-step1-review-btn")
  const toStep2ReviewBtn = document.getElementById("to-step2-review-btn")
  const backToDeliveryBtn = document.getElementById("back-to-delivery-btn")
  const confirmBtn = document.getElementById("confirm-btn")
  const cancelRequestBtn = document.getElementById("cancel-request-btn")

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

  // Multiple requests management
  let currentRequestId = null
  let currentCertificateType = null
  let allRequests = []

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
    loadExistingRequests()
    setupEventListeners()
    setupFormValidation()
    setupUppercaseInputs()
    setupLocationDropdowns()
    setupDeliveryPickupToggle()
    setupDateConstraints()
    setupPurposeHandling()
    updateRequestsCounter()
    showSection(FormState.sections.requestForm)
  }

  function loadExistingRequests() {
    const storedRequests = localStorage.getItem("allCertificateRequests")
    if (storedRequests) {
      try {
        FormState.allRequests = JSON.parse(storedRequests)
      } catch (error) {
        console.error("Error loading requests:", error)
        FormState.allRequests = []
      }
    }
  }

  /**
   * Load all existing requests from localStorage
   */
  function loadAllRequests() {
    const storedRequests = localStorage.getItem("allCertificateRequests")
    if (storedRequests) {
      try {
        allRequests = JSON.parse(storedRequests)
      } catch (error) {
        console.error("Error loading requests:", error)
        allRequests = []
      }
    } else {
      allRequests = []
    }
  }

  /**
   * Save all requests to localStorage
   */
  function saveAllRequests() {
    try {
      localStorage.setItem("allCertificateRequests", JSON.stringify(allRequests))
    } catch (error) {
      console.error("Error saving requests:", error)
      alert("Error saving requests. Please try again.")
    }
  }

  /**
   * Generate unique request ID
   */
  function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Initialize current request (new or existing)
   */
  function initializeCurrentRequest() {
    // Check if editing existing request
    const editingRequestId = sessionStorage.getItem("editingRequestId")

    if (editingRequestId) {
      // Load existing request for editing
      const existingRequest = allRequests.find((req) => req.id === editingRequestId)
      if (existingRequest) {
        currentRequestId = editingRequestId
        loadFormData(existingRequest.data)
        sessionStorage.removeItem("editingRequestId")
        return
      }
    }

    // Check for legacy single request data and migrate
    const legacyData = localStorage.getItem("baptismRequestData")
    if (legacyData && !editingRequestId) {
      try {
        const parsedLegacyData = JSON.parse(legacyData)
        if (parsedLegacyData.requestDetails) {
          // Migrate legacy data to new format
          currentRequestId = generateRequestId()
          const migratedRequest = {
            id: currentRequestId,
            data: parsedLegacyData,
            createdAt: new Date().toISOString(),
            status: "draft",
          }
          allRequests.push(migratedRequest)
          saveAllRequests()
          localStorage.removeItem("baptismRequestData") // Clean up legacy data
          loadFormData(parsedLegacyData)
          return
        }
      } catch (error) {
        console.error("Error migrating legacy data:", error)
      }
    }

    // Create new request
    currentRequestId = generateRequestId()
    initializeCertificateType()
  }

  /**
   * Update request counter display
   */
  function updateRequestCounter() {
    // Add request counter to the form header
    const formContainer = document.querySelector(".form-container")
    if (formContainer) {
      let counterElement = document.getElementById("request-counter")
      if (!counterElement) {
        counterElement = document.createElement("div")
        counterElement.id = "request-counter"
        counterElement.style.cssText = `
          background-color: #e3f2fd;
          padding: 10px 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #1976d2;
          border-left: 4px solid #2196f3;
        `
        const h2 = formContainer.querySelector("h2")
        if (h2) {
          h2.insertAdjacentElement("afterend", counterElement)
        }
      }

      const totalRequests = allRequests.length
      const currentIndex = allRequests.findIndex((req) => req.id === currentRequestId) + 1

      if (totalRequests > 0) {
        counterElement.innerHTML = `
          <i class="fas fa-list"></i> 
          Kasalukuyang Kahilingan: ${currentIndex} ng ${totalRequests}
          <br>
          <span style="font-style: italic; font-size: 0.9em; color: #555;">
            Current Request: ${currentIndex} of ${totalRequests}
          </span>
        `
      } else {
        counterElement.innerHTML = `
          <i class="fas fa-plus"></i> 
          Bagong Kahilingan
          <br>
          <span style="font-style: italic; font-size: 0.9em; color: #555;">
            New Request
          </span>
        `
      }
    }
  }

  function initializeCertificateType() {
    // Check current request data first
    const currentRequest = allRequests.find((req) => req.id === currentRequestId)

    if (currentRequest?.data?.requestDetails?.certificateType) {
      currentCertificateType = currentRequest.data.requestDetails.certificateType
      if (certificateTypeSelect) {
        certificateTypeSelect.value = currentCertificateType
      }
    } else if (certificateTypeSelect && certificateTypeSelect.value && certificateTypeSelect.value !== "") {
      currentCertificateType = certificateTypeSelect.value
    } else {
      // Set to null/empty to show placeholder
      currentCertificateType = null
      if (certificateTypeSelect) {
        certificateTypeSelect.value = ""
      }
    }
  }

  function setupEventListeners() {
    // Navigation buttons
    FormState.buttons.next?.addEventListener("click", handleNextStep)
    FormState.buttons.saveAndAdd?.addEventListener("click", saveAndAddAnother)
    FormState.buttons.addAnother?.addEventListener("click", addAnotherRequest)
    FormState.buttons.addMoreRequests?.addEventListener("click", addMoreRequests)
    FormState.buttons.backToForm?.addEventListener("click", () => showSection(FormState.sections.requestForm))
    FormState.buttons.proceedToDelivery?.addEventListener("click", proceedToDelivery)
    FormState.buttons.editStep1?.addEventListener("click", () => showSection(FormState.sections.requestForm))
    FormState.buttons.confirmStep1?.addEventListener("click", () => showSection(FormState.sections.delivery))
    FormState.buttons.backToStep1Review?.addEventListener("click", () => showSection(FormState.sections.step1Review))
    FormState.buttons.toStep2Review?.addEventListener("click", proceedToStep2Review)
    FormState.buttons.backToDelivery?.addEventListener("click", () => showSection(FormState.sections.delivery))
    FormState.buttons.confirm?.addEventListener("click", confirmAllRequests)
    FormState.buttons.cancelRequest?.addEventListener("click", cancelAllRequests)

    // Form field listeners
    document.addEventListener("input", handleFormInput)
    document.addEventListener("change", handleFormChange)

    // Certificate type change
    FormState.fields.certificateType?.addEventListener("change", handleCertificateTypeChange)

    // Purpose dropdown
    FormState.fields.purpose?.addEventListener("change", handlePurposeChange)

    // Certificate type change
    if (certificateTypeSelect) {
      certificateTypeSelect.addEventListener("change", handleCertificateTypeChange)
    }

    // Navigation buttons
    if (nextBtn) nextBtn.addEventListener("click", goToStep1Review)
    if (editStep1Btn) editStep1Btn.addEventListener("click", goBackToRequestForm)
    if (confirmStep1Btn) confirmStep1Btn.addEventListener("click", goToDeliverySection)
    if (backToStep1ReviewBtn) backToStep1ReviewBtn.addEventListener("click", goBackToStep1Review)
    if (toStep2ReviewBtn) toStep2ReviewBtn.addEventListener("click", goToStep2Review)
    if (backToDeliveryBtn) backToDeliveryBtn.addEventListener("click", goBackToDeliverySection)
    if (confirmBtn) confirmBtn.addEventListener("click", goToSummary)
    if (cancelRequestBtn) cancelRequestBtn.addEventListener("click", cancelRequest)

    // Real-time validation and auto-save
    document.addEventListener("input", handleInputChange)
    document.addEventListener("change", handleInputChange)

    // Add "Add New Request" button to form actions
    addNewRequestButton()
  }

  function setupFormValidation() {
    const requiredFields = document.querySelectorAll("input[required], select[required]")

    requiredFields.forEach((field) => {
      field.addEventListener("blur", validateField)
      field.addEventListener("input", clearFieldError)
    })
  }

  /**
   * Add "Add New Request" button to form actions
   */
  function addNewRequestButton() {
    const formActions = document.querySelector(".form-actions")
    if (formActions && !document.getElementById("add-new-request-form-btn")) {
      const addNewBtn = document.createElement("button")
      addNewBtn.id = "add-new-request-form-btn"
      addNewBtn.className = "btn add-request-btn"
      addNewBtn.type = "button"
      addNewBtn.innerHTML = `
        <i class="fas fa-plus"></i> MAGDAGDAG NG BAGONG KAHILINGAN
      `
      addNewBtn.style.cssText = `
        background-color: #27ae60;
        color: white;
        margin-right: auto;
      `

      addNewBtn.addEventListener("click", () => {
        if (confirm("Magsisimula ito ng bagong kahilingan. Ang kasalukuyang progress ay ma-save. Magpatuloy?")) {
          // Save current progress if form has data
          if (hasFormData()) {
            saveCurrentRequestProgress()
          }

          // Create new request
          currentRequestId = generateRequestId()
          clearForm()
          updateRequestCounter()
          showSection(requestFormSection)
        }
      })

      // Insert at the beginning of form actions
      formActions.insertBefore(addNewBtn, formActions.firstChild)
    }
  }

  /**
   * Check if form has any data
   */
  function hasFormData() {
    return (
      certificateTypeSelect?.value || lastName?.value || firstName?.value || mobileNumber?.value || emailAddress?.value
    )
  }

  /**
   * Save current request progress
   */
  function saveCurrentRequestProgress() {
    if (!currentRequestId) return

    const formData = collectFormData()
    const existingRequestIndex = allRequests.findIndex((req) => req.id === currentRequestId)

    const requestData = {
      id: currentRequestId,
      data: formData,
      createdAt: existingRequestIndex >= 0 ? allRequests[existingRequestIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
    }

    if (existingRequestIndex >= 0) {
      allRequests[existingRequestIndex] = requestData
    } else {
      allRequests.push(requestData)
    }

    saveAllRequests()
  }

  /**
   * Clear form data
   */
  function clearForm() {
    // Reset form fields
    if (certificateTypeSelect) certificateTypeSelect.value = ""
    if (lastName) lastName.value = ""
    if (firstName) firstName.value = ""
    if (middleName) middleName.value = ""
    if (dateOfBirth) dateOfBirth.value = ""
    if (sacramentDate) sacramentDate.value = ""
    if (mobileNumber) mobileNumber.value = ""
    if (emailAddress) emailAddress.value = ""

    // Reset other fields
    const allInputs = document.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select',
    )
    allInputs.forEach((input) => {
      if (!input.disabled && !input.readOnly) {
        input.value = ""
      }
    })

    // Reset radio buttons
    const maleRadio = document.querySelector('input[name="sex"][value="Male"]')
    if (maleRadio) maleRadio.checked = true

    // Reset delivery option
    if (deliveryRadio) deliveryRadio.checked = true
    if (deliveryTermsCheckbox) deliveryTermsCheckbox.checked = false

    // Hide conditional sections
    if (sponsorSection) sponsorSection.style.display = "none"
    if (otherPurposeRow) otherPurposeRow.style.display = "none"

    currentCertificateType = null
  }

  /**
   * Collect current form data
   */
  function collectFormData() {
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

    return formData
  }

  function setupUppercaseInputs() {
    const textInputs = document.querySelectorAll('input[type="text"]')
    textInputs.forEach((input) => {
      if (input.id !== "emailAddress") {
        input.addEventListener("input", function () {
          this.value = this.value.toUpperCase()
        })
      }
    })
  }

  function setupLocationDropdowns() {
    const cityData = {
      BATANGAS: ["TANAUAN CITY", "LIPA CITY", "BATANGAS CITY", "STO. TOMAS", "TAAL"],
      CAVITE: ["BACOOR", "DASMARIÑAS", "IMUS", "GENERAL TRIAS", "TRECE MARTIRES"],
      LAGUNA: ["SAN PABLO CITY", "SANTA ROSA CITY", "CALAMBA CITY", "BIÑAN", "SAN PEDRO"],
      RIZAL: ["ANTIPOLO CITY", "CAINTA", "TAYTAY", "ANGONO", "BINANGONAN"],
      "METRO MANILA": ["MANILA", "QUEZON CITY", "MAKATI", "TAGUIG", "PASIG"],
    }

    const barangayData = {
      "TANAUAN CITY": ["BARANGAY 1", "BARANGAY 2", "BARANGAY 3", "BARANGAY 4", "BARANGAY 5"],
      MANILA: ["TONDO", "BINONDO", "QUIAPO", "SAN NICOLAS", "SANTA CRUZ"],
    }

    // Birth place dropdowns
    const birthProvince = document.getElementById("birthProvince")
    const birthCity = document.getElementById("birthCity")

    if (birthProvince && birthCity) {
      birthProvince.addEventListener("change", function () {
        populateCityDropdown(this.value, birthCity, cityData)
      })
    }

    // Delivery address dropdowns
    const deliveryProvince = document.getElementById("deliveryProvince")
    const deliveryCity = document.getElementById("deliveryCity")
    const deliveryBarangay = document.getElementById("deliveryBarangay")

    if (deliveryProvince && deliveryCity) {
      deliveryProvince.addEventListener("change", function () {
        populateCityDropdown(this.value, deliveryCity, cityData)
      })
    }

    if (deliveryCity && deliveryBarangay) {
      deliveryCity.addEventListener("change", function () {
        populateBarangayDropdown(this.value, deliveryBarangay, barangayData)
      })
    }

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

  function populateCityDropdown(province, cityDropdown, cityData) {
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

  function populateBarangayDropdown(city, barangayDropdown, barangayData) {
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
    const deliveryRadio = document.getElementById("deliveryRadio")
    const pickupRadio = document.getElementById("pickupRadio")
    const deliveryAddressSection = document.getElementById("deliveryAddressSection")
    const pickupSection = document.getElementById("pickupSection")
    const deliveryText = document.getElementById("deliveryText")
    const pickupText = document.getElementById("pickupText")

    if (deliveryRadio && pickupRadio) {
      deliveryRadio.addEventListener("change", function () {
        if (this.checked) {
          if (deliveryAddressSection) deliveryAddressSection.style.display = "block"
          if (pickupSection) pickupSection.style.display = "none"
          if (deliveryText) deliveryText.style.display = "block"
          if (pickupText) pickupText.style.display = "none"
        }
      })

      pickupRadio.addEventListener("change", function () {
        if (this.checked) {
          if (deliveryAddressSection) deliveryAddressSection.style.display = "none"
          if (pickupSection) pickupSection.style.display = "block"
          if (deliveryText) deliveryText.style.display = "none"
          if (pickupText) pickupText.style.display = "block"
        }
      })
    }

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

  function setupDateConstraints() {
    const pickupDate = document.getElementById("pickupDate")
    const dateOfBirth = document.getElementById("dateOfBirth")

    if (pickupDate) {
      const today = new Date().toISOString().split("T")[0]
      pickupDate.min = today
    }

    if (dateOfBirth) {
      const today = new Date().toISOString().split("T")[0]
      dateOfBirth.max = today
    }

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
    const otherPurposeRow = document.getElementById("otherPurposeRow")

    if (FormState.fields.purpose) {
      FormState.fields.purpose.addEventListener("change", handlePurposeChange)
    }

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

    // Don't proceed if no certificate type is selected
    if (!currentCertificateType || currentCertificateType === "") {
      return
    }

    // Update form fields based on certificate type
    updateFormForCertificateType(currentCertificateType)

    // Update progress labels
    updateProgressLabels(currentCertificateType)

    // Update delivery/pickup text
    updateDeliveryText()
    updatePickupText()

    // Auto-save progress
    if (hasFormData()) {
      saveCurrentRequestProgress()
    }
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

    // Auto-save progress on significant changes
    if (hasFormData()) {
      // Debounce auto-save
      clearTimeout(window.autoSaveTimeout)
      window.autoSaveTimeout = setTimeout(() => {
        saveCurrentRequestProgress()
      }, 1000)
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
      // Save progress before proceeding
      saveCurrentRequestProgress()
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
    // Save progress before proceeding
    saveCurrentRequestProgress()
    showSection(deliverySection)
  }

  function goBackToStep1Review() {
    showSection(step1ReviewSection)
  }

  function goToStep2Review() {
    if (validateDeliveryForm()) {
      // Save progress before proceeding
      saveCurrentRequestProgress()
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
    // Save final request data
    saveCurrentRequestProgress()

    // Mark request as completed
    const requestIndex = allRequests.findIndex((req) => req.id === currentRequestId)
    if (requestIndex >= 0) {
      allRequests[requestIndex].status = "completed"
      saveAllRequests()
    }

    // Set current request for summary page
    sessionStorage.setItem("currentRequestId", currentRequestId)
    window.location.href = "summary-request-certificate-user.html"
  }

  function cancelRequest() {
    if (
      confirm(
        "Sigurado ba kayong gusto ninyong kanselahin ang kahilingang ito? Mawawala ang lahat ng naipasok na datos.",
      )
    ) {
      // Remove current request from allRequests
      allRequests = allRequests.filter((req) => req.id !== currentRequestId)
      saveAllRequests()

      // Clear legacy data
      localStorage.removeItem("baptismRequestData")

      window.location.href = "dashboard-user.html"
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

  function checkReturnNavigation() {
    // Check if editing a specific request
    const editingRequestId = sessionStorage.getItem("editingRequestId")
    if (editingRequestId) {
      const requestToEdit = allRequests.find((req) => req.id === editingRequestId)
      if (requestToEdit) {
        currentRequestId = editingRequestId
        loadFormData(requestToEdit.data)
        sessionStorage.removeItem("editingRequestId")
        return
      }
    }

    // Check for navigation step
    const currentStep = sessionStorage.getItem("currentFormStep")
    if (currentStep) {
      switch (currentStep) {
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
      sessionStorage.removeItem("currentFormStep")
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

    // Load delivery details
    if (data.deliveryDetails) {
      const deliveryOption = data.deliveryDetails.deliveryOption
      if (deliveryOption === "pickup") {
        if (pickupRadio) pickupRadio.checked = true
        showPickupSection()
        if (pickupDate && data.deliveryDetails.pickupDate) pickupDate.value = data.deliveryDetails.pickupDate
        if (pickupContactNumber && data.deliveryDetails.pickupContactNumber)
          pickupContactNumber.value = data.deliveryDetails.pickupContactNumber
      } else {
        if (deliveryRadio) deliveryRadio.checked = true
        showDeliverySection()
        // Load delivery address fields
        const addressLine1 = document.getElementById("addressLine1")
        const addressLine2 = document.getElementById("addressLine2")
        const zipCode = document.getElementById("zipCode")

        if (addressLine1 && data.deliveryDetails.addressLine1) addressLine1.value = data.deliveryDetails.addressLine1
        if (addressLine2 && data.deliveryDetails.addressLine2) addressLine2.value = data.deliveryDetails.addressLine2
        if (deliveryProvince && data.deliveryDetails.deliveryProvince)
          deliveryProvince.value = data.deliveryDetails.deliveryProvince
        if (deliveryCity && data.deliveryDetails.deliveryCity) deliveryCity.value = data.deliveryDetails.deliveryCity
        if (deliveryBarangay && data.deliveryDetails.deliveryBarangay)
          deliveryBarangay.value = data.deliveryDetails.deliveryBarangay
        if (zipCode && data.deliveryDetails.zipCode) zipCode.value = data.deliveryDetails.zipCode
      }

      if (deliveryTermsCheckbox && data.deliveryDetails.termsAccepted)
        deliveryTermsCheckbox.checked = data.deliveryDetails.termsAccepted
    }

    // Update request counter
    updateRequestCounter()
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

  // Expose functions for external use
  window.certificateFormManager = {
    getAllRequests: () => allRequests,
    getCurrentRequestId: () => currentRequestId,
    saveCurrentProgress: saveCurrentRequestProgress,
    loadAllRequests: loadAllRequests,
  }
})
