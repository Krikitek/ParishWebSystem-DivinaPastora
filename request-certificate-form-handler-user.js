// Enhanced Multi-Request Certificate Form Handler
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
      unifiedDelivery: document.getElementById("unified-delivery-section"),
      finalSummary: document.getElementById("final-summary-section"),
    },

    // Navigation buttons
    buttons: {
      saveAndContinue: document.getElementById("save-and-continue-btn"),
      addAnother: document.getElementById("add-another-btn"),
      addNewRequest: document.getElementById("add-new-request-btn"),
      addMoreRequests: document.getElementById("add-more-requests-btn"),
      backToForm: document.getElementById("back-to-form-btn"),
      proceedToDelivery: document.getElementById("proceed-to-delivery-btn"),
      backToReview: document.getElementById("back-to-review-btn"),
      proceedToSummary: document.getElementById("proceed-to-summary-btn"),
      backToDeliveryFinal: document.getElementById("back-to-delivery-final-btn"),
      confirmAllRequests: document.getElementById("confirm-all-requests-btn"),
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
      birthCountry: document.getElementById("birthCountry"),
      birthProvince: document.getElementById("birthProvince"),
      birthCity: document.getElementById("birthCity"),
      fatherLastName: document.getElementById("fatherLastName"),
      fatherFirstName: document.getElementById("fatherFirstName"),
      fatherMiddleName: document.getElementById("fatherMiddleName"),
      motherLastName: document.getElementById("motherLastName"),
      motherFirstName: document.getElementById("motherFirstName"),
      motherMiddleName: document.getElementById("motherMiddleName"),
      relationship: document.getElementById("relationship"),
      purpose: document.getElementById("purpose"),
      otherPurpose: document.getElementById("otherPurpose"),
      mobileNumber: document.getElementById("mobileNumber"),
      emailAddress: document.getElementById("emailAddress"),
    },
  }

  // Initialize the form
  init()

  function init() {
    loadExistingRequests()
    setupEventListeners()
    setupUppercaseInputs()
    setupLocationDropdowns()
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

  function setupEventListeners() {
    // Navigation buttons
    FormState.buttons.saveAndContinue?.addEventListener("click", saveCurrentRequestAndContinue)
    FormState.buttons.addAnother?.addEventListener("click", addAnotherRequest)
    FormState.buttons.addNewRequest?.addEventListener("click", addNewRequest)
    FormState.buttons.addMoreRequests?.addEventListener("click", addMoreRequests)
    FormState.buttons.backToForm?.addEventListener("click", () => showSection(FormState.sections.requestForm))
    FormState.buttons.proceedToDelivery?.addEventListener("click", proceedToDelivery)
    FormState.buttons.backToReview?.addEventListener("click", () => showSection(FormState.sections.requestsReview))
    FormState.buttons.proceedToSummary?.addEventListener("click", proceedToSummary)
    FormState.buttons.backToDeliveryFinal?.addEventListener("click", () =>
      showSection(FormState.sections.unifiedDelivery),
    )
    FormState.buttons.confirmAllRequests?.addEventListener("click", confirmAllRequests)
    FormState.buttons.cancelRequest?.addEventListener("click", cancelAllRequests)

    // Form field listeners
    document.addEventListener("input", handleFormInput)
    document.addEventListener("change", handleFormChange)

    // Delivery option listeners
    const deliveryRadio = document.getElementById("unifiedDeliveryRadio")
    const pickupRadio = document.getElementById("unifiedPickupRadio")

    deliveryRadio?.addEventListener("change", toggleDeliveryOptions)
    pickupRadio?.addEventListener("change", toggleDeliveryOptions)

    // Purpose dropdown
    FormState.fields.purpose?.addEventListener("change", handlePurposeChange)

    // Certificate type change
    FormState.fields.certificateType?.addEventListener("change", handleCertificateTypeChange)
  }

  function setupUppercaseInputs() {
    // Get all text inputs except email
    const textInputs = document.querySelectorAll('input[type="text"]')
    textInputs.forEach((input) => {
      if (input.id !== "emailAddress") {
        input.addEventListener("input", function () {
          this.value = this.value.toUpperCase()
        })
      }
    })

    // Also handle select dropdowns for location fields to ensure uppercase
    const locationSelects = ["birthCountry", "birthProvince", "birthCity"]

    locationSelects.forEach((selectId) => {
      const select = document.getElementById(selectId)
      if (select) {
        select.addEventListener("change", function () {
          // Ensure the selected value is uppercase
          if (this.value) {
            this.value = this.value.toUpperCase()
          }
        })
      }
    })
  }

  function setupLocationDropdowns() {
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

    // Birth place dropdowns
    const birthProvince = FormState.fields.birthProvince
    const birthCity = FormState.fields.birthCity

    if (birthProvince && birthCity) {
      birthProvince.addEventListener("change", function () {
        populateCityDropdown(this.value, birthCity, cityData)
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

  function handleFormInput(e) {
    // Auto-uppercase for text inputs (except email)
    if (e.target.type === "text" && e.target.id !== "emailAddress") {
      e.target.value = e.target.value.toUpperCase()
    }
  }

  function handleFormChange(e) {
    // Handle any form changes
  }

  function handlePurposeChange() {
    const otherPurposeRow = document.getElementById("otherPurposeRow")
    const otherPurpose = document.getElementById("otherPurpose")

    if (FormState.fields.purpose.value === "OTHERS") {
      otherPurposeRow.style.display = "block"
      otherPurpose.required = true
    } else {
      otherPurposeRow.style.display = "none"
      otherPurpose.required = false
      otherPurpose.value = ""
    }
  }

  function handleCertificateTypeChange() {
    const sacramentDateLabel = document.getElementById("sacramentDateLabel")
    const certificateType = FormState.fields.certificateType.value

    if (certificateType === "KUMPIL") {
      sacramentDateLabel.innerHTML = `
        Petsa ng Kumpil
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Date of Confirmation
        </span>
      `
    } else {
      sacramentDateLabel.innerHTML = `
        Petsa ng Binyag
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Date of Baptism
        </span>
      `
    }
  }

  function collectCurrentRequestData() {
    const purposeValue =
      FormState.fields.purpose?.value === "OTHERS"
        ? document.getElementById("otherPurpose")?.value
        : FormState.fields.purpose?.value

    // Collect father's name
    const fatherName = [
      FormState.fields.fatherLastName?.value,
      FormState.fields.fatherFirstName?.value,
      FormState.fields.fatherMiddleName?.value,
    ]
      .filter((name) => name && name.trim())
      .join(", ")

    // Collect mother's name
    const motherName = [
      FormState.fields.motherLastName?.value,
      FormState.fields.motherFirstName?.value,
      FormState.fields.motherMiddleName?.value,
    ]
      .filter((name) => name && name.trim())
      .join(", ")

    return {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      certificateType: FormState.fields.certificateType?.value || "",
      lastName: FormState.fields.lastName?.value || "",
      firstName: FormState.fields.firstName?.value || "",
      middleName: FormState.fields.middleName?.value || "",
      dateOfBirth: FormState.fields.dateOfBirth?.value || "",
      sacramentDate: FormState.fields.sacramentDate?.value || "",
      birthCountry: FormState.fields.birthCountry?.value || "",
      birthProvince: FormState.fields.birthProvince?.value || "",
      birthCity: FormState.fields.birthCity?.value || "",
      sex: document.querySelector('input[name="sex"]:checked')?.value || "Male",
      fatherName: fatherName || "",
      motherName: motherName || "",
      relationship: FormState.fields.relationship?.value || "",
      purpose: purposeValue || "",
      mobileNumber: FormState.fields.mobileNumber?.value || "",
      emailAddress: FormState.fields.emailAddress?.value || "",
      createdAt: new Date().toISOString(),
    }
  }

  function saveCurrentRequestAndContinue() {
    if (!window.validateRequestForm()) {
      alert("Mangyaring punan ang lahat ng kinakailangang field nang tama.")
      return
    }

    const requestData = collectCurrentRequestData()

    // If editing existing request
    if (FormState.currentRequestIndex < FormState.allRequests.length) {
      FormState.allRequests[FormState.currentRequestIndex] = requestData
    } else {
      FormState.allRequests.push(requestData)
    }

    saveAllRequests()
    updateRequestsReviewTable()
    showFlashMessage("Matagumpay na nai-save ang kahilingan!")
    FormState.currentStep = 2
    showSection(FormState.sections.requestsReview)
  }

  function addAnotherRequest() {
    if (!window.validateRequestForm()) {
      alert("Mangyaring punan muna ang kasalukuyang form bago magdagdag ng bago.")
      return
    }

    const requestData = collectCurrentRequestData()

    // If editing existing request
    if (FormState.currentRequestIndex < FormState.allRequests.length) {
      FormState.allRequests[FormState.currentRequestIndex] = requestData
    } else {
      FormState.allRequests.push(requestData)
    }

    saveAllRequests()
    clearForm()
    FormState.currentRequestIndex = FormState.allRequests.length
    updateRequestsCounter()
    showFlashMessage("Naidagdag na ang kahilingan! Maaari na kayong magdagdag pa.")
  }

  function addNewRequest() {
    if (confirm("Magsisimula ito ng bagong kahilingan. Ang kasalukuyang progress ay ma-save. Magpatuloy?")) {
      // Save current progress if form has data
      if (hasFormData()) {
        const requestData = collectCurrentRequestData()
        FormState.allRequests.push(requestData)
        saveAllRequests()
      }

      // Clear form and start new request
      clearForm()
      FormState.currentRequestIndex = FormState.allRequests.length
      updateRequestsCounter()
      showFlashMessage("Nagsimula na ang bagong kahilingan!")
    }
  }

  function addMoreRequests() {
    clearForm()
    FormState.currentRequestIndex = FormState.allRequests.length
    FormState.currentStep = 1
    showSection(FormState.sections.requestForm)
  }

  function hasFormData() {
    return (
      FormState.fields.certificateType?.value ||
      FormState.fields.lastName?.value ||
      FormState.fields.firstName?.value ||
      FormState.fields.mobileNumber?.value ||
      FormState.fields.emailAddress?.value
    )
  }

  function showFlashMessage(message) {
    const flashElement = document.getElementById("flash-message")
    const flashText = document.getElementById("flash-text")

    if (flashElement && flashText) {
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
    Object.values(FormState.fields).forEach((field) => {
      if (field && field.type !== "radio") {
        field.value = ""
      }
    })

    // Reset radio buttons
    const maleRadio = document.querySelector('input[name="sex"][value="Male"]')
    if (maleRadio) maleRadio.checked = true

    // Hide other purpose row
    const otherPurposeRow = document.getElementById("otherPurposeRow")
    if (otherPurposeRow) otherPurposeRow.style.display = "none"

    // Hide sponsor section
    const sponsorSection = document.getElementById("sponsorSection")
    if (sponsorSection) sponsorSection.style.display = "none"

    // Clear errors
    document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"))
    document.querySelectorAll(".error-message").forEach((el) => (el.style.display = "none"))
  }

  function updateRequestsCounter() {
    const counter = document.getElementById("requests-count")
    const reviewCounter = document.getElementById("review-requests-count")
    const addAnotherBtn = document.getElementById("add-another-btn")

    if (counter) counter.textContent = FormState.allRequests.length + 1
    if (reviewCounter) reviewCounter.textContent = FormState.allRequests.length

    // Show add another button if there are requests
    if (addAnotherBtn) {
      addAnotherBtn.style.display = FormState.allRequests.length > 0 ? "flex" : "none"
    }
  }

  function updateRequestsReviewTable() {
    const tbody = document.getElementById("requests-review-tbody")
    if (!tbody) return

    tbody.innerHTML = ""

    FormState.allRequests.forEach((request, index) => {
      const row = document.createElement("tr")

      // Add highlight class to newly added requests
      if (index === FormState.allRequests.length - 1) {
        row.classList.add("highlight-row")
        setTimeout(() => {
          row.classList.remove("highlight-row")
        }, 3000)
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${request.certificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"}</td>
        <td>${formatName(request.lastName, request.firstName, request.middleName)}</td>
        <td>${request.sacramentDate ? formatDate(request.sacramentDate) : "Hindi nabanggit"}</td>
        <td>${request.purpose}</td>
        <td class="action-buttons">
          <button class="action-btn edit-btn" onclick="editRequest(${index})">
            <i class="fas fa-edit"></i> I-edit
          </button>
          <button class="action-btn delete-btn" onclick="deleteRequest(${index})">
            <i class="fas fa-trash"></i> Burahin
          </button>
          <button class="action-btn view-btn" onclick="viewRequest(${index})">
            <i class="fas fa-eye"></i> Tingnan
          </button>
        </td>
      `
      tbody.appendChild(row)
    })

    updateRequestsCounter()
  }

  function proceedToDelivery() {
    if (FormState.allRequests.length === 0) {
      alert("Walang mga kahilingan na ma-proceed. Magdagdag muna ng kahilingan.")
      return
    }

    FormState.currentStep = 2
    showSection(FormState.sections.unifiedDelivery)
  }

  function toggleDeliveryOptions() {
    const deliveryOption = document.querySelector('input[name="unifiedDeliveryOption"]:checked')?.value
    const deliverySection = document.getElementById("unifiedDeliveryAddressSection")
    const pickupSection = document.getElementById("unifiedPickupSection")
    const deliveryText = document.getElementById("unifiedDeliveryText")
    const pickupText = document.getElementById("unifiedPickupText")

    if (deliveryOption === "delivery") {
      deliverySection.style.display = "block"
      pickupSection.style.display = "none"
      deliveryText.style.display = "block"
      pickupText.style.display = "none"
    } else {
      deliverySection.style.display = "none"
      pickupSection.style.display = "block"
      deliveryText.style.display = "none"
      pickupText.style.display = "block"
    }
  }

  function proceedToSummary() {
    if (!window.validateUnifiedDeliveryForm()) {
      alert("Mangyaring punan ang lahat ng kinakailangang detalye ng paghahatid.")
      return
    }

    // Save unified delivery details
    const deliveryOption = document.querySelector('input[name="unifiedDeliveryOption"]:checked')?.value

    FormState.unifiedDeliveryDetails = {
      deliveryOption: deliveryOption,
      termsAccepted: document.getElementById("unifiedDeliveryTermsCheckbox")?.checked,
    }

    if (deliveryOption === "delivery") {
      FormState.unifiedDeliveryDetails.addressLine1 = document.getElementById("unifiedAddressLine1")?.value
      FormState.unifiedDeliveryDetails.zipCode = document.getElementById("unifiedZipCode")?.value
    } else {
      FormState.unifiedDeliveryDetails.pickupDate = document.getElementById("unifiedPickupDate")?.value
      FormState.unifiedDeliveryDetails.contactNumber = document.getElementById("unifiedPickupContactNumber")?.value
    }

    generateFinalSummary()
    FormState.currentStep = 3
    showSection(FormState.sections.finalSummary)
  }

  function generateFinalSummary() {
    const summaryContent = document.getElementById("final-summary-content")
    if (!summaryContent) return

    let totalAmount = 0
    const baseCertificatePrice = 100
    const deliveryFee = FormState.unifiedDeliveryDetails.deliveryOption === "pickup" ? 0 : 150

    // Requests Summary
    let requestsHtml = `
      <div class="summary-section">
        <div class="section-header">
          <div>
            <h3 class="section-title">Mga Kahilingan para sa Sertipiko</h3>
            <div class="section-subtitle">Certificate Requests (${FormState.allRequests.length})</div>
          </div>
        </div>
        <div class="section-content">
          <table class="requests-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Uri ng Sertipiko</th>
                <th>Pangalan ng May-ari</th>
                <th>Petsa ng Pangyayari</th>
                <th>Layunin</th>
                <th>Halaga</th>
              </tr>
            </thead>
            <tbody>
    `

    FormState.allRequests.forEach((request, index) => {
      const requestAmount = baseCertificatePrice
      totalAmount += requestAmount

      requestsHtml += `
        <tr>
          <td>${index + 1}</td>
          <td>${request.certificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"}</td>
          <td>${formatName(request.lastName, request.firstName, request.middleName)}</td>
          <td>${request.sacramentDate ? formatDate(request.sacramentDate) : "Hindi nabanggit"}</td>
          <td>${request.purpose}</td>
          <td>PHP ${requestAmount.toFixed(2)}</td>
        </tr>
      `
    })

    // Add delivery fee to total
    totalAmount += deliveryFee

    requestsHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `

    // Delivery Summary
    const deliveryHtml = `
      <div class="summary-section">
        <div class="section-header">
          <div>
            <h3 class="section-title">Detalye ng Paghahatid</h3>
            <div class="section-subtitle">Delivery Details</div>
          </div>
        </div>
        <div class="section-content">
          <div class="form-row">
            <div class="form-group">
              <label><strong>Paraan ng Paghahatid:</strong></label>
              <p>${FormState.unifiedDeliveryDetails.deliveryOption === "pickup" ? "KUKUNIN SA PAROKYA" : "PAGHAHATID"}</p>
            </div>
          </div>
          ${
            FormState.unifiedDeliveryDetails.deliveryOption === "delivery"
              ? `
            <div class="form-row">
              <div class="form-group">
                <label><strong>Address:</strong></label>
                <p>${FormState.unifiedDeliveryDetails.addressLine1}</p>
                <p>Zip Code: ${FormState.unifiedDeliveryDetails.zipCode}</p>
              </div>
            </div>
          `
              : `
            <div class="form-row">
              <div class="form-group">
                <label><strong>Petsa ng Pagkuha:</strong></label>
                <p>${formatDate(FormState.unifiedDeliveryDetails.pickupDate)}</p>
              </div>
              <div class="form-group">
                <label><strong>Contact Number:</strong></label>
                <p>${FormState.unifiedDeliveryDetails.contactNumber}</p>
              </div>
            </div>
          `
          }
        </div>
      </div>
    `

    // Fee Summary
    const feeHtml = `
      <div class="summary-section">
        <div class="section-header">
          <div>
            <h3 class="section-title">Kabuuang Bayad</h3>
            <div class="section-subtitle">Total Payment</div>
          </div>
        </div>
        <div class="section-content">
          <div class="fee-container">
            <div class="fee-row">
              <span class="fee-label">
                Bayad sa mga Sertipiko (${FormState.allRequests.length} x PHP ${baseCertificatePrice})
                <br>
                <em class="fee-sublabel">Certificate Fees</em>
              </span>
              <span class="fee-amount">PHP ${(FormState.allRequests.length * baseCertificatePrice).toFixed(2)}</span>
            </div>
            ${
              deliveryFee > 0
                ? `
              <div class="fee-row">
                <span class="fee-label">
                  Bayad sa Paghahatid
                  <br>
                  <em class="fee-sublabel">Delivery Fee</em>
                </span>
                <span class="fee-amount">PHP ${deliveryFee.toFixed(2)}</span>
              </div>
            `
                : ""
            }
            <div class="fee-row total-row">
              <span class="fee-label">
                <strong>Kabuuang Halaga</strong>
                <br>
                <em class="fee-sublabel"><strong>Total Amount</strong></em>
              </span>
              <span class="fee-amount">
                <strong>PHP ${totalAmount.toFixed(2)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    `

    summaryContent.innerHTML = requestsHtml + deliveryHtml + feeHtml
  }

  function confirmAllRequests() {
    if (FormState.allRequests.length === 0) {
      alert("Walang mga kahilingan na ma-confirm.")
      return
    }

    // Prepare final data structure
    const finalData = {
      requests: FormState.allRequests,
      deliveryDetails: FormState.unifiedDeliveryDetails,
      totalAmount: calculateTotalAmount(),
      submittedAt: new Date().toISOString(),
      status: "submitted",
    }

    // Save to localStorage
    localStorage.setItem("submittedCertificateRequests", JSON.stringify(finalData))

    // Clear working data
    localStorage.removeItem("allCertificateRequests")

    // Redirect to acknowledgement page
    alert("Matagumpay na naipadala ang inyong mga kahilingan!")
    window.location.href = "acknowledgement-request-certificate-user.html"
  }

  function calculateTotalAmount() {
    const baseCertificatePrice = 100
    const deliveryFee = FormState.unifiedDeliveryDetails?.deliveryOption === "pickup" ? 0 : 150
    return FormState.allRequests.length * baseCertificatePrice + deliveryFee
  }

  function cancelAllRequests() {
    if (confirm("Sigurado ba kayong gusto ninyong kanselahin ang lahat ng kahilingan?")) {
      localStorage.removeItem("allCertificateRequests")
      window.location.href = "dashboard-user.html"
    }
  }

  function saveAllRequests() {
    localStorage.setItem("allCertificateRequests", JSON.stringify(FormState.allRequests))
  }

  function showSection(section) {
    // Hide all sections
    Object.values(FormState.sections).forEach((s) => {
      if (s) s.style.display = "none"
    })

    // Show target section
    if (section) {
      section.style.display = "block"
      section.classList.add("fade-in")
      window.scrollTo(0, 0)
    }
  }

  // Global functions for table actions
  window.editRequest = (index) => {
    const request = FormState.allRequests[index]
    if (!request) return

    // Load request data into form
    FormState.fields.certificateType.value = request.certificateType
    FormState.fields.lastName.value = request.lastName
    FormState.fields.firstName.value = request.firstName
    FormState.fields.middleName.value = request.middleName
    FormState.fields.dateOfBirth.value = request.dateOfBirth
    FormState.fields.sacramentDate.value = request.sacramentDate
    FormState.fields.birthCountry.value = request.birthCountry
    FormState.fields.birthProvince.value = request.birthProvince
    FormState.fields.birthCity.value = request.birthCity

    // Parse father's name
    if (request.fatherName) {
      const fatherParts = request.fatherName.split(", ")
      FormState.fields.fatherLastName.value = fatherParts[0] || ""
      FormState.fields.fatherFirstName.value = fatherParts[1] || ""
      FormState.fields.fatherMiddleName.value = fatherParts[2] || ""
    }

    // Parse mother's name
    if (request.motherName) {
      const motherParts = request.motherName.split(", ")
      FormState.fields.motherLastName.value = motherParts[0] || ""
      FormState.fields.motherFirstName.value = motherParts[1] || ""
      FormState.fields.motherMiddleName.value = motherParts[2] || ""
    }

    FormState.fields.relationship.value = request.relationship
    FormState.fields.mobileNumber.value = request.mobileNumber
    FormState.fields.emailAddress.value = request.emailAddress

    // Handle purpose
    if (
      [
        "PANG-ESKWELA",
        "PANG-TRABAHO",
        "PANG-KASAL",
        "PANG-KUMPIL",
        "PANG-LEGAL",
        "PANG-BIYAHE",
        "PERSONAL NA REKORD",
      ].includes(request.purpose)
    ) {
      FormState.fields.purpose.value = request.purpose
    } else {
      FormState.fields.purpose.value = "OTHERS"
      document.getElementById("otherPurpose").value = request.purpose
      document.getElementById("otherPurposeRow").style.display = "block"
    }

    // Handle sex
    const sexRadio = document.querySelector(`input[name="sex"][value="${request.sex}"]`)
    if (sexRadio) sexRadio.checked = true

    // Handle certificate type change
    handleCertificateTypeChange()

    FormState.currentRequestIndex = index
    FormState.currentStep = 1
    showSection(FormState.sections.requestForm)
    showFlashMessage("Nai-load na ang kahilingan para sa pag-edit.")
  }

  window.deleteRequest = (index) => {
    if (confirm("Sigurado ba kayong gusto ninyong burahin ang kahilingang ito?")) {
      FormState.allRequests.splice(index, 1)
      saveAllRequests()
      updateRequestsReviewTable()
      showFlashMessage("Matagumpay na nabura ang kahilingan.")

      if (FormState.allRequests.length === 0) {
        FormState.currentStep = 1
        showSection(FormState.sections.requestForm)
      }
    }
  }

  window.viewRequest = (index) => {
    const request = FormState.allRequests[index]
    if (!request) return

    const details = `
Uri ng Sertipiko: ${request.certificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"}
Pangalan: ${formatName(request.lastName, request.firstName, request.middleName)}
Petsa ng Kapanganakan: ${formatDate(request.dateOfBirth)}
${request.sacramentDate ? `Petsa ng ${request.certificateType === "KUMPIL" ? "Kumpil" : "Binyag"}: ${formatDate(request.sacramentDate)}` : ""}
Lugar ng Kapanganakan: ${request.birthCity}, ${request.birthProvince}, ${request.birthCountry}
Kasarian: ${request.sex === "Male" ? "Lalaki" : "Babae"}
Pangalan ng Ama: ${request.fatherName || "Hindi nabanggit"}
Pangalan ng Ina: ${request.motherName || "Hindi nabanggit"}
Relasyon: ${request.relationship}
Layunin: ${request.purpose}
Mobile: ${request.mobileNumber}
Email: ${request.emailAddress}
    `

    alert(details)
  }

  // Utility functions
  function formatName(lastName, firstName, middleName) {
    if (!lastName || !firstName) return ""
    const middle = middleName ? ` ${middleName}` : ""
    return `${lastName}, ${firstName}${middle}`
  }

  function formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const options = { year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("tl-PH", options).toUpperCase()
  }
})
