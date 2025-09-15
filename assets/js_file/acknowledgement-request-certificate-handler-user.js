const loadingOverlay = document.getElementById("loading-overlay")
loadingOverlay.style.display = 'flex'
document.addEventListener("DOMContentLoaded", () => {
    

    setupEventListeners();
    saveAllRequests();
});

function fetchRequests(storedRequestID) {
  localStorage.removeItem("submittedCertificateRequests");

  fetch(`/assets/php_file/getAcknowledgedRequests.php?requestID=${storedRequestID}`, {
    method: 'GET',
    credentials: 'include'  // ✅ ensures PHP session cookie is sent
  })
    .then(response => response.json())
    .then(result => {
      if (result.success && result.data) {
         localStorage.setItem("currentRequestID", result.requestID);
        initializeAcknowledgement(result.data); // ✅ pass single object
      } else {
        loadingOverlay.style.display = 'none';
        console.error("No requests found or an error occurred.");
      }
    })
    .catch(error => console.error('Error fetching requests:', error));
}


function initializeAcknowledgement(requestData) {
    loadingOverlay.style.display = 'none';
    document.getElementById("reference-number").textContent = requestData.paymentRef;

    const certificateTypeDisplay = requestData.certificateType === "Kumpil"
        ? "Confirmation Certificate"
        : "Baptismal Certificate";
    document.getElementById("certificate-type").textContent = certificateTypeDisplay;

    const requesterName = requestData.certificateType === 'Confirmation' || requestData.certificateType === 'Kumpil'
        ? `${requestData.confirmation_firstName} ${requestData.confirmation_lastName}`
        : `${requestData.baptism_firstName} ${requestData.baptism_lastName}`;
    document.getElementById("requester-name").textContent = requesterName;

    const dateSubmitted = new Date(requestData.dateRequested).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    document.getElementById("date-submitted").textContent = dateSubmitted;

    document.getElementById("purpose").textContent = requestData.purposeOfRequest;

    updateStatusDisplay(requestData.requestStatus);
}


  // Generate dynamic payment reference
function generatePaymentRef(certificateType) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const randomPart = Math.floor(100000 + Math.random() * 900000); // 6 random digits

    if (certificateType.toLowerCase() === "baptismal") {
        return `BAPT-${datePart}-${randomPart}`;
    } else if (certificateType.toLowerCase() === "confirmation") {
        return `CONF-${datePart}-${randomPart}`;
    } else {
        return `CERT-${datePart}-${randomPart}`; // Default fallback
    }
}

function saveAllRequests() {
    const submittedData = JSON.parse(localStorage.getItem("submittedCertificateRequests"));

    if (!submittedData || !submittedData.requests) {
        alert("✅ Naipadala ang inyong mga kahilingan!");
        const currentRequestID = localStorage.getItem("currentRequestID");
        fetchRequests(currentRequestID);
        return;
    }

    function unwrap(value) {
    if (Array.isArray(value)) return value[0] || "";
    return value || "";
}

    const requests = Array.isArray(submittedData.requests)
    ? submittedData.requests
    : [submittedData.requests];

    const deliveryDetails = submittedData.deliveryDetails || {};

     const dataToSend = requests.map((requestData) => {
    const fatherParts = (unwrap(requestData.fatherName) || "").split(" ");
    const motherParts = (unwrap(requestData.motherName) || "").split(" ");

    return {
        certificateType: unwrap(requestData.certificateType),
        certificateType: unwrap(requestData.certificateType),
        purposeOfRequest: unwrap(requestData.purpose),
        docDeliverAddress:
            deliveryDetails.deliveryOption === "delivery"
                ? unwrap(deliveryDetails.addressLine1)
                : "For Pickup",
        zipcode: unwrap(deliveryDetails.zipCode),
        pickupDate: unwrap(deliveryDetails.pickupDate),
        relationshipToTheDocumentOwner: unwrap(requestData.relationship),
        lastName: unwrap(requestData.lastName),
        firstName: unwrap(requestData.firstName),
        middleName: unwrap(requestData.middleName),
        dateOfSacrament: unwrap(requestData.sacramentDate),
        fatherLastName: fatherParts[2] || "",
        fatherFirstName: fatherParts[0] || "",
        fatherMiddleName: fatherParts[1] || "",
        motherMaidenName: motherParts[2] || "",
        motherFirstName: motherParts[0] || "",
        motherMiddleName: motherParts[1] || "",
        placeOfBirth: `${unwrap(requestData.birthDistrict)}, ${unwrap(requestData.birthCity)}, ${unwrap(requestData.birthProvince)}`,
        dateOfBirth: unwrap(requestData.dateOfBirth),
        paymentRef: generatePaymentRef((requestData.certificateType)),
        status: "pending",
        sex: unwrap(requestData.sex),
        amount: deliveryDetails.totalAmount,
    };
});

console.table(dataToSend);

    fetch('/assets/php_file/saveRequestCertificate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( dataToSend[0] ),
    })
    .then(response => response.json())
    .then(data => {

        if (data.success) {
            loadingOverlay.style.display = 'none';
            alert("✅ Matagumpay na naipadala ang inyong mga kahilingan!");
            fetchRequests();            
        } else {
            loadingOverlay.style.display = 'none';
            alert("⚠️ May naganap na error. Pakisubukang muli.");
            console.error('Error:', data.error);
        }
    })
    .catch((error) => {
        loadingOverlay.style.display = 'none';
        console.error('Network Error:', error);
        alert("⚠️ May naganap na error sa network. Pakisubukang muli.");
    });
}


function updateStatusDisplay(status, rejectionReason = "") {
  const statusHeader = document.getElementById("status-header")
  const statusIcon = document.getElementById("status-icon")
  const statusTitle = document.getElementById("status-title")
  const statusMessage = document.getElementById("status-message")
  const statusMessageEnglish = document.getElementById("status-message-english")
  const currentStatusElement = document.getElementById("current-status")
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

      // Hide action buttons
      printBtn.style.display = "none"
      paymentBtn.style.display = "none"
      break

    case "approved":
      statusHeader.classList.add("status-approved")
      statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>'
      statusTitle.textContent = "Aprubado ang Kahilingan"
      statusMessage.textContent =
        "Ang inyong kahilingan ay aprubado na! Maaari ka ng magpatuloy sa bayad upang makita online ang sertipiko."
      statusMessageEnglish.textContent =
        "Your request has been approved! You can now proceed to payment for certificate generation."
      currentStatusElement.textContent = "APPROVED"

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

      // Show print button only
      printBtn.style.display = "inline-flex"
      paymentBtn.style.display = "none"
      break
  }
}

function setupEventListeners() {
  const currentRequestID = localStorage.getItem("currentRequestID");
    const refreshBtn = document.getElementById("refresh-status-btn");
    refreshBtn.addEventListener("click", () => {
        const originalContent = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<div class="loading-spinner"></div> Checking...';
        refreshBtn.disabled = true;

        fetchRequests(currentRequestID);

        setTimeout(() => {
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
        }, 1000);
    });
}

const printBtn = document.getElementById("print-acknowledgement-btn")
  printBtn.addEventListener("click", () => {
    downloadAcknowledgement(referenceNumber)
  })

function downloadAcknowledgement(request) {

    // Create the summary content
    const content = `
Request Acknowledgement
======================
Reference Number: ${request.requestID}
Status: ${request.requestStatus}
Date Requested: ${request.dateRequested}

Certificate Details
------------------
Type: ${request.certificateType === "KUMPIL" ? "Confirmation Certificate" : "Baptismal Certificate"}
Requester: ${request.confirmation_firstName || request.baptism_firstName} ${request.confirmation_lastName || request.baptism_lastName}
Purpose: ${request.purposeOfRequest}
Date of Birth: ${request.dateOfBirth || "N/A"}
Place of Birth: ${request.birthCity || "N/A"}, ${request.birthProvince || "N/A"}

Payment Details
---------------
Amount: ${request.amount || "N/A"}
Payment Method: ${request.paymentMethod || "N/A"}
Payment Date: ${request.paymentDate || "N/A"}
Payment Status: ${request.status || "N/A"}

Delivery Information
--------------------
Method: ${request.docDeliverAddress ? "Delivery" : "Pickup"}
${request.docDeliverAddress ? `Address: ${request.docDeliverAddress}` : `Pickup Date: ${request.pickupDate || "N/A"}`}

====================
This acknowledgement confirms that your certificate request has been approved and is ready for payment processing.
Please keep this acknowledgement for your records.
`;

    // Create a Blob and a temporary download link
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Acknowledgement_${request.requestID}.txt`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

