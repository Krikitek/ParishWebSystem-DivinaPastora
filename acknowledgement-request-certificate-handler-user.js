document.addEventListener("DOMContentLoaded", () => {
  // Get submitted request data
  const submittedData = JSON.parse(localStorage.getItem("submittedCertificateRequests") || "{}")

  // Generate reference number if not exists
  let referenceNumber = submittedData.referenceNumber
  if (!referenceNumber) {
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "")
    const timeStr = now.getTime().toString().slice(-4)
    const certType = submittedData.requests?.[0]?.certificateType === "KUMPIL" ? "CONF" : "BAPT"
    referenceNumber = `${certType}-${dateStr}-${timeStr}`
  }

  // Store request in admin system
  storeRequestInAdminSystem(submittedData, referenceNumber)

  // Initialize acknowledgement page
  initializeAcknowledgement(submittedData, referenceNumber)

  // Set up auto-refresh
  setupAutoRefresh(referenceNumber)

  // Set up event listeners
  setupEventListeners(referenceNumber)
})

function storeRequestInAdminSystem(submittedData, referenceNumber) {
  try {
    // Get existing admin requests
    const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")

    // Create admin request object
    const adminRequest = {
      id: Date.now(),
      refNumber: referenceNumber,
      dateRequested: new Date().toISOString().split("T")[0],
      status: "pending",
      certificateType: submittedData.requests?.[0]?.certificateType || "BAPTISMAL",
      requestType: "SERTIPIKASYON",
      numberOfCopies: "1",
      name: submittedData.requests?.[0]
        ? `${submittedData.requests[0].lastName}, ${submittedData.requests[0].firstName} ${submittedData.requests[0].middleName || ""}`.trim()
        : "Unknown",
      dateOfBirth: submittedData.requests?.[0]?.dateOfBirth || "",
      birthCity: submittedData.requests?.[0]?.birthCity || "",
      birthProvince: submittedData.requests?.[0]?.birthProvince || "",
      birthCountry: submittedData.requests?.[0]?.birthCountry || "",
      sacramentDate: submittedData.requests?.[0]?.sacramentDate || "",
      sex: submittedData.requests?.[0]?.sex || "Male",
      fatherName: submittedData.requests?.[0]?.fatherName || "",
      motherName: submittedData.requests?.[0]?.motherName || "",
      sponsorName: submittedData.requests?.[0]?.sponsorName || "",
      relationship: submittedData.requests?.[0]?.relationship || "",
      purpose: submittedData.requests?.[0]?.purpose || "",
      mobile: submittedData.requests?.[0]?.mobileNumber || "",
      email: submittedData.requests?.[0]?.emailAddress || "",
      deliveryMethod: submittedData.deliveryDetails?.deliveryOption === "pickup" ? "Pickup" : "Delivery",
      deliveryAddress:
        submittedData.deliveryDetails?.deliveryOption === "delivery"
          ? submittedData.deliveryDetails?.addressLine1 || ""
          : "",
      pickupDate: submittedData.deliveryDetails?.pickupDate || "",
      pickupContact: submittedData.deliveryDetails?.pickupContactNumber || "",
      totalAmount: submittedData.totalAmount || 100,
      submittedAt: new Date().toISOString(),
      paymentStatus: "PENDING",
    }

    // Add to admin requests
    adminRequests.push(adminRequest)

    // Save to localStorage
    localStorage.setItem("adminRequests", JSON.stringify(adminRequests))

    console.log("Request stored in admin system:", referenceNumber)
  } catch (error) {
    console.error("Error storing request in admin system:", error)
  }
}

function initializeAcknowledgement(submittedData, referenceNumber) {
  // Update reference number
  document.getElementById("reference-number").textContent = referenceNumber

  // Update certificate type
  const certificateType = submittedData.requests?.[0]?.certificateType || "BAPTISMAL"
  const certificateTypeDisplay = certificateType === "KUMPIL" ? "Confirmation Certificate" : "Baptismal Certificate"
  document.getElementById("certificate-type").textContent = certificateTypeDisplay

  // Update requester name
  const requesterName = submittedData.requests?.[0]
    ? `${submittedData.requests[0].firstName} ${submittedData.requests[0].lastName}`
    : "Unknown"
  document.getElementById("requester-name").textContent = requesterName

  // Update date submitted
  const dateSubmitted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  document.getElementById("date-submitted").textContent = dateSubmitted

  // Update purpose
  const purpose = submittedData.requests?.[0]?.purpose || "Not specified"
  document.getElementById("purpose").textContent = purpose

  // Initial status is pending
  updateStatusDisplay("pending")
}

function updateStatusDisplay(status, rejectionReason = "") {
  const statusHeader = document.getElementById("status-header")
  const statusIcon = document.getElementById("status-icon")
  const statusTitle = document.getElementById("status-title")
  const statusMessage = document.getElementById("status-message")
  const statusMessageEnglish = document.getElementById("status-message-english")
  const currentStatusElement = document.getElementById("current-status")
  const step4Progress = document.getElementById("step-4-progress")
  const step5Progress = document.getElementById("step-5-progress")
  const printBtn = document.getElementById("print-acknowledgement-btn")
  const paymentBtn = document.getElementById("proceed-payment-btn")

  // Remove existing status classes
  statusHeader.className = "status-header"

  switch (status) {
    case "pending":
      statusHeader.classList.add("status-pending")
      statusIcon.innerHTML = '<i class="fas fa-clock"></i>'
      statusTitle.textContent = "Nakatanggap ng Kahilingan"
      statusMessage.textContent = "Ang inyong kahilingan ay nakatanggap na at naghihintay ng pag-apruba ng admin."
      statusMessageEnglish.textContent = "Your request has been received and is waiting for admin approval."
      currentStatusElement.textContent = "PENDING"

      // Progress steps
      step4Progress.classList.add("active")
      step4Progress.classList.remove("completed")
      step5Progress.classList.remove("active", "completed")

      // Hide action buttons
      printBtn.style.display = "none"
      paymentBtn.style.display = "none"
      break

    case "approved":
      statusHeader.classList.add("status-approved")
      statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>'
      statusTitle.textContent = "Aprubado ang Kahilingan"
      statusMessage.textContent =
        "Ang inyong kahilingan ay aprubado na! Maaari na ninyong i-print ang acknowledgement at magpatuloy sa bayad."
      statusMessageEnglish.textContent =
        "Your request has been approved! You can now print the acknowledgement and proceed to payment."
      currentStatusElement.textContent = "APPROVED"

      // Progress steps
      step4Progress.classList.add("completed")
      step4Progress.classList.remove("active")
      step5Progress.classList.add("active")

      // Show action buttons
      printBtn.style.display = "inline-flex"
      paymentBtn.style.display = "inline-flex"
      break

    case "rejected":
      statusHeader.classList.add("status-rejected")
      statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>'
      statusTitle.textContent = "Hindi Aprubado ang Kahilingan"
      statusMessage.textContent =
        rejectionReason ||
        "Ang inyong kahilingan ay hindi aprubado. Mangyaring makipag-ugnayan sa admin para sa karagdagang impormasyon."
      statusMessageEnglish.textContent =
        "Your request has been rejected. Please contact the admin for more information."
      currentStatusElement.textContent = "REJECTED"

      // Progress steps
      step4Progress.classList.add("active")
      step4Progress.classList.remove("completed")
      step5Progress.classList.remove("active", "completed")

      // Hide action buttons
      printBtn.style.display = "none"
      paymentBtn.style.display = "none"
      break

    case "paid":
      statusHeader.classList.add("status-approved")
      statusIcon.innerHTML = '<i class="fas fa-credit-card"></i>'
      statusTitle.textContent = "Bayad na ang Kahilingan"
      statusMessage.textContent = "Ang inyong kahilingan ay bayad na at pinoproseso na ang sertipiko."
      statusMessageEnglish.textContent = "Your request has been paid and the certificate is being processed."
      currentStatusElement.textContent = "PAID"

      // Progress steps
      step4Progress.classList.add("completed")
      step4Progress.classList.remove("active")
      step5Progress.classList.add("completed")
      step5Progress.classList.remove("active")

      // Show print button only
      printBtn.style.display = "inline-flex"
      paymentBtn.style.display = "none"
      break

    case "completed":
      statusHeader.classList.add("status-approved")
      statusIcon.innerHTML = '<i class="fas fa-certificate"></i>'
      statusTitle.textContent = "Tapos na ang Kahilingan"
      statusMessage.textContent = "Ang inyong sertipiko ay handa na! Maaari na ninyong kunin o makakakuha ng kopya."
      statusMessageEnglish.textContent = "Your certificate is ready! You can now collect it or get a copy."
      currentStatusElement.textContent = "COMPLETED"

      // Progress steps
      step4Progress.classList.add("completed")
      step5Progress.classList.add("completed")

      // Show print button only
      printBtn.style.display = "inline-flex"
      paymentBtn.style.display = "none"
      break
  }
}

function setupAutoRefresh(referenceNumber) {
  // Check status every 30 seconds
  setInterval(() => {
    checkRequestStatus(referenceNumber)
  }, 30000)

  // Initial status check
  checkRequestStatus(referenceNumber)
}

function checkRequestStatus(referenceNumber) {
  try {
    // Get admin requests
    const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")

    // Find the request
    const request = adminRequests.find((req) => req.refNumber === referenceNumber)

    if (request) {
      updateStatusDisplay(request.status, request.rejectionReason)
    }
  } catch (error) {
    console.error("Error checking request status:", error)
  }
}

function setupEventListeners(referenceNumber) {
  // Refresh status button
  const refreshBtn = document.getElementById("refresh-status-btn")
  refreshBtn.addEventListener("click", () => {
    // Add loading spinner
    const originalContent = refreshBtn.innerHTML
    refreshBtn.innerHTML = '<div class="loading-spinner"></div> Checking...'
    refreshBtn.disabled = true

    setTimeout(() => {
      checkRequestStatus(referenceNumber)
      refreshBtn.innerHTML = originalContent
      refreshBtn.disabled = false
    }, 1000)
  })

  // Print acknowledgement button
  const printBtn = document.getElementById("print-acknowledgement-btn")
  printBtn.addEventListener("click", () => {
    printAcknowledgement(referenceNumber)
  })

  // Proceed to payment button
  const paymentBtn = document.getElementById("proceed-payment-btn")
  paymentBtn.addEventListener("click", () => {
    // Store reference number for payment page
    localStorage.setItem("paymentReferenceNumber", referenceNumber)
    window.location.href = "payment-user-request-certificate.html"
  })
}

function printAcknowledgement(referenceNumber) {
  // Get request details
  const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")
  const request = adminRequests.find((req) => req.refNumber === referenceNumber)

  if (!request) {
    alert("Request details not found")
    return
  }

  // Populate print content
  const printContent = document.getElementById("print-content")
  const printDate = document.getElementById("print-date")

  printDate.textContent = new Date().toLocaleString()

  printContent.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h3>Request Acknowledgement</h3>
      <p><strong>Reference Number:</strong> ${request.refNumber}</p>
      <p><strong>Status:</strong> ${request.status.toUpperCase()}</p>
      <p><strong>Date Approved:</strong> ${request.dateApproved || "N/A"}</p>
    </div>
    
    <div style="margin-bottom: 2rem;">
      <h4>Certificate Details</h4>
      <p><strong>Type:</strong> ${request.certificateType === "KUMPIL" ? "Confirmation Certificate" : "Baptismal Certificate"}</p>
      <p><strong>Requester:</strong> ${request.name}</p>
      <p><strong>Purpose:</strong> ${request.purpose}</p>
      <p><strong>Date of Birth:</strong> ${request.dateOfBirth}</p>
      <p><strong>Place of Birth:</strong> ${request.birthCity}, ${request.birthProvince}</p>
    </div>
    
    <div style="margin-bottom: 2rem;">
      <h4>Contact Information</h4>
      <p><strong>Mobile:</strong> ${request.mobile}</p>
      <p><strong>Email:</strong> ${request.email}</p>
    </div>
    
    <div style="margin-bottom: 2rem;">
      <h4>Delivery Information</h4>
      <p><strong>Method:</strong> ${request.deliveryMethod}</p>
      ${
        request.deliveryMethod === "Delivery"
          ? `<p><strong>Address:</strong> ${request.deliveryAddress}</p>`
          : `<p><strong>Pickup Date:</strong> ${request.pickupDate}</p>`
      }
    </div>
    
    <div style="border-top: 2px solid #333; padding-top: 1rem; margin-top: 2rem;">
      <p><strong>This acknowledgement confirms that your certificate request has been approved and is ready for payment processing.</strong></p>
      <p>Please keep this acknowledgement for your records.</p>
    </div>
  `

  // Print
  window.print()
}
