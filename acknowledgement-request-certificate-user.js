document.addEventListener("DOMContentLoaded", () => {
  // Initialize the acknowledgement page
  initAcknowledgement()

  // Set up event listeners
  setupEventListeners()
})

function initAcknowledgement() {
  // Get request data from localStorage
  const requestData = JSON.parse(localStorage.getItem("baptismRequestData") || "{}")

  // Get certificate type for consistent labeling
  const certificateType = getCertificateTypeFromData(requestData)

  // Update progress step labels to match summary formatting
  updateProgressStepLabels(certificateType)

  // Add bilingual headers throughout the acknowledgement page
  addBilingualHeaders(certificateType)

  // Check if we have a reference number already
  let referenceNumber = requestData.referenceNumber

  // If no reference number exists, generate one and save it
  if (!referenceNumber) {
    referenceNumber = generateReferenceNumber()
    requestData.referenceNumber = referenceNumber
    requestData.status = "pending" // Initial status is pending
    requestData.dateSubmitted = new Date().toISOString()
    localStorage.setItem("baptismRequestData", JSON.stringify(requestData))

    // Also save to adminRequests for admin dashboard
    saveToAdminRequests(requestData, referenceNumber)
  }

  // Display the reference number
  updateElement("reference-number", referenceNumber)

  // Check and display the current status
  const currentStatus = getCurrentStatus(requestData, referenceNumber)
  updateStatusDisplay(currentStatus, certificateType, requestData)
}

function getCurrentStatus(requestData, referenceNumber) {
  // Check admin requests for the latest status
  const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")
  const adminRequest = adminRequests.find((req) => req.refNumber === referenceNumber)

  if (adminRequest) {
    // Update local data with admin decision
    if (adminRequest.status !== requestData.status) {
      requestData.status = adminRequest.status
      requestData.paymentStatus = adminRequest.paymentStatus || adminRequest.status
      requestData.adminNotes = adminRequest.adminNotes || adminRequest.notes || ""
      requestData.dateApproved = adminRequest.dateApproved
      requestData.dateRejected = adminRequest.dateRejected
      localStorage.setItem("baptismRequestData", JSON.stringify(requestData))
    }
    return adminRequest.status
  }

  return requestData.status || "pending"
}

function updateProgressStepLabels(certType) {
  const certificateNameFilipino = certType === "KUMPIL" ? "KUMPIL" : "BINYAG"
  const certificateNameEnglish = certType === "KUMPIL" ? "Confirmation" : "Baptism"

  // Update step labels to match unified-certificate-form.js formatting
  const stepLabels = document.querySelectorAll(".step-label")
  stepLabels.forEach((label) => {
    // Step 1: Mga Detalye ng Kahilingan
    if (label.textContent.includes("Mga Detalye ng Kahilingan")) {
      label.innerHTML = `Mga Detalye ng Kahilingan - ${certificateNameFilipino}<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Request Details - ${certificateNameEnglish})
        </span>`
    }
    // Step 2: Mga Detalye ng Paghahatid
    else if (
      label.textContent.includes("Detalye ng Paghahatid") ||
      label.textContent.includes("Mga Detalye ng Paghahatid")
    ) {
      label.innerHTML = `Mga Detalye ng Paghahatid<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Delivery Details)
        </span>`
    }
    // Step 3: Buod
    else if (label.textContent.trim() === "Buod") {
      label.innerHTML = `Buod<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Summary)
        </span>`
    }
    // Step 4: Pagkilala (Acknowledgement)
    else if (label.textContent.trim() === "Kumpirmasyon" || label.textContent.trim() === "Pagkilala") {
      label.innerHTML = `Pagkilala<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Acknowledgement)
        </span>`
    }
    // Step 5: Bayad
    else if (label.textContent.trim() === "Bayad") {
      label.innerHTML = `Bayad<br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          (Payment)
        </span>`
    }
  })
}

function addBilingualHeaders(certType) {
  // Add English translations to main headers following summary.js pattern
  
  // Reference Number header
  const refNumberHeader = document.querySelector("h2, h3")
  if (refNumberHeader && refNumberHeader.textContent.includes("NUMERO NG SANGGUNIAN")) {
    if (!refNumberHeader.querySelector(".en-label")) {
      const en = document.createElement("div")
      en.className = "en-label"
      en.innerHTML = "(Reference Number)"
      en.style.fontSize = "0.9em"
      en.style.fontStyle = "italic"
      en.style.color = "#555"
      refNumberHeader.appendChild(en)
    }
  }

  // Status header
  const statusHeaders = document.querySelectorAll("th, .status-label")
  statusHeaders.forEach((header) => {
    if (header.textContent.includes("KATAYUAN") && !header.querySelector(".en-label")) {
      const en = document.createElement("div")
      en.className = "en-label"
      en.innerHTML = "(Status)"
      en.style.fontSize = "0.9em"
      en.style.fontStyle = "italic"
      en.style.color = "#555"
      header.appendChild(en)
    }
  })

  // Certificate Type header
  const certTypeHeaders = document.querySelectorAll("th, .cert-type-label")
  certTypeHeaders.forEach((header) => {
    if (header.textContent.includes("URI NG SERTIPIKO") && !header.querySelector(".en-label")) {
      const en = document.createElement("div")
      en.className = "en-label"
      en.innerHTML = "(Type of Certificate)"
      en.style.fontSize = "0.9em"
      en.style.fontStyle = "italic"
      en.style.color = "#555"
      header.appendChild(en)
    }
  })

  // Date Submitted header
  const dateHeaders = document.querySelectorAll("th, .date-label")
  dateHeaders.forEach((header) => {
    if (header.textContent.includes("PETSA NG PAGSUSUMITE") && !header.querySelector(".en-label")) {
      const en = document.createElement("div")
      en.className = "en-label"
      en.innerHTML = "(Date Submitted)"
      en.style.fontSize = "0.9em"
      en.style.fontStyle = "italic"
      en.style.color = "#555"
      header.appendChild(en)
    }
  })

  // Instructions header
  const instructionHeaders = document.querySelectorAll("h3, .instruction-header")
  instructionHeaders.forEach((header) => {
    if (header.textContent.includes("MGA TAGUBILIN") && !header.querySelector(".en-label")) {
      const en = document.createElement("div")
      en.className = "en-label"
      en.innerHTML = "(Instructions)"
      en.style.fontSize = "0.9em"
      en.style.fontStyle = "italic"
      en.style.color = "#555"
      header.appendChild(en)
    }
  })
}

function generateReferenceNumber() {
  // Generate a unique reference number with format: REF-YYYYMMDD-XXXX
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")

  return `REF-${year}${month}${day}-${random}`
}

function getCertificateTypeFromData(requestData) {
  // Check multiple possible locations for certificate type
  if (requestData.requestDetails?.certificateType) {
    return requestData.requestDetails.certificateType.toUpperCase()
  }

  // Check if it's stored in a different location
  if (requestData.certificateType) {
    return requestData.certificateType.toUpperCase()
  }

  // Check localStorage for current form data
  const currentFormData = JSON.parse(localStorage.getItem("currentFormData") || "{}")
  if (currentFormData.certificateType) {
    return currentFormData.certificateType.toUpperCase()
  }

  // Default to BINYAG only if absolutely no type is found
  return "BINYAG"
}

function saveToAdminRequests(requestData, referenceNumber) {
  // Get existing admin requests or initialize empty array
  const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")

  // Create admin request object with consistent formatting
  const adminRequest = {
    id: adminRequests.length + 1,
    refNumber: referenceNumber,
    dateRequested: new Date().toISOString().split("T")[0],
    status: "pending",
    paymentStatus: "pending",
    certificateType: getCertificateTypeFromData(requestData),
    requestType: "SERTIPIKASYON",
    numberOfCopies: requestData.requestDetails?.numberOfCopies || "1",
    name: formatName(
      requestData.requestDetails?.lastName,
      requestData.requestDetails?.firstName,
      requestData.requestDetails?.middleName,
    ),
    firstName: requestData.requestDetails?.firstName || "",
    lastName: requestData.requestDetails?.lastName || "",
    middleName: requestData.requestDetails?.middleName || "",
    dateOfBirth: requestData.requestDetails?.dateOfBirth || "",
    birthCountry: requestData.requestDetails?.birthCountry || "",
    birthProvince: requestData.requestDetails?.birthProvince || "",
    birthCity: requestData.requestDetails?.birthCity || "",
    sacramentDate: requestData.requestDetails?.sacramentDate || "",
    sex: requestData.requestDetails?.sex || "Male",
    fatherName: formatName(
      requestData.requestDetails?.fatherLastName,
      requestData.requestDetails?.fatherFirstName,
      requestData.requestDetails?.fatherMiddleName,
    ),
    motherName: formatName(
      requestData.requestDetails?.motherLastName,
      requestData.requestDetails?.motherFirstName,
      requestData.requestDetails?.motherMiddleName,
    ),
    sponsorName: requestData.requestDetails?.certificateType === "KUMPIL" 
      ? formatName(
          requestData.requestDetails?.sponsorLastName,
          requestData.requestDetails?.sponsorFirstName,
          requestData.requestDetails?.sponsorMiddleName,
        )
      : "",
    relationship: requestData.requestDetails?.relationship || "",
    purpose: requestData.requestDetails?.purpose || "",
    mobile: requestData.requesterMobile || "",
    email: requestData.requesterEmail || "",
    deliveryMethod: requestData.deliveryDetails?.deliveryOption === "pickup" ? "PICK UP" : "PAGHAHATID",
    deliveryAddress:
      requestData.deliveryDetails?.deliveryOption === "delivery"
        ? formatDeliveryAddress(requestData.deliveryDetails)
        : "OPISINA NG PAROKYA",
    pickupDate: requestData.deliveryDetails?.pickupDate || "",
    pickupContact: requestData.deliveryDetails?.pickupContactNumber || "",
    dateApproved: null,
    dateRejected: null,
    dateCompleted: null,
    notes: "",
    adminNotes: "",
  }

  // Add to admin requests
  adminRequests.push(adminRequest)

  // Save back to localStorage
  localStorage.setItem("adminRequests", JSON.stringify(adminRequests))
}

function updateStatusDisplay(status, certType, requestData) {
  const statusElement = document.getElementById("request-status")
  const actionButtonsContainer = document.getElementById("action-buttons")

  // Clear existing buttons
  if (actionButtonsContainer) {
    actionButtonsContainer.innerHTML = ""
  }

  // Update status badge with bilingual format following summary.js pattern
  let statusText = ""
  const certificateNameFilipino = certType === "KUMPIL" ? "KUMPIL" : "BINYAG"
  const certificateNameEnglish = certType === "KUMPIL" ? "Confirmation" : "Baptism"

  if (status === "approved") {
    statusText = "INAPRUBAHAN"
    // Add English translation
    const englishStatus = document.createElement("div")
    englishStatus.innerHTML = "(Approved)"
    englishStatus.style.fontSize = "0.9em"
    englishStatus.style.fontStyle = "italic"
    englishStatus.style.color = "#155724"
    if (statusElement) {
      statusElement.textContent = statusText
      statusElement.className = "status-badge approved"
      statusElement.appendChild(englishStatus)
    }

    // Show proceed to payment button
    if (actionButtonsContainer) {
      const paymentButton = document.createElement("button")
      paymentButton.className = "action-button payment-button"
      paymentButton.innerHTML = `
        <i class="fas fa-credit-card"></i> 
        Magpatuloy sa Bayad
        <div style="font-size: 0.8em; font-style: italic;">(Proceed to Payment)</div>
      `
      paymentButton.addEventListener("click", proceedToPayment)
      actionButtonsContainer.appendChild(paymentButton)

      // Add print acknowledgement button
      const printButton = document.createElement("button")
      printButton.className = "action-button print-button"
      printButton.innerHTML = `
        <i class="fas fa-print"></i> 
        I-print ang Pagkilala
        <div style="font-size: 0.8em; font-style: italic;">(Print Acknowledgement)</div>
      `
      printButton.addEventListener("click", printAcknowledgement)
      actionButtonsContainer.appendChild(printButton)
    }

  } else if (status === "pending") {
    statusText = "NAKABIMBIN"
    // Add English translation
    const englishStatus = document.createElement("div")
    englishStatus.innerHTML = "(Pending)"
    englishStatus.style.fontSize = "0.9em"
    englishStatus.style.fontStyle = "italic"
    englishStatus.style.color = "#856404"
    if (statusElement) {
      statusElement.textContent = statusText
      statusElement.className = "status-badge pending"
      statusElement.appendChild(englishStatus)
    }

    // Show waiting message
    if (actionButtonsContainer) {
      const waitingMessage = document.createElement("div")
      waitingMessage.className = "waiting-message"
      waitingMessage.innerHTML = `
        <p><strong>Ang inyong kahilingan ay nasa review pa ng admin.</strong></p>
        <p style="font-style: italic; color: #666;">(Your request is under admin review.)</p>
        <p><strong>Mangyaring maghintay ng kumpirmasyon.</strong></p>
        <p style="font-style: italic; color: #666;">(Please wait for confirmation.)</p>
      `
      actionButtonsContainer.appendChild(waitingMessage)
    }

  } else if (status === "rejected") {
    statusText = "ITINANGGI"
    // Add English translation
    const englishStatus = document.createElement("div")
    englishStatus.innerHTML = "(Rejected)"
    englishStatus.style.fontSize = "0.9em"
    englishStatus.style.fontStyle = "italic"
    englishStatus.style.color = "#721c24"
    if (statusElement) {
      statusElement.textContent = statusText
      statusElement.className = "status-badge rejected"
      statusElement.appendChild(englishStatus)
    }

    // Show rejection message with bilingual text
    if (actionButtonsContainer) {
      const rejectedMessage = document.createElement("div")
      rejectedMessage.className = "rejected-message"
      rejectedMessage.innerHTML = `
        <p><strong>Ikinalulungkot namin na ang inyong kahilingan ay itinanggi.</strong></p>
        <p style="font-style: italic; color: #666;">(We regret to inform you that your request has been rejected.)</p>
        <p><strong>Para sa karagdagang impormasyon, makipag-ugnayan sa aming opisina.</strong></p>
        <p style="font-style: italic; color: #666;">(For more information, please contact our office.)</p>
        ${requestData.adminNotes ? `<p><strong>Admin Notes:</strong> ${requestData.adminNotes}</p>` : ''}
      `
      actionButtonsContainer.appendChild(rejectedMessage)
    }

  } else if (status === "paid" || status === "completed") {
    statusText = status === "paid" ? "NABAYAD" : "TAPOS NA"
    // Add English translation
    const englishStatus = document.createElement("div")
    englishStatus.innerHTML = status === "paid" ? "(Paid)" : "(Completed)"
    englishStatus.style.fontSize = "0.9em"
    englishStatus.style.fontStyle = "italic"
    englishStatus.style.color = "#155724"
    if (statusElement) {
      statusElement.textContent = statusText
      statusElement.className = "status-badge paid"
      statusElement.appendChild(englishStatus)
    }

    // Show completion message
    if (actionButtonsContainer) {
      const completionMessage = document.createElement("div")
      completionMessage.className = "completion-message"
      completionMessage.innerHTML = `
        <p><strong>Salamat sa inyong bayad. Ang inyong sertipiko ay ihahanda na.</strong></p>
        <p style="font-style: italic; color: #666;">(Thank you for your payment. Your certificate will be prepared.)</p>
      `
      actionButtonsContainer.appendChild(completionMessage)

      // Add print receipt button if paid
      if (status === "paid") {
        const printButton = document.createElement("button")
        printButton.className = "action-button print-button"
        printButton.innerHTML = `
          <i class="fas fa-print"></i> 
          I-print ang Resibo
          <div style="font-size: 0.8em; font-style: italic;">(Print Receipt)</div>
        `
        printButton.addEventListener("click", printAcknowledgement)
        actionButtonsContainer.appendChild(printButton)
      }
    }
  }
}

function setupEventListeners() {
  // Check for status updates every 5 seconds
  setInterval(checkForStatusUpdates, 5000)
}

function checkForStatusUpdates() {
  // Get request data from localStorage
  const requestData = JSON.parse(localStorage.getItem("baptismRequestData") || "{}")

  // Get reference number
  const referenceNumber = requestData.referenceNumber

  if (!referenceNumber) return

  // Check admin requests for status updates
  const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")
  const adminRequest = adminRequests.find((req) => req.refNumber === referenceNumber)

  if (adminRequest && (adminRequest.status !== requestData.status || adminRequest.paymentStatus !== requestData.paymentStatus)) {
    // Update local status
    requestData.status = adminRequest.status
    requestData.paymentStatus = adminRequest.paymentStatus || adminRequest.status
    requestData.adminNotes = adminRequest.adminNotes || adminRequest.notes || ""
    localStorage.setItem("baptismRequestData", JSON.stringify(requestData))

    // Update UI with certificate type
    const certType = getCertificateTypeFromData(requestData)
    updateStatusDisplay(adminRequest.status, certType, requestData)
  }
}

function printAcknowledgement() {
  const requestData = JSON.parse(localStorage.getItem("baptismRequestData") || "{}")
  const certType = getCertificateTypeFromData(requestData)

  // Create print window with bilingual content
  const printWindow = window.open("", "_blank")
  const currentDate = new Date()

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Acknowledgement Receipt / Resibo ng Pagkilala</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
            }
            .receipt {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ccc;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .header .subtitle {
                font-style: italic;
                color: #666;
                font-size: 18px;
            }
            .reference {
                font-size: 24px;
                font-weight: bold;
                color: #5271ff;
                margin: 20px 0;
                text-align: center;
            }
            .reference .subtitle {
                font-size: 18px;
                font-style: italic;
                color: #666;
            }
            .details {
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                margin-bottom: 10px;
            }
            .detail-label {
                font-weight: bold;
                width: 250px;
            }
            .detail-label .en {
                font-weight: normal;
                font-style: italic;
                color: #666;
                font-size: 0.9em;
            }
            .status {
                text-align: center;
                margin: 20px 0;
                font-size: 18px;
                font-weight: bold;
                color: #155724;
                background-color: #d4edda;
                padding: 10px;
                border-radius: 4px;
            }
            .status .subtitle {
                font-style: italic;
                color: #155724;
                font-size: 14px;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 14px;
                color: #666;
            }
            @media print {
                .no-print {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <h1>Chronos - Resibo ng Pagkilala</h1>
                <div class="subtitle">(Acknowledgement Receipt)</div>
                <p>Divina Pastora Parish</p>
            </div>
            
            <div class="reference">
                Numero ng Sanggunian: ${requestData.referenceNumber}
                <div class="subtitle">(Reference Number)</div>
            </div>
            
            <div class="status">
                Katayuan: ${requestData.status ? requestData.status.toUpperCase() : 'PENDING'}
                <div class="subtitle">(Status: ${requestData.status ? requestData.status.toUpperCase() : 'PENDING'})</div>
            </div>
            
            <div class="details">
                <div class="detail-row">
                    <div class="detail-label">
                        Pangalan: <span class="en">(Name)</span>
                    </div>
                    <div>${formatName(
                      requestData.requestDetails?.lastName,
                      requestData.requestDetails?.firstName,
                      requestData.requestDetails?.middleName,
                    )}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        Uri ng Sertipiko: <span class="en">(Certificate Type)</span>
                    </div>
                    <div>${certType === "KUMPIL" ? "KUMPIL (Confirmation)" : "BINYAG (Baptism)"}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        Petsa ng Pagsusumite: <span class="en">(Date Requested)</span>
                    </div>
                    <div>${new Date(requestData.dateSubmitted).toLocaleDateString()}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        Bilang ng Kopya: <span class="en">(Number of Copies)</span>
                    </div>
                    <div>${requestData.requestDetails?.numberOfCopies || "1"}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        Layunin: <span class="en">(Purpose)</span>
                    </div>
                    <div>${requestData.requestDetails?.purpose || ""}</div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Ito ay opisyal na resibo ng pagkilala mula sa Chronos System.</strong></p>
                <p style="font-style: italic;">(This is an official acknowledgement receipt from Chronos System.)</p>
                <p>Petsa ng Pag-print / Date Printed: ${currentDate.toLocaleString()}</p>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()">I-print ang Resibo / Print Receipt</button>
            </div>
        </div>
        
        <script>
            // Auto print
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        </script>
    </body>
    </html>
  `)

  printWindow.document.close()
}

function proceedToPayment() {
  // Redirect to payment page
  window.location.href = "payment-user-request-certificate.html"
}

// Utility functions - consistent with summary.js formatting
function updateElement(id, value) {
  const element = document.getElementById(id)
  if (element && value !== undefined && value !== null) {
    element.textContent = value
  }
}

function formatName(lastName, firstName, middleName) {
  if (!lastName || !firstName) return ""
  const middle = middleName ? ` ${middleName.toUpperCase()}` : ""
  return `${lastName.toUpperCase()}, ${firstName.toUpperCase()}${middle}`
}

function formatLocation(city, province) {
  const parts = [city, province].filter(Boolean)
  return parts.join(", ")
}

function formatDate(date) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }
  return date.toLocaleDateString("tl-PH", options)
}

function formatDeliveryAddress(delivery) {
  const parts = []
  if (delivery.addressLine1) parts.push(delivery.addressLine1)
  if (delivery.addressLine2) parts.push(delivery.addressLine2)
  if (delivery.deliveryBarangay) parts.push(delivery.deliveryBarangay)
  if (delivery.deliveryCity) parts.push(delivery.deliveryCity)
  if (delivery.deliveryProvince) parts.push(delivery.deliveryProvince)
  if (delivery.zipCode) parts.push(delivery.zipCode)
  return parts.join(", ")
}
