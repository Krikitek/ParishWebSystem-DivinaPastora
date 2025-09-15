  const PSGC_API = "https://psgc.gitlab.io/api";
const CACHE_EXPIRY_HOURS = 24; // Cache expires every 24 hours
// // Enhanced Multi-Request Certificate Form Handler
const userData = JSON.parse(sessionStorage.getItem("chronos_user") || "{}");
document.addEventListener("DOMContentLoaded", () => {
  const lastFormSection = sessionStorage.getItem("lastFormSection");  
  // State Management
  console.log(lastFormSection);
  const FormState = {
    allRequests: [],
    currentRequestIndex: 0,
    currentStep: 1,
    unifiedDeliveryDetails: {}, 

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
      birthProvince: document.getElementById("birthProvince"),
      birthCity: document.getElementById("birthCity"),
      birthDistrict: document.getElementById("birthDistrict"),
      fatherLastName: document.getElementById("fatherLastName"),
      fatherFirstName: document.getElementById("fatherFirstName"),
      fatherMiddleName: document.getElementById("fatherMiddleName"),
      motherLastName: document.getElementById("motherLastName"),
      motherFirstName: document.getElementById("motherFirstName"),
      motherMiddleName: document.getElementById("motherMiddleName"),
      relationship: document.getElementById("relationship"),
      purpose: document.getElementById("purpose"),
      otherPurpose: document.getElementById("otherPurpose"),
    },
  }
          
  if (lastFormSection==2) {      
    showSection(FormState.sections.requestsReview);    
    updateRequestsReviewTable();        
  } else if (lastFormSection==3) {  
    showSection(FormState.sections.unifiedDelivery); 
    updateRequestsReviewTable();      
  }else if (lastFormSection==4) {   
    populateDelivery();
    updateRequestsReviewTable();  
    generateFinalSummary();
    showSection(FormState.sections.finalSummary);
  }
  

  // Initialize the form
  init()

  async function init() {    
    setupEventListeners()
    setupUppercaseInputs()
    await setupLocationDropdowns()
    loadRequestData()
    if (lastFormSection==0) {
    showSection(FormState.sections.requestForm)    
    }
  }

 

// Function to auto-fill fields if relationship is "SARILI"
async function handleRelationshipChange() {
  if (relationship.value === "SARILI") {
    // ✅ Fill name fields
    firstName.value = userData.firstName || "";
    middleName.value = userData.middleName || "";
    lastName.value = userData.lastName || "";
    dateOfBirth.value = userData.dateOfBirth || "";


    // ✅ Load provinces first
    const provinces = await getCachedData("psgc_provinces", fetchProvinces);
    populateDropdown(birthProvince, provinces, "PUMILI NG LALAWIGAN", userData.birthProvince);

    // ✅ If province exists, fetch its cities
    if (userData.birthProvince) {
      const selectedProvince = provinces.find(
        p => p.name.toUpperCase() === userData.birthProvince.toUpperCase()
      );
      if (selectedProvince) {
        const cities = await getCachedData(
          `psgc_cities_${selectedProvince.code}`,
          () => fetchCities(selectedProvince.code)
        );
        populateDropdown(birthCity, cities, "PUMILI NG LUNGSOD/BAYAN", userData.birthCity);

        // ✅ If city exists, fetch its barangays
        if (userData.birthCity) {
          const selectedCity = cities.find(
            c => c.name.toUpperCase() === userData.birthCity.toUpperCase()
          );
          if (selectedCity) {
            const barangays = await getCachedData(
              `psgc_barangays_${selectedCity.code}`,
              () => fetchBarangays(selectedCity.code)
            );
            populateDropdown(birthDistrict, barangays, "PUMILI NG BARANGAY", userData.birthBarangay);
          }
        }
      }
    }

    validateRequestForm("personalInfoSection", true);

  } else {
    // 🔄 Reset all fields for non-"SARILI"
    firstName.value = "";
    middleName.value = "";
    lastName.value = "";
    dateOfBirth.value = "";
    birthProvince.value = "";
    birthCity.value = "";
    birthDistrict.value = "";

    firstName.readOnly = false;
    middleName.readOnly = false;
    lastName.readOnly = false;
    dateOfBirth.readOnly = false;

    birthProvince.disabled = false;
    birthCity.disabled = false;
    birthDistrict.disabled = false;

    [firstName, middleName, lastName, dateOfBirth, birthProvince, birthCity, birthDistrict]
      .forEach(field => field.style.backgroundColor = "");
  }
}


// Listen for dropdown changes
relationship.addEventListener("change", handleRelationshipChange);

  function setupEventListeners() {
    // Navigation buttons
    FormState.buttons.saveAndContinue?.addEventListener("click", saveCurrentRequestAndContinue)
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
    const locationSelects = ["birthProvince", "birthCity", "birthDistrict"]

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



async function setupLocationDropdowns() {
  const birthProvince = document.getElementById("birthProvince");
  const birthCity = document.getElementById("birthCity");
  const birthDistrict = document.getElementById("birthDistrict");

  // ✅ Load provinces first (cached or API)
  const provinces = await getCachedData("psgc_provinces", fetchProvinces);
  populateDropdown(birthProvince, provinces, "PUMILI NG LALAWIGAN");

  // ✅ Province change → Fetch cities
  birthProvince.addEventListener("change", async function () {
    const provinceCode = this.value;

    // Disable city & barangay dropdowns until new data loads
    birthCity.disabled = true;
    birthDistrict.disabled = true;    

    birthCity.innerHTML = '<option value="" disabled selected>Loading cities...</option>';
    birthDistrict.innerHTML = '<option value="" disabled selected>PUMILI NG BARANGAY</option>';

    // ✅ Fetch cities (cached per province)
    const cacheKey = `psgc_cities_${provinceCode}`;
    const cities = await getCachedData(cacheKey, () => fetchCities(provinceCode));
    populateDropdown(birthCity, cities, "PUMILI NG LUNGSOD/BAYAN");
    birthCity.disabled = false;
  });

  // ✅ City change → Fetch barangays
  birthCity.addEventListener("change", async function () {
    const cityCode = this.value;

    birthDistrict.disabled = true;
    birthDistrict.innerHTML = '<option value="" disabled selected>Loading barangays...</option>';

    // ✅ Fetch barangays (cached per city)
    const cacheKey = `psgc_barangays_${cityCode}`;
    const barangays = await getCachedData(cacheKey, () => fetchBarangays(cityCode));
    populateDropdown(birthDistrict, barangays, "PUMILI NG BARANGAY");
    birthDistrict.disabled = false;
  });
}

// ✅ Get data from cache or fetch from API
async function getCachedData(cacheKey, fetchFunction) {
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check cache expiration
    if ((now - timestamp) / (1000 * 60 * 60) < CACHE_EXPIRY_HOURS) {
      return data; // ✅ Return cached data
    }
  }

  // ✅ No cache or expired → Fetch new data
  const freshData = await fetchFunction();

  // Save to cache
  localStorage.setItem(cacheKey, JSON.stringify({
    data: freshData,
    timestamp: Date.now()
  }));

  return freshData;
}

// ✅ Fetch all provinces
async function fetchProvinces() {
  const response = await fetch(`${PSGC_API}/provinces.json`);
  const data = await response.json();
  return data.map(p => ({ code: p.code, name: p.name }));
}

// ✅ Fetch cities per province
async function fetchCities(provinceCode) {
  const response = await fetch(`${PSGC_API}/provinces/${provinceCode}/cities-municipalities.json`);
  const data = await response.json();
  return data.map(c => ({ code: c.code, name: c.name }));
}

// ✅ Fetch barangays per city
async function fetchBarangays(cityCode) {
  const response = await fetch(`${PSGC_API}/cities-municipalities/${cityCode}/barangays.json`);
  const data = await response.json();
  return data.map(b => ({ code: b.code, name: b.name }));
}

// ✅ Populate dropdown helper
function populateDropdown(dropdown, items, placeholder, selectedText = "") {
  // ✅ Clear and set placeholder
  dropdown.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;

  // ✅ Sort alphabetically
  items.sort((a, b) => a.name.localeCompare(b.name));

  // ✅ Add options
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.code;
    option.textContent = item.name.toUpperCase();
    dropdown.appendChild(option);
  });

  // ✅ Auto-select if there's a saved value
  if (selectedText && selectedText.trim() !== "") {
    const match = Array.from(dropdown.options).find(
      opt => opt.textContent.trim().toUpperCase() === selectedText.trim().toUpperCase()
    );
    if (match) dropdown.value = match.value;
  }

  // Enable/disable dropdown
  dropdown.disabled = items.length === 0;
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
  const pickupContactField = document.getElementById("unifiedPickupContactNumber");
if (pickupContactField && userData.phoneNumber) {
  let formattedNumber = userData.phoneNumber;
    formattedNumber = "0" + formattedNumber.slice(3);
    
  pickupContactField.value = formattedNumber;
  pickupContactField.readOnly = true;
}

  function collectCurrentRequestData() {

const birthProvinceSelect = FormState.fields.birthProvince;
const birthCitySelect = FormState.fields.birthCity;
const birthDistrictSelect = FormState.fields.birthDistrict;

const birthProvince =  birthProvinceSelect?.options[birthProvinceSelect.selectedIndex]?.text || "";
const birthCity =  birthCitySelect?.options[birthCitySelect.selectedIndex]?.text || "";
const birthDistrict =  birthDistrictSelect?.options[birthDistrictSelect.selectedIndex]?.text || "";

  const purposeValue =
    FormState.fields.purpose?.value === "OTHERS"
      ? document.getElementById("otherPurpose")?.value?.trim() || ""
      : FormState.fields.purpose?.value?.trim() || "";

  // Format father's name
  const fatherName = [
  FormState.fields.fatherFirstName?.value,
  FormState.fields.fatherMiddleName?.value,
  FormState.fields.fatherLastName?.value,
]
  .filter(Boolean)
  .join(" ");

const motherName = [
  FormState.fields.motherFirstName?.value,
  FormState.fields.motherMiddleName?.value,
  FormState.fields.motherLastName?.value,
]
  .filter(Boolean)
  .join(" ");

  return {
    certificateType: FormState.fields.certificateType?.value?.trim() || "",
    lastName: FormState.fields.lastName?.value?.trim() || "",
    firstName: FormState.fields.firstName?.value?.trim() || "",
    middleName: FormState.fields.middleName?.value?.trim() || "",
    dateOfBirth: FormState.fields.dateOfBirth?.value || "",
    sacramentDate: FormState.fields.sacramentDate?.value || "",
    birthProvince,
    birthCity,
    birthDistrict,
    sex: document.querySelector('input[name="sex"]:checked')?.value || "",
    fatherName,
    motherName,
    relationship: FormState.fields.relationship?.value?.trim() || "",
    purpose: purposeValue,
  };
}
async function loadRequestData() {
  const savedData = localStorage.getItem("requestData");
  if (!savedData) return; // nothing to restore

  const data = JSON.parse(savedData);

  // Fill fields back
  FormState.fields.certificateType.value = data.certificateType || "";
  FormState.fields.lastName.value = data.lastName || "";
  FormState.fields.firstName.value = data.firstName || "";
  FormState.fields.middleName.value = data.middleName || "";
  FormState.fields.dateOfBirth.value = data.dateOfBirth || "";
  FormState.fields.sacramentDate.value = data.sacramentDate || "";
  FormState.fields.birthProvince.value = data.birthProvince || "";
  FormState.fields.birthCity.value = data.birthCity || "";
  FormState.fields.birthDistrict.value = data.birthDistrict || "";
  FormState.fields.relationship.value = data.relationship || "";

  const provinces = await getCachedData("psgc_provinces", fetchProvinces);
    populateDropdown(birthProvince, provinces, "PUMILI NG LALAWIGAN", data.birthProvince);

    // ✅ If province exists, fetch its cities
    if (data.birthProvince) {
      const selectedProvince = provinces.find(
        p => p.name.toUpperCase() === data.birthProvince.toUpperCase()
      );
      if (selectedProvince) {
        const cities = await getCachedData(
          `psgc_cities_${selectedProvince.code}`,
          () => fetchCities(selectedProvince.code)
        );
        populateDropdown(birthCity, cities, "PUMILI NG LUNGSOD/BAYAN", data.birthCity);

        // ✅ If city exists, fetch its barangays
        if (data.birthCity) {
          const selectedCity = cities.find(
            c => c.name.toUpperCase() === data.birthCity.toUpperCase()
          );
          if (selectedCity) {
            const barangays = await getCachedData(
              `psgc_barangays_${selectedCity.code}`,
              () => fetchBarangays(selectedCity.code)
            );
            populateDropdown(birthDistrict, barangays, "PUMILI NG BARANGAY", data.birthDistrict);
          }
        }
      }
    }

  // Sex radio button
  if (data.sex) {
    const sexInput = document.querySelector(
      `input[name="sex"][value="${data.sex}"]`
    );
    if (sexInput) sexInput.checked = true;
  }

  // Father’s name
  if (data.fatherName) {
    const parts = data.fatherName.split(" ");
    FormState.fields.fatherFirstName.value = parts[0] || "";
    FormState.fields.fatherMiddleName.value = parts[1] || "";
    FormState.fields.fatherLastName.value = parts[2] || "";
  }

  // Mother’s name
  if (data.motherName) {
    const parts = data.motherName.split(" ");
    FormState.fields.motherFirstName.value = parts[0] || "";
    FormState.fields.motherMiddleName.value = parts[1] || "";
    FormState.fields.motherLastName.value = parts[2] || "";
  }

  // Purpose
  if (FormState.fields.purpose) {
    FormState.fields.purpose.value = data.purpose || "";
  }
}

function saveCurrentRequestAndContinue() {
  if (!window.validateRequestForm()) {
    alert("Mangyaring punan ang lahat ng kinakailangang field nang tama.");
    return;
  }

  const requestData = collectCurrentRequestData();

  // Save the current request for preview population
  localStorage.setItem("requestData", JSON.stringify(requestData));

  // Update all requests in FormState
  if (FormState.currentRequestIndex < FormState.allRequests.length) {
    FormState.allRequests[FormState.currentRequestIndex] = requestData;
  } else {
    FormState.allRequests.push(requestData);
  }

  updateRequestsReviewTable();

  // Show success notification
  showNotification("Matagumpay na nai-save ang kahilingan!");

  // Move to the next step after a short delay for smoother UX
  setTimeout(() => {
    FormState.currentStep = 2;
    sessionStorage.setItem("lastFormSection", 2); 
    showSection(FormState.sections.requestsReview);
  }, 800);
}


  function updateRequestsReviewTable() {
    const savedData = JSON.parse(localStorage.getItem("requestData")) || {};


    const formatName = (first, middle, last) => {
    return [first, middle, last].filter(Boolean).join(" ");
  };

  // Helper function to format birthplace cleanly
  const formatBirthPlace = (city, district, province) => {
    return [city, district, province].filter(Boolean).join(", ") || "N/A";
  };

    document.getElementById("review-certificateType").textContent = savedData.certificateType || "N/A";
  document.getElementById("review-fullName").textContent = formatName(savedData.firstName, savedData.middleName, savedData.lastName);
  document.getElementById("review-dateOfBirth").textContent = savedData.dateOfBirth || "N/A";
  document.getElementById("review-sacramentDate").textContent = savedData.sacramentDate || "N/A";
  document.getElementById("review-sex").textContent = savedData.sex || "N/A";
  document.getElementById("review-birthPlace").textContent = formatBirthPlace(savedData.birthDistrict, savedData.birthCity, savedData.birthProvince);
  document.getElementById("review-fatherName").textContent = savedData.fatherName;
  document.getElementById("review-motherName").textContent = savedData.motherName;
  document.getElementById("review-relationship").textContent = savedData.relationship || "N/A";

  // Handle purpose & other purpose properly
  const purposeText =
    savedData.purpose === "Other" && savedData.otherPurpose
      ? `${savedData.purpose} - ${savedData.otherPurpose}`
      : savedData.purpose || "N/A";
  document.getElementById("review-purpose").textContent = purposeText;
  }

  function proceedToDelivery() {

    FormState.currentStep = 2
    showSection(FormState.sections.unifiedDelivery)
  }

  function populateDelivery ()
  {
const savedDeliveryDetails = JSON.parse(localStorage.getItem("deliveryDetails")) || {};
   

// Function to safely set value
function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el && "value" in el) {  // ensure element exists and supports .value
    el.value = value || "";
  }
}

// Set delivery option radio button
if (savedDeliveryDetails.deliveryOption) {
  const radioToCheck = document.querySelector(
    `input[name="unifiedDeliveryOption"][value="${savedDeliveryDetails.deliveryOption}"]`
  );
  if (radioToCheck) radioToCheck.checked = true;
}

// Populate other fields safely
setInputValue("unifiedAddressLine1", savedDeliveryDetails.addressLine1);
setInputValue("unifiedZipCode", savedDeliveryDetails.zipCode);
setInputValue("unifiedPickupDate", savedDeliveryDetails.pickupDate);
setInputValue("unifiedPickupContactNumber", savedDeliveryDetails.contactNumber);
document.getElementById("unifiedDeliveryTermsCheckbox").checked = savedDeliveryDetails.termsAccepted || false;
toggleDeliveryOptions();
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

  async function proceedToSummary() {
    if (!window.validateUnifiedDeliveryForm()) {
      alert("Mangyaring punan ang lahat ng kinakailangang detalye ng paghahatid.")
      return
    }
    FormState.unifiedDeliveryDetails = FormState.unifiedDeliveryDetails || {};


// Get current selected delivery option
const deliveryOption = document.querySelector('input[name="unifiedDeliveryOption"]:checked')?.value;

// Update FormState with current form values
FormState.unifiedDeliveryDetails.deliveryOption = deliveryOption ;
FormState.unifiedDeliveryDetails.termsAccepted = document.getElementById("unifiedDeliveryTermsCheckbox")?.checked;

if (deliveryOption === "delivery") {
  FormState.unifiedDeliveryDetails.addressLine1 = document.getElementById("unifiedAddressLine1")?.value;
  FormState.unifiedDeliveryDetails.zipCode = document.getElementById("unifiedZipCode")?.value;
} else if (deliveryOption === "pickup") {
  FormState.unifiedDeliveryDetails.pickupDate = document.getElementById("unifiedPickupDate")?.value;
  FormState.unifiedDeliveryDetails.contactNumber = document.getElementById("unifiedPickupContactNumber")?.value;
}

localStorage.setItem("deliveryDetails", JSON.stringify(FormState.unifiedDeliveryDetails));
 
    await getServiceFee()
    generateFinalSummary()
    FormState.currentStep = 3
    showSection(FormState.sections.finalSummary)
  }

  function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification")
    existingNotifications.forEach((notification) => notification.remove())

    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`

    const colors = {
      info: "#2196F3",
      success: "#4CAF50",
      warning: "#FF9800",
      error: "#f44336",
    }

    const icons = {
      info: "info-circle",
      success: "check-circle",
      warning: "exclamation-triangle",
      error: "times-circle",
    }

    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 350px;
      font-family: inherit;
    `

    const content = notification.querySelector(".notification-content")
    if (content) {
      content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
      `
    }

    const closeBtn = notification.querySelector(".notification-close")
    if (closeBtn) {
      closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
    }

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
      removeNotification(notification)
    }, 5000)

    // Close button functionality
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        clearTimeout(autoRemove)
        removeNotification(notification)
      })
    }

    function removeNotification(notif) {
      notif.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (notif.parentNode) {
          notif.parentNode.removeChild(notif)
        }
      }, 300)
    }
  }
  async function getServiceFee() {
  const savedDeliveryDetails = JSON.parse(localStorage.getItem("deliveryDetails")) || {};
  let certFee = savedDeliveryDetails.certificateFee || 0;
  let deliveryFee = savedDeliveryDetails.deliveryFee || 0;

  if (certFee === 0) {
    try {
      const response = await fetch('/assets/php_file/serviceFee.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ certificateRequest: true })
      });

      const data = await response.json();

      if (data.certificateFee !== undefined) {
        certFee = parseFloat(data.certificateFee) || 0;
        deliveryFee = parseFloat(data.deliveryFee) || 0;

        FormState.unifiedDeliveryDetails.certFee = certFee;
        FormState.unifiedDeliveryDetails.deliveryFee = deliveryFee;
        localStorage.setItem("deliveryDetails", JSON.stringify(FormState.unifiedDeliveryDetails));
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  }

  // Always return the fees wrapped in a Promise
  return { certFee, deliveryFee };
}


  function generateFinalSummary() {    
    const savedRequestData = JSON.parse(localStorage.getItem("requestData")) || {};
     const savedDeliveryDetails = JSON.parse(localStorage.getItem("deliveryDetails")) || {};
     
   totalAmount=0;
    let formattedNumber = userData.phoneNumber;
    formattedNumber = "0" + formattedNumber.slice(3);

    const summaryContent = document.getElementById("final-summary-content")
    if (!summaryContent) return
      
      if(savedDeliveryDetails.deliveryOption === "delivery")
      {
       FormState.unifiedDeliveryDetails.totalAmount=savedDeliveryDetails.deliveryFee + savedDeliveryDetails.certFee;
      }else{
        FormState.unifiedDeliveryDetails.totalAmount=savedDeliveryDetails.certFee;
      }
console.log(savedDeliveryDetails);
    // Requests Summary
    
// Build Requests HTML
let requestsHtml = `
      <div class="summary-section">
        <div class="section-header">
          <div>
            <h3 class="section-title">Kahilingan para sa Sertipiko</h3>
            <div class="section-subtitle">Certificate Requests</div>
          </div>
        </div>
        <div class="section-content">
          <table class="requests-table">
            <thead>
              <tr>
                <th>Uri ng Sertipiko</th>
                <th>Pangalan ng May-ari</th>
                <th>Petsa ng Pangyayari</th>
                <th>Layunin</th>
                <th>Halaga</th>
              </tr>
            </thead>
            <tbody>
    `

  requestsHtml += `
    <tr>
      <td>${savedRequestData.certificateType === "KUMPIL" ? "KUMPIL" : "BINYAG"}</td>
      <td>${savedRequestData.lastName ? `${savedRequestData.lastName}, ${savedRequestData.firstName} ${savedRequestData.middleName || ""}` : ""}</td>
      <td>${savedRequestData.sacramentDate ? new Date(savedRequestData.sacramentDate).toLocaleDateString() : "Hindi nabanggit"}</td>
      <td>${savedRequestData.purpose || ""}</td>
      <td>PHP ${FormState.unifiedDeliveryDetails.totalAmount.toFixed(2)}</td>
    </tr>
  `;


requestsHtml += `
        </tbody>
      </table>
    </div>
  </div>
`;

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
          <p>${savedDeliveryDetails.deliveryOption === "pickup" ? "KUKUNIN SA PAROKYA" : "PAGHAHATID"}</p>
        </div>
      </div>
      ${
        savedDeliveryDetails.deliveryOption === "delivery"
          ? `
        <div class="form-row">
          <div class="form-group">
            <label><strong>Address:</strong></label>
            <p>${savedDeliveryDetails.addressLine1 || ""}</p>
            <p>Zip Code: ${savedDeliveryDetails.zipCode || ""}</p>
          </div>
          <div class="form-group">
            <label><strong>Mobile Number:</strong></label>
            <p>${formattedNumber}</p>
          </div>
          <div class="form-group">
            <label><strong>Email:</strong></label>
            <p>${userData.email}</p>
          </div>
        </div>
      `
          : `
        <div class="form-row">
          <div class="form-group">
            <label><strong>Petsa ng Pagkuha:</strong></label>
            <p>${savedDeliveryDetails.pickupDate ? new Date(savedDeliveryDetails.pickupDate).toLocaleDateString() : ""}</p>
          </div>
          <div class="form-group">
            <label><strong>Mobile Number:</strong></label>
            <p>${formattedNumber}</p>
          </div>
          <div class="form-group">
            <label><strong>Email:</strong></label>
            <p>${userData.email}</p>
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
            Bayad sa Sertipiko (${savedRequestData.length} x PHP ${savedDeliveryDetails.certFee})
            <br>
            <em class="fee-sublabel">Certificate Fees</em>
          </span>
          <span class="fee-amount">PHP ${savedDeliveryDetails.certFee.toFixed(2)}</span>
        </div>
        ${
          savedDeliveryDetails.deliveryOption === "delivery"
            ? `
          <div class="fee-row">
            <span class="fee-label">
              Bayad sa Paghahatid
              <br>
              <em class="fee-sublabel">Delivery Fee</em>
            </span>
            <span class="fee-amount">PHP ${savedDeliveryDetails.deliveryFee.toFixed(2)}</span>
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
            <strong>PHP ${FormState.unifiedDeliveryDetails.totalAmount.toFixed(2)}</strong>
          </span>
        </div>
      </div>
    </div>
  </div>
`

summaryContent.innerHTML = requestsHtml + deliveryHtml + feeHtml;
  }
    

// Example usage:


  function confirmAllRequests() {
       
const savedRequestData = JSON.parse(localStorage.getItem("requestData")) || [];
    // Prepare final data structure
    const finalData = {
      requests: savedRequestData,
      deliveryDetails: FormState.unifiedDeliveryDetails
    }

    // Save to localStorage
    localStorage.setItem("submittedCertificateRequests", JSON.stringify(finalData))


    // Redirect to acknowledgement page
    sessionStorage.removeItem("lastFormSection");  
    localStorage.removeItem("deliveryDetails")
    localStorage.removeItem("allCertificateRequests")
    window.location.href = "../../acknowledgement-request-certificate-user.html"    
  }

  function cancelAllRequests() {
    if (confirm("Sigurado ba kayong gusto ninyong kanselahin ang lahat ng kahilingan?")) {
      // Get from localStorage
      localStorage.removeItem("deliveryDetails")
      localStorage.removeItem("allCertificateRequests")
      sessionStorage.removeItem("lastFormSection")
      window.location.href = "../../dashboard-user.html"
    }
  }

  function showSection(section,) {
    if (section === FormState.sections.requestForm) {     
    sessionStorage.setItem("lastFormSection", 0); 
    } else if (section === FormState.sections.requestsReview ){  
    sessionStorage.setItem("lastFormSection", 2); 
     } else if (section === FormState.sections.unifiedDelivery){
    sessionStorage.setItem("lastFormSection", 3); 
     } else if (section === FormState.sections.finalSummary){   
       sessionStorage.setItem("lastFormSection", 4); 
     }
     
     // Default section
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
    FormState.fields.birthProvince.value = request.birthProvince
    FormState.fields.birthCity.value = request.birthCity
    FormState.fields.birthDistrict.value = request.birthDistrict

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
    showNotification("Nai-load na ang kahilingan para sa pag-edit.")
  }
    
}) 

