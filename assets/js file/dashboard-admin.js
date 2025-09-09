document.addEventListener("DOMContentLoaded", () => {
          // Initialize the admin dashboard
          initAdminDashboard()

          // Load actual data from localStorage
          loadActualData()

          // Set up event listeners
          setupEventListeners()

          // Load settings
          loadSettings()

          // Initialize calendar
          initCalendar()

          // Preload images for certificate generation
          preloadImages()

          // Update certificate preview with default template
          updateCertificatePreview(true)

          // Load and display transactions
          loadTransactions()
        })

        // Global variables
        let allRequests = []
        let allTransactions = []
        let requestIdCounter = 1
        let calendarEvents = []
        const currentDate = new Date()
        let selectedDate = new Date()
        let selectedEventId = null

        // Image assets for certificate generation
        let imageAssets = {
          parishLogo:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eaaaa9b4-8947-4b49-bf39-9133a89f901a.jpg-oxUG8i2MhDNqYjCaFSgAyREgbILump.jpeg",
          parishSeal:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eaaaa9b4-8947-4b49-bf39-9133a89f901a.jpg-oxUG8i2MhDNqYjCaFSgAyREgbILump.jpeg",
          signature:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eaaaa9b4-8947-4b49-bf39-9133a89f901a.jpg-oxUG8i2MhDNqYjCaFSgAyREgbILump.jpeg",
        }

        // Default certificate data with placeholders
        const defaultCertificateData = {
          fullName: "[FULL NAME]",
          dateOfBirth: "[DATE OF BIRTH]",
          fatherName: "[FATHER'S NAME]",
          motherName: "[MOTHER'S NAME]",
          sponsor1: "[SPONSOR 1]",
          sponsor2: "[SPONSOR 2]",
          birthplace: "[PLACE OF BIRTH]",
          sacramentDate: "[DATE OF SACRAMENT]",
          minister: "[MINISTER NAME]",
          registerInfo: "[REGISTER INFO]",
          purpose: "Record/Reference",
          certificateNumber: "1560",
          parishName: "Saint John the Evangelist Parish",
          parishAddress: "A. Mabini Avenue, Brgy. 2, Tanauan City, Batangas",
          parishPriest: "[PRIEST NAME]",
        }

        // Editable settings that affect the certificate
        let certificateSettings = {
          parishName: "Saint John the Evangelist Parish",
          parishAddress: "A. Mabini Avenue, Brgy. 2, Tanauan City, Batangas",
          parishPriest: "Rev. Fr. Romeo Barrion",
          watermarkOpacity: 0.2,
          defaultMinister: "REV. FR. ROMEO BARRION",
        }

        // Service fees
        const fees = {
          BAPTISM: 600,
          CONFIRMATION: 600,
          COMMUNION: 600,
          WEDDING: 4000,
          FUNERAL: 600,
          INTENTION: 600,
        }

        // Service names
        const serviceNames = {
          BAPTISM: "BINYAG (BAPTISM)",
          CONFIRMATION: "KUMPIL (CONFIRMATION)",
          COMMUNION: "UNANG KOMUNYON (FIRST COMMUNION)",
          WEDDING: "KASAL (WEDDING)",
          FUNERAL: "LIBING (FUNERAL)",
          INTENTION: "INTENSYON SA MISA (MASS INTENTION)",
        }

        function initAdminDashboard() {
          // Set up navigation
          const navItems = document.querySelectorAll(".nav-item, .file-item")
          navItems.forEach((item) => {
            item.addEventListener("click", function (e) {
              e.preventDefault()
              const sectionId = this.getAttribute("data-section")
              if (sectionId) {
                showSection(sectionId)

                // Update active state
                navItems.forEach((nav) => nav.classList.remove("active"))
                this.classList.add("active")
              }
            })
          })

          // Set up certificate type change handler
          const certType = document.getElementById("cert-type")
          if (certType) {
            certType.addEventListener("change", () => updateCertificatePreview(false))
          }

          // Set up purpose dropdown handler
          const purpose = document.getElementById("cert-purpose")
          const otherPurposeGroup = document.getElementById("other-purpose-group")
          if (purpose && otherPurposeGroup) {
            purpose.addEventListener("change", function () {
              if (this.value === "Other") {
                otherPurposeGroup.style.display = "block"
                document.getElementById("cert-other-purpose").required = true
              } else {
                otherPurposeGroup.style.display = "none"
                document.getElementById("cert-other-purpose").required = false
              }
              updateCertificatePreview(false)
            })
          }

          // Set up add sponsor button
          const addSponsorBtn = document.getElementById("add-sponsor")
          const sponsorsContainer = document.querySelector(".sponsors-container")
          if (addSponsorBtn && sponsorsContainer) {
            addSponsorBtn.addEventListener("click", () => {
              const sponsorInputs = sponsorsContainer.querySelectorAll(".sponsor-input")
              if (sponsorInputs.length < 5) {
                const input = document.createElement("input")
                input.type = "text"
                input.className = "form-control sponsor-input"
                input.placeholder = `SPONSOR ${sponsorInputs.length + 1}`
                sponsorsContainer.appendChild(input)

                // Add event listener to update preview
                input.addEventListener("input", () => updateCertificatePreview(false))
              }

              if (sponsorsContainer.querySelectorAll(".sponsor-input").length >= 5) {
                addSponsorBtn.disabled = true
              }
            })
          }

          // Set up form input listeners for real-time preview
          const formInputs = document.querySelectorAll("#certificate-generator input, #certificate-generator select")
          formInputs.forEach((input) => {
            input.addEventListener("input", () => updateCertificatePreview(false))
          })
        }

        function loadTransactions() {
          // Load transactions from localStorage
          const storedTransactions = localStorage.getItem("adminTransactions")
          if (storedTransactions) {
            allTransactions = JSON.parse(storedTransactions)
          } else {
            allTransactions = []
          }

          // Populate transactions table
          populateTransactionsTable()

          // Update transaction statistics
          updateTransactionStats()
        }

        function populateTransactionsTable() {
          const tableBody = document.getElementById("transactions-table")
          if (!tableBody) return

          tableBody.innerHTML = ""

          if (allTransactions.length === 0) {
            const row = document.createElement("tr")
            row.innerHTML = `<td colspan="9" style="text-align: center; padding: 2rem; color: #666;">No transactions found</td>`
            tableBody.appendChild(row)
            return
          }

          // Apply filters
          let filteredTransactions = [...allTransactions]

          const statusFilter = document.getElementById("transaction-filter-status")
          const methodFilter = document.getElementById("transaction-filter-method")
          const periodFilter = document.getElementById("transaction-filter-period")

          if (statusFilter && statusFilter.value !== "all") {
            filteredTransactions = filteredTransactions.filter((t) => t.status === statusFilter.value)
          }

          if (methodFilter && methodFilter.value !== "all") {
            filteredTransactions = filteredTransactions.filter((t) => t.paymentMethod === methodFilter.value)
          }

          if (periodFilter && periodFilter.value !== "all") {
            const now = new Date()
            const filterDate = new Date()

            switch (periodFilter.value) {
              case "today":
                filterDate.setHours(0, 0, 0, 0)
                break
              case "week":
                filterDate.setDate(now.getDate() - 7)
                break
              case "month":
                filterDate.setMonth(now.getMonth() - 1)
                break
              case "quarter":
                filterDate.setMonth(now.getMonth() - 3)
                break
            }

            if (periodFilter.value !== "all") {
              filteredTransactions = filteredTransactions.filter((t) => new Date(t.paymentDate) >= filterDate)
            }
          }

          // Sort by payment date (newest first)
          filteredTransactions.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))

          filteredTransactions.forEach((transaction) => {
            const row = document.createElement("tr")

            const paymentDate = new Date(transaction.paymentDate)
            const formattedDate = paymentDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            const formattedTime = paymentDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })

            row.innerHTML = `
              <td class="transaction-id">${transaction.transactionId}</td>
              <td>${transaction.referenceNumber}</td>
              <td>
                <div class="date-time">
                  <div class="date">${formattedDate}</div>
                  <div class="time">${formattedTime}</div>
                </div>
              </td>
              <td>
                <div class="customer-info">
                  <div class="name">${transaction.customerName}</div>
                  <div class="contact">${transaction.customerEmail}</div>
                </div>
              </td>
              <td>${transaction.certificateType === "KUMPIL" ? "Confirmation" : "Baptismal"}</td>
              <td>
                <div class="payment-method">
                  <i class="fas fa-${getPaymentMethodIcon(transaction.paymentMethod)}"></i>
                  ${transaction.paymentMethod}
                </div>
              </td>
              <td class="amount">₱${transaction.totalAmount.toFixed(2)}</td>
              <td><span class="status-badge status-${transaction.status.toLowerCase()}">${transaction.status}</span></td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn view-btn" onclick="viewTransactionDetails('${transaction.transactionId}')" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn print-btn" onclick="printTransactionReceipt('${transaction.transactionId}')" title="Print Receipt">
                    <i class="fas fa-print"></i>
                  </button>
                  ${
                    transaction.status === "COMPLETED"
                      ? `
                    <button class="action-btn refund-btn" onclick="processRefund('${transaction.transactionId}')" title="Process Refund">
                      <i class="fas fa-undo"></i>
                    </button>
                  `
                      : ""
                  }
                </div>
              </td>
            `

            tableBody.appendChild(row)
          })
        }

        function updateTransactionStats() {
          const totalRevenue = allTransactions
            .filter((t) => t.status === "COMPLETED")
            .reduce((sum, t) => sum + t.totalAmount, 0)

          const totalTransactions = allTransactions.length
          const successfulTransactions = allTransactions.filter((t) => t.status === "COMPLETED").length
          const failedTransactions = allTransactions.filter((t) => t.status === "FAILED").length

          // Update stat cards
          document.getElementById("total-revenue").textContent = `₱${totalRevenue.toFixed(2)}`
          document.getElementById("total-transactions").textContent = totalTransactions
          document.getElementById("successful-transactions").textContent = successfulTransactions
          document.getElementById("failed-transactions").textContent = failedTransactions

          // Update dashboard revenue
          document.getElementById("dashboard-revenue").textContent = `₱${(totalRevenue / 1000).toFixed(1)}K`
        }

        function getPaymentMethodIcon(method) {
          switch (method) {
            case "GCash":
              return "mobile-alt"
            case "Credit Card":
              return "credit-card"
            case "Bank Transfer":
              return "university"
            default:
              return "money-bill"
          }
        }

        // Global function to view transaction details
        window.viewTransactionDetails = (transactionId) => {
          const transaction = allTransactions.find((t) => t.transactionId === transactionId)
          if (!transaction) return

          // Populate modal with transaction details
          document.getElementById("modal-transaction-id").textContent = transaction.transactionId
          document.getElementById("modal-transaction-ref").textContent = transaction.referenceNumber

          const paymentDate = new Date(transaction.paymentDate)
          document.getElementById("modal-payment-date").textContent = paymentDate.toLocaleString()

          document.getElementById("modal-payment-method").textContent = transaction.paymentMethod
          document.getElementById("modal-transaction-status").textContent = transaction.status
          document.getElementById("modal-auth-code").textContent = transaction.authorizationCode || "N/A"
          document.getElementById("modal-receipt-number").textContent = transaction.receiptNumber || "N/A"

          document.getElementById("modal-customer-name").textContent = transaction.customerName
          document.getElementById("modal-customer-email").textContent = transaction.customerEmail
          document.getElementById("modal-customer-mobile").textContent = transaction.customerMobile
          document.getElementById("modal-certificate-type").textContent =
            transaction.certificateType === "KUMPIL" ? "Confirmation Certificate" : "Baptismal Certificate"

          document.getElementById("modal-processing-fee").textContent = `₱${transaction.processingFee.toFixed(2)}`
          document.getElementById("modal-delivery-fee").textContent = `₱${transaction.deliveryFee.toFixed(2)}`
          document.getElementById("modal-total-amount").textContent = `₱${transaction.totalAmount.toFixed(2)}`

          document.getElementById("modal-payment-gateway").textContent = transaction.paymentGateway || transaction.paymentMethod
          document.getElementById("modal-transaction-notes").textContent = transaction.notes || "No additional notes"

          // Show/hide GCash details
          const gcashDetails = document.getElementById("modal-gcash-details")
          if (transaction.paymentMethod === "GCash") {
            gcashDetails.style.display = "block"
            document.getElementById("modal-gcash-number").textContent = transaction.gcashNumber || transaction.customerMobile
          } else {
            gcashDetails.style.display = "none"
          }

          // Show/hide refund button
          const refundBtn = document.getElementById("modal-refund-btn")
          if (transaction.status === "COMPLETED") {
            refundBtn.style.display = "inline-block"
          } else {
            refundBtn.style.display = "none"
          }

          // Show modal
          document.getElementById("transaction-details-modal").style.display = "block"
        }

        // Global function to print transaction receipt
        window.printTransactionReceipt = (transactionId) => {
          const transaction = allTransactions.find((t) => t.transactionId === transactionId)
          if (!transaction) return

          const printWindow = window.open("", "_blank")
          const paymentDate = new Date(transaction.paymentDate)

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Transaction Receipt - ${transaction.transactionId}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        background: white;
                    }
                    .receipt { 
                        max-width: 400px; 
                        margin: 0 auto; 
                        border: 1px solid #ddd; 
                        padding: 20px;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #333; 
                        padding-bottom: 10px; 
                        margin-bottom: 20px;
                    }
                    .row { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 8px;
                    }
                    .label { 
                        font-weight: bold; 
                    }
                    .total { 
                        border-top: 1px solid #333; 
                        padding-top: 10px; 
                        margin-top: 10px; 
                        font-weight: bold;
                    }
                    @media print {
                        body { margin: 0; }
                        .receipt { border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>Chronos Parish System</h2>
                        <h3>Payment Receipt</h3>
                    </div>
                    
                    <div class="row">
                        <span class="label">Transaction ID:</span>
                        <span>${transaction.transactionId}</span>
                    </div>
                    <div class="row">
                        <span class="label">Reference #:</span>
                        <span>${transaction.referenceNumber}</span>
                    </div>
                    <div class="row">
                        <span class="label">Date & Time:</span>
                        <span>${paymentDate.toLocaleString()}</span>
                    </div>
                    <div class="row">
                        <span class="label">Customer:</span>
                        <span>${transaction.customerName}</span>
                    </div>
                    <div class="row">
                        <span class="label">Certificate Type:</span>
                        <span>${transaction.certificateType === "KUMPIL" ? "Confirmation" : "Baptismal"}</span>
                    </div>
                    <div class="row">
                        <span class="label">Payment Method:</span>
                        <span>${transaction.paymentMethod}</span>
                    </div>
                    ${
                      transaction.paymentMethod === "GCash"
                        ? `
                    <div class="row">
                        <span class="label">GCash Number:</span>
                        <span>${transaction.gcashNumber || transaction.customerMobile}</span>
                    </div>
                    `
                        : ""
                    }
                    <div class="row">
                        <span class="label">Processing Fee:</span>
                        <span>₱${transaction.processingFee.toFixed(2)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Delivery Fee:</span>
                        <span>₱${transaction.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div class="row total">
                        <span class="label">Total Amount:</span>
                        <span>₱${transaction.totalAmount.toFixed(2)}</span>
                    </div>
                    <div class="row">
                        <span class="label">Status:</span>
                        <span>${transaction.status}</span>
                    </div>
                    ${
                      transaction.authorizationCode
                        ? `
                    <div class="row">
                        <span class="label">Auth Code:</span>
                        <span>${transaction.authorizationCode}</span>
                    </div>
                    `
                        : ""
                    }
                    
                    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
                        Thank you for using Chronos Parish System
                    </div>
                </div>
            </body>
            </html>
          `)

          printWindow.document.close()

          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
            printWindow.close()
          }, 500)

          showNotification("Receipt sent to printer!", "success")
        }

        // Global function to process refund
        window.processRefund = (transactionId) => {
          if (confirm(`Are you sure you want to process a refund for transaction ${transactionId}?`)) {
            const transactionIndex = allTransactions.findIndex((t) => t.transactionId === transactionId)

            if (transactionIndex !== -1) {
              allTransactions[transactionIndex].status = "REFUNDED"
              allTransactions[transactionIndex].refundDate = new Date().toISOString()
              allTransactions[transactionIndex].notes = (allTransactions[transactionIndex].notes || "") + " - REFUNDED"

              // Save updated transactions
              localStorage.setItem("adminTransactions", JSON.stringify(allTransactions))

              // Update related request status
              const relatedRequest = allRequests.find((r) => r.transactionId === transactionId)
              if (relatedRequest) {
                relatedRequest.status = "refunded"
                relatedRequest.paymentStatus = "REFUNDED"
                localStorage.setItem("adminRequests", JSON.stringify(allRequests))
              }

              // Refresh displays
              populateTransactionsTable()
              updateTransactionStats()
              populateAllTables()

              // Close modal
              document.getElementById("transaction-details-modal").style.display = "none"

              showNotification("Refund processed successfully!", "success")
            }
          }
        }

        function preloadImages() {
          const images = [imageAssets.parishLogo, imageAssets.parishSeal, imageAssets.signature]
          images.forEach((src) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = src
          })
        }

        function setupEventListeners() {
          // Preview certificate button - shows default template
          const previewBtn = document.getElementById("preview-certificate")
          if (previewBtn) {
            previewBtn.addEventListener("click", () => {
              updateCertificatePreview(true) // Force use of default template
              showNotification("Default certificate template displayed with placeholders!", "info")
            })
          }

          // Generate PDF button
          const generateBtn = document.getElementById("generate-certificate")
          if (generateBtn) {
            generateBtn.addEventListener("click", generateCertificatePDF)
          }

          // Print certificate button
          const printBtn = document.getElementById("print-certificate")
          if (printBtn) {
            printBtn.addEventListener("click", printCertificate)
          }

          // Modal close handlers
          const modals = document.querySelectorAll(".modal")
          const closeButtons = document.querySelectorAll(".close-modal, .close-btn")

          closeButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
              const modal = e.target.closest(".modal")
              if (modal) {
                modal.style.display = "none"
              }
            })
          })

          // Click outside modal to close
          modals.forEach((modal) => {
            modal.addEventListener("click", (e) => {
              if (e.target === modal) {
                modal.style.display = "none"
              }
            })
          })

          // Modal action buttons
          const approveBtn = document.getElementById("modal-approve-btn")
          const rejectBtn = document.getElementById("modal-reject-btn")
          const generateModalBtn = document.getElementById("modal-generate-btn")

          if (approveBtn) {
            approveBtn.addEventListener("click", () => {
              const refNumber = document.getElementById("modal-ref-number").textContent
              window.approveRequest(refNumber)
              document.getElementById("request-details-modal").style.display = "none"
            })
          }

          if (rejectBtn) {
            rejectBtn.addEventListener("click", () => {
              const refNumber = document.getElementById("modal-ref-number").textContent
              window.rejectRequest(refNumber)
              document.getElementById("request-details-modal").style.display = "none"
            })
          }

          if (generateModalBtn) {
            generateModalBtn.addEventListener("click", () => {
              const refNumber = document.getElementById("modal-ref-number").textContent
              window.generateCertificateFromRequest(refNumber)
              document.getElementById("request-details-modal").style.display = "none"
            })
          }

          // Transaction modal buttons
          const printReceiptBtn = document.getElementById("modal-print-receipt-btn")
          const refundBtn = document.getElementById("modal-refund-btn")

          if (printReceiptBtn) {
            printReceiptBtn.addEventListener("click", () => {
              const transactionId = document.getElementById("modal-transaction-id").textContent
              window.printTransactionReceipt(transactionId)
            })
          }

          if (refundBtn) {
            refundBtn.addEventListener("click", () => {
              const transactionId = document.getElementById("modal-transaction-id").textContent
              window.processRefund(transactionId)
            })
          }

          // Search functionality
          const searchInputs = document.querySelectorAll('[id$="-search"]')
          searchInputs.forEach((input) => {
            input.addEventListener("input", function () {
              if (this.id === "transaction-search") {
                filterTransactionsTable(this.value)
              } else {
                const tableId = this.id.replace("-search", "-requests-table")
                filterTable(tableId, this.value)
              }
            })
          })

          // Filter dropdowns
          const filterDropdowns = document.querySelectorAll(
            '[id$="-filter-type"], [id$="-filter-status"], [id$="-filter-method"], [id$="-filter-period"]',
          )
          filterDropdowns.forEach((dropdown) => {
            dropdown.addEventListener("change", () => {
              if (dropdown.id.startsWith("transaction-")) {
                populateTransactionsTable()
              } else {
                refreshCurrentTable()
              }
            })
          })

          // Refresh buttons
          const refreshRequestsBtn = document.getElementById("refresh-requests")
          const refreshTransactionsBtn = document.getElementById("refresh-transactions")

          if (refreshRequestsBtn) {
            refreshRequestsBtn.addEventListener("click", () => {
              loadActualData()
              refreshCurrentTable()
              showNotification("Requests data refreshed successfully!", "success")
            })
          }

          if (refreshTransactionsBtn) {
            refreshTransactionsBtn.addEventListener("click", () => {
              loadTransactions()
              showNotification("Transactions data refreshed successfully!", "success")
            })
          }

          // Export transactions button
          const exportBtn = document.getElementById("export-transactions")
          if (exportBtn) {
            exportBtn.addEventListener("click", exportTransactions)
          }

          // Settings save button
          const saveSettingsBtn = document.querySelector(".save-settings-btn")
          if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener("click", saveSettings)
          }

          // Reset settings button
          const resetSettingsBtn = document.querySelector(".reset-settings-btn")
          if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener("click", resetSettings)
          }

          // Calendar navigation
          const prevMonthBtn = document.getElementById("prev-month")
          const nextMonthBtn = document.getElementById("next-month")

          if (prevMonthBtn) {
            prevMonthBtn.addEventListener("click", () => {
              currentDate.setMonth(currentDate.getMonth() - 1)
              renderCalendar()
            })
          }

          if (nextMonthBtn) {
            nextMonthBtn.addEventListener("click", () => {
              currentDate.setMonth(currentDate.getMonth() + 1)
              renderCalendar()
            })
          }

          // Add event button
          const addEventBtn = document.getElementById("add-event-btn")
          if (addEventBtn) {
            addEventBtn.addEventListener("click", () => {
              openEventModal()
            })
          }

          // Event modal buttons
          const saveEventBtn = document.getElementById("save-event-btn")
          const cancelEventBtn = document.getElementById("cancel-event-btn")
          const deleteEventBtn = document.getElementById("delete-event-btn")

          if (saveEventBtn) {
            saveEventBtn.addEventListener("click", saveEvent)
          }

          if (cancelEventBtn) {
            cancelEventBtn.addEventListener("click", () => {
              document.getElementById("event-modal").style.display = "none"
            })
          }

          if (deleteEventBtn) {
            deleteEventBtn.addEventListener("click", deleteEvent)
          }

          // Image upload handlers
          const imageUploads = {
            "parish-logo-upload": "parishLogo",
            "parish-seal-upload": "parishSeal",
            "signature-upload": "signature",
          }

          Object.entries(imageUploads).forEach(([uploadId, assetKey]) => {
            const upload = document.getElementById(uploadId)
            if (upload) {
              upload.addEventListener("change", (e) => handleImageUpload(e, assetKey))
            }
          })

          // Settings input listeners for real-time updates
          const settingsInputs = document.querySelectorAll(
            "#parish-name, #parish-address, #parish-priest, #watermark-opacity, #default-minister",
          )
          settingsInputs.forEach((input) => {
            input.addEventListener("input", updateSettingsRealTime)
          })

          // Create folder functionality
          const createFolderBtn = document.querySelector(".create-folder-btn")
          if (createFolderBtn) {
            createFolderBtn.addEventListener("click", createNewFolder)
          }

          // Document upload functionality
          const uploadDocumentBtn = document.getElementById("upload-document")
          const uploadDocumentKumpilBtn = document.getElementById("upload-document-kumpil")
          
          if (uploadDocumentBtn) {
            uploadDocumentBtn.addEventListener("click", () => uploadDocument("binyag"))
          }
          
          if (uploadDocumentKumpilBtn) {
            uploadDocumentKumpilBtn.addEventListener("click", () => uploadDocument("kumpil"))
          }
        }

        function createNewFolder() {
          const folderName = prompt("Enter folder name:")
          if (folderName && folderName.trim()) {
            const filesList = document.querySelector(".files-list")
            const newFolder = document.createElement("a")
            newFolder.href = "#"
            newFolder.className = "file-item"
            newFolder.setAttribute("data-section", folderName.toLowerCase().replace(/\s+/g, "-"))
            
            newFolder.innerHTML = `
              <span class="expand-icon">▶</span>
              <div class="folder-icon"></div>
              <span>${folderName}</span>
            `
            
            filesList.appendChild(newFolder)
            
            // Add event listener for the new folder
            newFolder.addEventListener("click", function(e) {
              e.preventDefault()
              const sectionId = this.getAttribute("data-section")
              if (sectionId) {
                showSection(sectionId)
                
                // Update active state
                document.querySelectorAll(".nav-item, .file-item").forEach((nav) => nav.classList.remove("active"))
                this.classList.add("active")
              }
            })
            
            showNotification(`Folder "${folderName}" created successfully!`, "success")
          }
        }

        function uploadDocument(folderType) {
          const input = document.createElement("input")
          input.type = "file"
          input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
          input.multiple = true
          
          input.onchange = function(e) {
            const files = Array.from(e.target.files)
            files.forEach(file => {
              // Simulate file upload
              const fileCard = createFileCard(file, folderType)
              const filesGrid = document.querySelector(`#${folderType} .files-grid`)
              if (filesGrid) {
                filesGrid.appendChild(fileCard)
              }
            })
            
            showNotification(`${files.length} file(s) uploaded successfully!`, "success")
          }
          
          input.click()
        }

        function createFileCard(file, folderType) {
          const fileCard = document.createElement("div")
          fileCard.className = "file-card"
          
          const fileExtension = file.name.split('.').pop().toLowerCase()
          let iconClass = "fas fa-file"
          
          switch(fileExtension) {
            case "pdf":
              iconClass = "fas fa-file-pdf"
              break
            case "doc":
            case "docx":
              iconClass = "fas fa-file-word"
              break
            case "jpg":
            case "jpeg":
            case "png":
              iconClass = "fas fa-file-image"
              break
          }
          
          fileCard.innerHTML = `
            <div class="file-icon">
              <i class="${iconClass}"></i>
            </div>
            <div class="file-info">
              <h4>${file.name}</h4>
              <p>${fileExtension.toUpperCase()} Document • ${(file.size / 1024 / 1024).toFixed(1)} MB</p>
              <span class="file-date">Modified: ${new Date().toLocaleDateString()}</span>
            </div>
            <div class="file-actions">
              <button class="action-btn view-btn" onclick="viewDocument('${file.name}')"><i class="fas fa-eye"></i></button>
              <button class="action-btn print-btn" onclick="downloadDocument('${file.name}')"><i class="fas fa-download"></i></button>
            </div>
          `
          
          return fileCard
        }

        window.viewDocument = function(fileName) {
          showNotification(`Opening ${fileName}...`, "info")
        }

        window.downloadDocument = function(fileName) {
          showNotification(`Downloading ${fileName}...`, "info")
        }

        // Continue with remaining functions...
        function loadActualData() {
          // Load requests from localStorage
          const storedRequests = localStorage.getItem("adminRequests")
          if (storedRequests) {
            allRequests = JSON.parse(storedRequests)
          } else {
            allRequests = []
          }

          // Load calendar events
          const storedEvents = localStorage.getItem("calendarEvents")
          if (storedEvents) {
            calendarEvents = JSON.parse(storedEvents)
          } else {
            calendarEvents = []
          }

          // Check for new form submissions
          checkForNewSubmissions()

          // Update counter
          if (allRequests.length > 0) {
            requestIdCounter = Math.max(...allRequests.map((r) => r.id || 0)) + 1
          }

          // Populate tables
          populateAllTables()

          // Update dashboard stats
          updateDashboardStats()

          // Update activity
          updateRecentActivity()

          // Update upcoming events
          updateUpcomingEvents()

          // Load transactions
          loadTransactions()
        }

        function checkForNewSubmissions() {
          // Check if there's a new form submission in localStorage
          const formData = localStorage.getItem("baptismRequestData")
          if (formData) {
            try {
              const data = JSON.parse(formData)

              // Check if this submission already exists
              const existingRequest = allRequests.find((r) => r.referenceNumber === data.referenceNumber)

              if (!existingRequest && data.requestDetails && data.requestDetails.firstName) {
                // Create new request from form data
                const newRequest = createRequestFromFormData(data)
                allRequests.push(newRequest)

                // Save updated requests
                localStorage.setItem("adminRequests", JSON.stringify(allRequests))

                // Clear the form data to prevent duplicate entries
                localStorage.removeItem("baptismRequestData")

                showNotification("New certificate request received!", "success")
              }
            } catch (error) {
              console.error("Error processing form data:", error)
            }
          }

          // Check for new church scheduling data
          const scheduleData = localStorage.getItem("churchScheduleData")
          if (scheduleData) {
            try {
              const data = JSON.parse(scheduleData)

              // Check if this schedule already exists as an event
              const serviceDetails = data.serviceDetails || {}
              const preferredDate = serviceDetails.preferredDate
              const preferredTime = serviceDetails.preferredTime

              if (preferredDate && preferredTime) {
                const eventDateTime = new Date(`${preferredDate}T${preferredTime}`)
                const existingEvent = calendarEvents.find(
                  (e) => new Date(e.date).getTime() === eventDateTime.getTime() && e.type === data.serviceType,
                )

                if (!existingEvent) {
                  // Create new calendar event from schedule data
                  const newEvent = createEventFromScheduleData(data)
                  calendarEvents.push(newEvent)

                  // Save updated events
                  localStorage.setItem("calendarEvents", JSON.stringify(calendarEvents))

                  // Clear the schedule data to prevent duplicate entries
                  localStorage.removeItem("churchScheduleData")

                  showNotification("New church schedule added to calendar!", "success")
                }
              }
            } catch (error) {
              console.error("Error processing schedule data:", error)
            }
          }
        }

        function showSection(sectionId) {
          // Hide all sections
          const sections = document.querySelectorAll(".content-section")
          sections.forEach((section) => {
            section.classList.remove("active")
          })

          // Show target section
          const targetSection = document.getElementById(sectionId)
          if (targetSection) {
            targetSection.classList.add("active")
          }

          // Update dashboard stats when showing dashboard
          if (sectionId === "dashboard") {
            updateDashboardStats()
            updateTransactionStats()
          }

          // Refresh table data when showing request sections
          if (sectionId === "requests") {
            refreshCurrentTable()
          }

          // Refresh transactions when showing transactions section
          if (sectionId === "transactions") {
            populateTransactionsTable()
            updateTransactionStats()
          }

          // Refresh calendar when showing calendar section
          if (sectionId === "calendar") {
            renderCalendar()
          }

          // Update certificate preview when showing certificate generator
          if (sectionId === "certificate-generator") {
            // Check if form has data, if not show default template
            const hasFormData = document.getElementById("cert-name").value.trim() !== ""
            updateCertificatePreview(!hasFormData)
          }
        }

        function populateAllTables() {
          populateTable("all-requests-table", allRequests, "all")
        }

        function populateTable(tableId, requests, tableType) {
          const tableBody = document.getElementById(tableId)
          if (!tableBody) return

          tableBody.innerHTML = ""

          if (requests.length === 0) {
            const colspan = tableType === "all" ? "8" : "7"
            const row = document.createElement("tr")
            row.innerHTML = `<td colspan="${colspan}" style="text-align: center; padding: 2rem; color: #666;">No requests found</td>`
            tableBody.appendChild(row)
            return
          }

          requests.forEach((request) => {
            const row = document.createElement("tr")

            if (tableType === "all") {
              row.innerHTML = `
                <td>${request.refNumber}</td>
                <td>${formatDate(request.dateRequested)}</td>
                <td>${request.name}</td>
                <td>${request.certificateType}</td>
                <td>${request.purpose}</td>
                <td><span class="status-badge status-${request.status}">${request.status.toUpperCase()}</span></td>
                <td class="transaction-id">${request.transactionId || "-"}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewRequestDetails('${request.refNumber}')" title="View Details">
                      <i class="fas fa-eye"></i>
                    </button>
                    ${
                      request.status === "pending"
                        ? `
                      <button class="action-btn approve-btn" onclick="window.approveRequest('${request.refNumber}')" title="Approve">
                        <i class="fas fa-check"></i>
                      </button>
                      <button class="action-btn reject-btn" onclick="window.rejectRequest('${request.refNumber}')" title="Reject">
                        <i class="fas fa-times"></i>
                      </button>
                    `
                        : ""
                    }
                    ${
                      request.status === "approved" || request.status === "paid"
                        ? `
                      <button class="action-btn print-btn" onclick="window.generateCertificateFromRequest('${request.refNumber}')" title="Generate Certificate">
                        <i class="fas fa-certificate"></i>
                      </button>
                    `
                        : ""
                    }
                    ${
                      request.status === "completed"
                        ? `
                      <button class="action-btn print-btn" onclick="printCertificate('${request.refNumber}')" title="Print Certificate">
                        <i class="fas fa-print"></i>
                      </button>
                    `
                        : ""
                    }
                    ${
                      request.transactionId
                        ? `
                      <button class="action-btn transaction-btn" onclick="viewTransactionDetails('${request.transactionId}')" title="View Transaction">
                        <i class="fas fa-receipt"></i>
                      </button>
                    `
                        : ""
                    }
                  </div>
                </td>
              `
            }

            tableBody.appendChild(row)
          })
        }

        function updateDashboardStats() {
          const totalCount = allRequests.length
          const pendingCount = allRequests.filter((r) => r.status === "pending").length
          const approvedCount = allRequests.filter((r) => r.status === "approved").length
          const completedCount = allRequests.filter((r) => r.status === "completed").length

          // Update dashboard stats
          document.getElementById("dashboard-completed").textContent = completedCount
        }

        function updateCertificatePreview(useDefaultTemplate = false) {
          // Get form values or use default values based on useDefaultTemplate flag
          const certType = document.getElementById("cert-type").value

          let certNumber, certName, certFather, certMother, certBirthplace, certBirthdate
          let certSacramentDate, certMinister, certRegister, certPurpose, certOtherPurpose

          if (useDefaultTemplate) {
            // Use default placeholder data
            certNumber = defaultCertificateData.certificateNumber
            certName = defaultCertificateData.fullName
            certFather = defaultCertificateData.fatherName
            certMother = defaultCertificateData.motherName
            certBirthplace = defaultCertificateData.birthplace
            certBirthdate = defaultCertificateData.dateOfBirth
            certSacramentDate = defaultCertificateData.sacramentDate
            certMinister = defaultCertificateData.minister
            certRegister = defaultCertificateData.registerInfo
            certPurpose = defaultCertificateData.purpose
          } else {
            // Use form values or fallback to defaults
            certNumber = document.getElementById("cert-number").value || defaultCertificateData.certificateNumber
            certName = document.getElementById("cert-name").value || defaultCertificateData.fullName
            certFather = document.getElementById("cert-father").value || defaultCertificateData.fatherName
            certMother = document.getElementById("cert-mother").value || defaultCertificateData.motherName
            certBirthplace = document.getElementById("cert-birthplace").value || defaultCertificateData.birthplace
            certBirthdate = document.getElementById("cert-birthdate").value || defaultCertificateData.dateOfBirth
            certSacramentDate = document.getElementById("cert-sacrament-date").value || defaultCertificateData.sacramentDate
            certMinister = document.getElementById("cert-minister").value || defaultCertificateData.minister
            certRegister = document.getElementById("cert-register").value || defaultCertificateData.registerInfo
            certPurpose = document.getElementById("cert-purpose").value || defaultCertificateData.purpose
            certOtherPurpose = document.getElementById("cert-other-purpose")?.value
          }

          // Get sponsors
          let sponsors = ""
          if (useDefaultTemplate) {
            sponsors = `${defaultCertificateData.sponsor1} and ${defaultCertificateData.sponsor2}`
          } else {
            const sponsorInputs = document.querySelectorAll(".sponsor-input")
            sponsors = Array.from(sponsorInputs)
              .map((input) => input.value.trim())
              .filter((value) => value !== "")
              .join(" and ")

            // Use default sponsors if none provided
            if (!sponsors) {
              sponsors = `${defaultCertificateData.sponsor1} and ${defaultCertificateData.sponsor2}`
            }
          }

          // Update preview elements
          document.getElementById("preview-title").textContent =
            certType === "KUMPIL" ? "Confirmation Certificate" : "Baptismal Certificate"
          document.getElementById("preview-number").textContent = certNumber
          document.getElementById("preview-name").textContent = certName
          document.getElementById("preview-father").textContent = certFather
          document.getElementById("preview-mother").textContent = certMother
          document.getElementById("preview-birthplace").textContent = certBirthplace
          document.getElementById("preview-birthdate").textContent = formatDateForCertificate(certBirthdate)
          document.getElementById("preview-sacrament").textContent =
            certType === "KUMPIL" ? "The Holy Sacrament of Confirmation" : "The Holy Sacrament of Baptism"
          document.getElementById("preview-sacrament-date").textContent = formatDateForCertificate(certSacramentDate)
          document.getElementById("preview-minister").textContent = certMinister
          document.getElementById("preview-sponsors").textContent = sponsors
          document.getElementById("preview-register-type").textContent = certType === "KUMPIL" ? "Confirmation" : "Baptismal"
          document.getElementById("preview-register").textContent = certRegister
          document.getElementById("preview-issue-date").textContent = formatDateForCertificate(
            new Date().toISOString().split("T")[0],
          )
          document.getElementById("preview-purpose").textContent = certPurpose === "Other" ? certOtherPurpose : certPurpose

          // Use current priest setting
          document.getElementById("preview-parish-priest").textContent = certificateSettings.parishPriest

          // Show/hide sponsors text based on certificate type
          const sponsorsText = document.getElementById("preview-sponsors-text")
          if (certType === "KUMPIL") {
            sponsorsText.innerHTML = `The sponsor being <span id="preview-sponsors">${sponsors}</span>`
          } else {
            sponsorsText.innerHTML = `The sponsors being <span id="preview-sponsors">${sponsors}</span>`
          }

          // Update certificate images
          updateCertificateImages()
        }

        function generateCertificatePDF() {
          const { jsPDF } = window.jspdf
          const certificate = document.getElementById("certificate-template")
          const html2canvas = window.html2canvas

          // Show loading state
          const generateBtn = document.getElementById("generate-certificate")
          if (generateBtn) {
            generateBtn.classList.add("loading")
            generateBtn.disabled = true
          }

          // Ensure all images are loaded before capturing
          const images = certificate.querySelectorAll("img")
          const imagePromises = Array.from(images).map((img) => {
            return new Promise((resolve) => {
              if (img.complete) {
                resolve()
              } else {
                img.onload = resolve
                img.onerror = resolve
              }
            })
          })

          Promise.all(imagePromises).then(() => {
            // Use html2canvas to convert the certificate to image
            html2canvas(certificate, {
              scale: 4, // Higher scale for better quality
              useCORS: true,
              allowTaint: false,
              backgroundColor: "#ffffff",
              logging: false,
              width: certificate.offsetWidth,
              height: certificate.offsetHeight,
              onclone: (clonedDoc) => {
                // Ensure images are properly loaded in the cloned document
                const clonedImages = clonedDoc.querySelectorAll("img")
                clonedImages.forEach((img) => {
                  img.crossOrigin = "anonymous"
                  // Force image display
                  img.style.display = "block"
                  img.style.visibility = "visible"
                })

                // Ensure certificate layout is preserved
                const clonedCert = clonedDoc.querySelector(".certificate")
                if (clonedCert) {
                  clonedCert.style.transform = "none"
                  clonedCert.style.width = "8.5in"
                  clonedCert.style.height = "11in"
                }
              },
            })
              .then((canvas) => {
                const imgData = canvas.toDataURL("image/png", 1.0)
                const pdf = new jsPDF("p", "mm", "a4")

                // Calculate dimensions to fit A4 perfectly
                const pdfWidth = 210 // A4 width in mm
                const pdfHeight = 297 // A4 height in mm

                // Add the image to fill the entire page
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)

                // Save the PDF
                const certNumber = document.getElementById("cert-number").value || "XXXX"
                const certName = document.getElementById("cert-name").value || "CERTIFICATE"
                const filename = `${certName.replace(/[^a-zA-Z0-9]/g, "_")}_${certNumber}.pdf`

                pdf.save(filename)

                showNotification("Certificate PDF generated successfully!", "success")
              })
              .catch((error) => {
                console.error("Error generating PDF:", error)
                showNotification("Error generating PDF. Please try again.", "error")
              })
              .finally(() => {
                // Remove loading state
                if (generateBtn) {
                  generateBtn.classList.remove("loading")
                  generateBtn.disabled = false
                }
              })
          })
        }

        function printCertificate() {
          const certificate = document.getElementById("certificate-template")

          // Create a new window for printing
          const printWindow = window.open("", "_blank")

          // Get all the CSS styles
          const styles = Array.from(document.styleSheets)
            .map((styleSheet) => {
              try {
                return Array.from(styleSheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join("")
              } catch (e) {
                return ""
              }
            })
            .join("")

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificate Print - ${certificateSettings.parishName}</title>
                <style>
                    ${styles}
                    
                    /* Override styles for perfect printing */
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: white;
                    }
                    
                    .certificate { 
                        width: 8.5in !important; 
                        height: 11in !important; 
                        margin: 0 !important; 
                        padding: 0.75in !important;
                        font-family: 'Times New Roman', Times, serif !important;
                        position: relative !important;
                        background: white !important;
                        transform: none !important;
                        border: 2px solid #000 !important;
                        page-break-after: always !important;
                    }
                    
                    .certificate-footer {
                        position: absolute !important;
                        bottom: 0.75in !important;
                        left: 0.75in !important;
                        right: 0.75in !important;
                        display: grid !important;
                        grid-template-columns: 1fr 2.5in 2in !important;
                        grid-template-areas: "issue signature seal" !important;
                        align-items: end !important;
                        gap: 0.5in !important;
                        font-size: 12pt !important;
                        height: 2.5in !important;
                    }
                    
                    .signature-image,
                    .seal-image,
                    .parish-logo img,
                    .certificate-watermark img {
                        print-color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    @media print {
                        body { margin: 0 !important; }
                        .certificate { page-break-after: always !important; }
                    }
                </style>
            </head>
            <body>
                ${certificate.outerHTML}
            </body>
            </html>
          `)

          printWindow.document.close()

          // Wait for images to load before printing
          const images = printWindow.document.querySelectorAll("img")
          let loadedImages = 0
          const totalImages = images.length

          if (totalImages === 0) {
            // No images, print immediately
            setTimeout(() => {
              printWindow.focus()
              printWindow.print()
              printWindow.close()
            }, 500)
          } else {
            // Wait for all images to load
            images.forEach((img) => {
              if (img.complete) {
                loadedImages++
              } else {
                img.onload = () => {
                  loadedImages++
                  if (loadedImages === totalImages) {
                    setTimeout(() => {
                      printWindow.focus()
                      printWindow.print()
                      printWindow.close()
                    }, 500)
                  }
                }
                img.onerror = () => {
                  loadedImages++
                  if (loadedImages === totalImages) {
                    setTimeout(() => {
                      printWindow.focus()
                      printWindow.print()
                      printWindow.close()
                    }, 500)
                  }
                }
              }
            })

            // Check if all images are already loaded
            if (loadedImages === totalImages) {
              setTimeout(() => {
                printWindow.focus()
                printWindow.print()
                printWindow.close()
              }, 500)
            }
          }

          showNotification("Certificate sent to printer!", "success")
        }

        // Additional helper functions
        function loadSettings() {
          // Load image assets
          const savedAssets = localStorage.getItem("imageAssets")
          if (savedAssets) {
            imageAssets = { ...imageAssets, ...JSON.parse(savedAssets) }
            updateCertificateImages()
          }

          // Load certificate settings
          const savedSettings = localStorage.getItem("certificateSettings")
          if (savedSettings) {
            certificateSettings = { ...certificateSettings, ...JSON.parse(savedSettings) }

            // Update form inputs
            document.getElementById("parish-name").value = certificateSettings.parishName
            document.getElementById("parish-address").value = certificateSettings.parishAddress
            document.getElementById("parish-priest").value = certificateSettings.parishPriest
            document.getElementById("watermark-opacity").value = certificateSettings.watermarkOpacity

            // Update display elements
            document.getElementById("opacity-value").textContent = `${Math.round(certificateSettings.watermarkOpacity * 100)}%`

            // Update watermark opacity
            const watermark = document.querySelector(".certificate-watermark")
            if (watermark) {
              watermark.style.opacity = certificateSettings.watermarkOpacity
            }
          }
        }

        function initCalendar() {
          renderCalendar()
        }

        function renderCalendar() {
          const calendarDates = document.getElementById("calendar-dates")
          const currentMonthYear = document.getElementById("current-month-year")

          if (!calendarDates || !currentMonthYear) return

          // Set the month and year display
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
          ]
          currentMonthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`

          // Clear previous calendar
          calendarDates.innerHTML = ""

          // Get first day of month and total days
          const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
          const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

          // Add empty cells for days before the first day of month
          for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("div")
            emptyCell.className = "calendar-day empty"
            calendarDates.appendChild(emptyCell)
          }

          // Add days of the month
          for (let i = 1; i <= lastDate; i++) {
            const dayCell = document.createElement("div")
            dayCell.className = "calendar-day"

            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
            const dateStr = dateObj.toISOString().split("T")[0]

            // Check if this date has events
            const eventsForDay = calendarEvents.filter((event) => {
              const eventDate = new Date(event.date)
              return eventDate.toISOString().split("T")[0] === dateStr
            })

            // Add event indicators if there are events
            let eventIndicators = ""
            if (eventsForDay.length > 0) {
              dayCell.classList.add("has-events")

              // Create event indicators (max 3 shown)
              const maxIndicators = Math.min(eventsForDay.length, 3)
              for (let j = 0; j < maxIndicators; j++) {
                const eventType = eventsForDay[j].type
                let eventColor = "blue"

                // Set color based on event type
                switch (eventType) {
                  case "BAPTISM":
                    eventColor = "green"
                    break
                  case "CONFIRMATION":
                    eventColor = "purple"
                    break
                  case "WEDDING":
                    eventColor = "red"
                    break
                  case "FUNERAL":
                    eventColor = "gray"
                    break
                  case "COMMUNION":
                    eventColor = "orange"
                    break
                  case "INTENTION":
                    eventColor = "teal"
                    break
                }

                eventIndicators += `<span class="event-indicator" style="background-color: ${eventColor};"></span>`
              }

              // Add "more" indicator if there are more than 3 events
              if (eventsForDay.length > 3) {
                eventIndicators += `<span class="event-indicator more">+${eventsForDay.length - 3}</span>`
              }
            }

            // Check if this is today
            const today = new Date()
            if (
              i === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear()
            ) {
              dayCell.classList.add("today")
            }

            // Check if this is the selected date
            if (
              i === selectedDate.getDate() &&
              currentDate.getMonth() === selectedDate.getMonth() &&
              currentDate.getFullYear() === selectedDate.getFullYear()
            ) {
              dayCell.classList.add("selected")
            }

            dayCell.innerHTML = `
              <div class="day-number">${i}</div>
              <div class="event-indicators">${eventIndicators}</div>
            `

            // Add click event to show events for this day
            dayCell.addEventListener("click", () => {
              // Update selected date
              selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)

              // Update UI to show this date is selected
              document.querySelectorAll(".calendar-day").forEach((day) => {
                day.classList.remove("selected")
              })
              dayCell.classList.add("selected")

              // Show events for this day
              showEventsForDay(dateStr)
            })

            calendarDates.appendChild(dayCell)
          }

          // Show events for the selected date
          const selectedDateStr = selectedDate.toISOString().split("T")[0]
          showEventsForDay(selectedDateStr)
        }

        function showEventsForDay(dateStr) {
          const eventsForDayContainer = document.getElementById("events-for-day")
          const selectedDateDisplay = document.getElementById("selected-date")

          if (!eventsForDayContainer || !selectedDateDisplay) return

          // Format the date for display
          const selectedDate = new Date(dateStr)
          selectedDateDisplay.textContent = selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })

          // Get events for this day
          const eventsForDay = calendarEvents.filter((event) => {
            const eventDate = new Date(event.date)
            return eventDate.toISOString().split("T")[0] === dateStr
          })

          // Display events
          if (eventsForDay.length === 0) {
            eventsForDayContainer.innerHTML = '<div class="no-events">No events scheduled for this day.</div>'
          } else {
            eventsForDayContainer.innerHTML = ""

            eventsForDay.forEach((event) => {
              const eventTime = new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              const eventEl = document.createElement("div")
              eventEl.className = "day-event"
              eventEl.dataset.eventId = event.id

              // Set color based on event type
              let eventColor = "blue"
              switch (event.type) {
                case "BAPTISM":
                  eventColor = "green"
                  break
                case "CONFIRMATION":
                  eventColor = "purple"
                  break
                case "WEDDING":
                  eventColor = "red"
                  break
                case "FUNERAL":
                  eventColor = "gray"
                  break
                case "COMMUNION":
                  eventColor = "orange"
                  break
                case "INTENTION":
                  eventColor = "teal"
                  break
              }

              eventEl.innerHTML = `
                <div class="event-time">${eventTime}</div>
                <div class="event-content">
                  <div class="event-title" style="color: ${eventColor};">${event.title}</div>
                  <div class="event-details">${event.details || ""}</div>
                </div>
                <div class="event-actions">
                  <button class="btn action-btn edit-event-btn" title="Edit Event">
                    <i class="fas fa-edit"></i>
                  </button>
                  ${
                    event.generateCertificate
                      ? `
                  <button class="btn action-btn generate-cert-btn" title="Generate Certificate">
                    <i class="fas fa-certificate"></i>
                  </button>
                  `
                      : ""
                  }
                </div>
              `

              // Add event listeners
              eventEl.querySelector(".edit-event-btn").addEventListener("click", () => {
                openEventModal(event.id)
              })

              const generateCertBtn = eventEl.querySelector(".generate-cert-btn")
              if (generateCertBtn) {
                generateCertBtn.addEventListener("click", () => {
                  generateCertificateFromEvent(event.id)
                })
              }

              eventsForDayContainer.appendChild(eventEl)
            })
          }
        }

        function openEventModal(eventId = null) {
          const modal = document.getElementById("event-modal")
          const modalTitle = document.getElementById("event-modal-title")
          const deleteBtn = document.getElementById("delete-event-btn")

          if (!modal) return

          // Reset form
          document.getElementById("event-title").value = ""
          document.getElementById("event-type").value = "BAPTISM"
          document.getElementById("event-date").value = selectedDate.toISOString().split("T")[0]
          document.getElementById("event-time").value = "10:00"
          document.getElementById("event-details").value = ""
          document.getElementById("event-contact").value = ""
          document.getElementById("event-phone").value = ""
          document.getElementById("generate-certificate").checked = true

          // Set modal title and show/hide delete button
          if (eventId) {
            modalTitle.textContent = "Edit Event"
            deleteBtn.style.display = "inline-block"
            selectedEventId = eventId

            // Find and populate event data
            const event = calendarEvents.find((e) => e.id === eventId)
            if (event) {
              document.getElementById("event-title").value = event.title
              document.getElementById("event-type").value = event.type

              const eventDate = new Date(event.date)
              document.getElementById("event-date").value = eventDate.toISOString().split("T")[0]

              const hours = eventDate.getHours().toString().padStart(2, "0")
              const minutes = eventDate.getMinutes().toString().padStart(2, "0")
              document.getElementById("event-time").value = `${hours}:${minutes}`

              document.getElementById("event-details").value = event.details || ""
              document.getElementById("event-contact").value = event.contactName || ""
              document.getElementById("event-phone").value = event.contactPhone || ""
              document.getElementById("generate-certificate").checked = event.generateCertificate !== false
            }
          } else {
            modalTitle.textContent = "Add New Event"
            deleteBtn.style.display = "none"
            selectedEventId = null
          }

          modal.style.display = "block"
        }

        function saveEvent() {
          const title = document.getElementById("event-title").value
          const type = document.getElementById("event-type").value
          const date = document.getElementById("event-date").value
          const time = document.getElementById("event-time").value
          const details = document.getElementById("event-details").value
          const contactName = document.getElementById("event-contact").value
          const contactPhone = document.getElementById("event-phone").value
          const generateCertificate = document.getElementById("generate-certificate").checked

          if (!title || !date || !time) {
            showNotification("Please fill in all required fields.", "error")
            return
          }

          const eventDateTime = `${date}T${time}`

          if (selectedEventId) {
            // Update existing event
            const eventIndex = calendarEvents.findIndex((e) => e.id === selectedEventId)
            if (eventIndex !== -1) {
              calendarEvents[eventIndex] = {
                ...calendarEvents[eventIndex],
                title,
                type,
                date: eventDateTime,
                details,
                contactName,
                contactPhone,
                generateCertificate,
              }
            }
          } else {
            // Create new event
            const newEvent = {
              id: Date.now().toString(),
              title,
              type,
              date: eventDateTime,
              details,
              contactName,
              contactPhone,
              generateCertificate,
            }

            calendarEvents.push(newEvent)
          }

          // Save to localStorage
          localStorage.setItem("calendarEvents", JSON.stringify(calendarEvents))

          // Close modal
          document.getElementById("event-modal").style.display = "none"

          // Refresh calendar
          renderCalendar()

          // Update upcoming events on dashboard
          updateUpcomingEvents()

          showNotification("Event saved successfully!", "success")
        }

        function deleteEvent() {
          if (!selectedEventId) return

          if (confirm("Are you sure you want to delete this event?")) {
            // Remove event from array
            calendarEvents = calendarEvents.filter((e) => e.id !== selectedEventId)

            // Save to localStorage
            localStorage.setItem("calendarEvents", JSON.stringify(calendarEvents))

            // Close modal
            document.getElementById("event-modal").style.display = "none"

            // Refresh calendar
            renderCalendar()

            // Update upcoming events on dashboard
            updateUpcomingEvents()

            showNotification("Event deleted successfully!", "warning")
          }
        }

        function updateUpcomingEvents() {
          const upcomingEventsList = document.getElementById("upcoming-events-list")
          if (!upcomingEventsList) return

          // Get upcoming events (next 5 days)
          const today = new Date()
          const fiveDaysLater = new Date()
          fiveDaysLater.setDate(today.getDate() + 5)

          const upcomingEvents = calendarEvents
            .filter((event) => {
              const eventDate = new Date(event.date)
              return eventDate >= today && eventDate <= fiveDaysLater
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 4)

          if (upcomingEvents.length === 0) {
            upcomingEventsList.innerHTML = '<div class="no-events">No upcoming events in the next 5 days.</div>'
            return
          }

          upcomingEventsList.innerHTML = ""

          upcomingEvents.forEach((event) => {
            const eventDate = new Date(event.date)
            const eventItem = document.createElement("div")
            eventItem.className = "event"

            const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

            const formattedTime = eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            const formattedDay = dayNames[eventDate.getDay()]
            const formattedDate = eventDate.getDate()
            const formattedMonth = monthNames[eventDate.getMonth()]
            const formattedYear = eventDate.getFullYear()

            eventItem.innerHTML = `
              <div class="event-time">${formattedTime}, ${formattedDay}, ${formattedDate} ${formattedMonth} ${formattedYear}</div>
              <div class="event-name">${event.title}</div>
              <div class="event-details">${event.details || "Check the details and ensure accuracy"}</div>
            `

            upcomingEventsList.appendChild(eventItem)
          })
        }

        function updateRecentActivity() {
          // This function would update recent activity - placeholder for now
        }

        function refreshCurrentTable() {
          const activeSection = document.querySelector(".content-section.active")
          if (!activeSection) return

          const sectionId = activeSection.id

          if (sectionId === "requests") {
            let filteredRequests = [...allRequests]

            // Apply filters
            const typeFilter = document.getElementById("all-filter-type")
            const statusFilter = document.getElementById("all-filter-status")

            if (typeFilter && typeFilter.value !== "all") {
              filteredRequests = filteredRequests.filter((r) => r.certificateType === typeFilter.value)
            }

            if (statusFilter && statusFilter.value !== "all") {
              filteredRequests = filteredRequests.filter((r) => r.status === statusFilter.value)
            }

            populateTable("all-requests-table", filteredRequests, "all")
          }
        }

        function filterTransactionsTable(searchTerm) {
          const table = document.getElementById("transactions-table")
          if (!table) return

          const rows = table.querySelectorAll("tr")

          rows.forEach((row) => {
            const text = row.textContent.toLowerCase()
            if (text.includes(searchTerm.toLowerCase())) {
              row.style.display = ""
            } else {
              row.style.display = "none"
            }
          })
        }

        function filterTable(tableId, searchTerm) {
          const table = document.getElementById(tableId)
          if (!table) return

          const rows = table.querySelectorAll("tr")

          rows.forEach((row) => {
            const text = row.textContent.toLowerCase()
            if (text.includes(searchTerm.toLowerCase())) {
              row.style.display = ""
            } else {
              row.style.display = "none"
            }
          })
        }

        function exportTransactions() {
          if (allTransactions.length === 0) {
            showNotification("No transactions to export!", "warning")
            return
          }

          // Create CSV content
          const headers = [
            "Transaction ID",
            "Reference Number",
            "Payment Date",
            "Customer Name",
            "Customer Email",
            "Certificate Type",
            "Payment Method",
            "Processing Fee",
            "Delivery Fee",
            "Total Amount",
            "Status",
            "Authorization Code",
            "Notes",
          ]

          const csvContent = [
            headers.join(","),
            ...allTransactions.map((t) =>
              [
                t.transactionId,
                t.referenceNumber,
                new Date(t.paymentDate).toLocaleString(),
                `"${t.customerName}"`,
                t.customerEmail,
                t.certificateType === "KUMPIL" ? "Confirmation" : "Baptismal",
                t.paymentMethod,
                t.processingFee,
                t.deliveryFee,
                t.totalAmount,
                t.status,
                t.authorizationCode || "",
                `"${t.notes || ""}"`,
              ].join(","),
            ),
          ].join("\n")

          // Create and download file
          const blob = new Blob([csvContent], { type: "text/csv" })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `transactions_export_${new Date().toISOString().split("T")[0]}.csv`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)

          showNotification("Transactions exported successfully!", "success")
        }

        function saveSettings() {
          // Save certificate settings
          localStorage.setItem("certificateSettings", JSON.stringify(certificateSettings))
          localStorage.setItem("imageAssets", JSON.stringify(imageAssets))

          showNotification("Settings saved successfully!", "success")
        }

        function resetSettings() {
          if (confirm("Are you sure you want to reset all settings to defaults?")) {
            // Reset certificate settings
            certificateSettings = {
              parishName: "Saint John the Evangelist Parish",
              parishAddress: "A. Mabini Avenue, Brgy. 2, Tanauan City, Batangas",
              parishPriest: "Rev. Fr. Romeo Barrion",
              watermarkOpacity: 0.2,
              defaultMinister: "REV. FR. ROMEO BARRION",
            }

            // Update form inputs
            document.getElementById("parish-name").value = certificateSettings.parishName
            document.getElementById("parish-address").value = certificateSettings.parishAddress
            document.getElementById("parish-priest").value = certificateSettings.parishPriest
            document.getElementById("watermark-opacity").value = certificateSettings.watermarkOpacity
            document.getElementById("opacity-value").textContent = "20%"

            // Reset image assets
            imageAssets = {
              parishLogo:
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eaaaa9b4-8947-4b49-bf39-9133a89f901a.jpg-oxUG8i2MhDNqYjCaFSgAyREgbILump.jpeg",
              parishSeal:
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eaaaa9b4-8947-4b49-bf39-9133a89f901a.jpg-oxUG8i2MhDNqYjCaFSgAyREgbILump.jpeg",
              signature:
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eaaaa9b4-8947-4b49-bf39-9133a89f901a.jpg-oxUG8i2MhDNqYjCaFSgAyREgbILump.jpeg",
            }

            // Update display elements
            updateSettingsRealTime()
            updateCertificateImages()

            // Remove from localStorage
            localStorage.removeItem("certificateSettings")
            localStorage.removeItem("imageAssets")

            showNotification("Settings reset to defaults!", "info")
          }
        }

        function updateSettingsRealTime() {
          // Update certificate settings object
          certificateSettings.parishName = document.getElementById("parish-name").value
          certificateSettings.parishAddress = document.getElementById("parish-address").value
          certificateSettings.parishPriest = document.getElementById("parish-priest").value
          certificateSettings.watermarkOpacity = document.getElementById("watermark-opacity").value

          // Update watermark opacity
          const watermark = document.querySelector(".certificate-watermark")
          if (watermark) {
            watermark.style.opacity = certificateSettings.watermarkOpacity
          }

          // Update opacity display
          const opacityValue = document.getElementById("opacity-value")
          if (opacityValue) {
            opacityValue.textContent = `${Math.round(certificateSettings.watermarkOpacity * 100)}%`
          }

          // Update certificate preview if currently showing default template
          const currentName = document.getElementById("preview-name").textContent
          if (currentName === "[FULL NAME]" || currentName === defaultCertificateData.fullName) {
            updateCertificatePreview(true)
          }
        }

        function updateCertificateImages() {
          // Update parish logo
          const parishLogos = document.querySelectorAll(".parish-logo img, .certificate-watermark img")
          parishLogos.forEach((img) => {
            img.src = imageAssets.parishLogo
          })

          // Update parish seal
          const parishSeals = document.querySelectorAll(".seal-image")
          parishSeals.forEach((img) => {
            img.src = imageAssets.parishSeal
          })

          // Update signature
          const signatures = document.querySelectorAll(".signature-image")
          signatures.forEach((img) => {
            img.src = imageAssets.signature
          })
        }

        function handleImageUpload(event, assetKey) {
          const file = event.target.files[0]
          if (!file) return

          // Validate file type
          if (!file.type.startsWith("image/")) {
            showNotification("Please select a valid image file.", "error")
            return
          }

          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            showNotification("Image file size must be less than 5MB.", "error")
            return
          }

          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target.result

            // Update image asset
            imageAssets[assetKey] = dataUrl

            // Update preview
            const previewId = event.target.id.replace("-upload", "-preview")
            const preview = document.getElementById(previewId)
            if (preview) {
              preview.src = dataUrl
            }

            // Update certificate preview
            updateCertificateImages()

            // Save to localStorage
            localStorage.setItem("imageAssets", JSON.stringify(imageAssets))

            showNotification("Image uploaded successfully!", "success")
          }

          reader.readAsDataURL(file)
        }

        // Global functions for request management
        window.viewRequestDetails = (refNumber) => {
          const request = allRequests.find((r) => r.refNumber === refNumber)
          if (!request) return

          // Populate modal with request details
          document.getElementById("modal-ref-number").textContent = request.refNumber
          document.getElementById("modal-date-requested").textContent = formatDate(request.dateRequested)
          document.getElementById("modal-cert-type").textContent =
            request.certificateType === "KUMPIL" ? "Confirmation Certificate" : "Baptismal Certificate"
          document.getElementById("modal-request-type").textContent = request.requestType
          document.getElementById("modal-copies").textContent = request.numberOfCopies
          document.getElementById("modal-purpose").textContent = request.purpose
          document.getElementById("modal-name").textContent = request.name
          document.getElementById("modal-dob").textContent = formatDate(request.dateOfBirth)
          document.getElementById("modal-pob").textContent = `${request.birthCity}, ${request.birthProvince}`
          document.getElementById("modal-sex").textContent = request.sex === "Male" ? "MALE" : "FEMALE"
          document.getElementById("modal-father").textContent = request.fatherName || "Not specified"
          document.getElementById("modal-mother").textContent = request.motherName || "Not specified"
          document.getElementById("modal-sacrament-date").textContent = formatDate(request.sacramentDate) || "Not specified"
          document.getElementById("modal-mobile").textContent = request.mobile
          document.getElementById("modal-email").textContent = request.email
          document.getElementById("modal-relationship").textContent = request.relationship
          document.getElementById("modal-delivery-method").textContent = request.deliveryMethod
          document.getElementById("modal-request-transaction-id").textContent = request.transactionId || "-"

          // Show/hide sponsor row based on certificate type
          const sponsorRow = document.getElementById("modal-sponsor-row")
          if (request.certificateType === "KUMPIL") {
            sponsorRow.style.display = "flex"
            document.getElementById("modal-sponsor").textContent = request.sponsorName || "Not specified"
          } else {
            sponsorRow.style.display = "none"
          }

          // Show delivery or pickup info
          const pickupInfo = document.getElementById("modal-pickup-info")
          const deliveryInfo = document.getElementById("modal-delivery-info")

          if (request.deliveryMethod === "Pickup") {
            pickupInfo.style.display = "block"
            deliveryInfo.style.display = "none"
            document.getElementById("modal-pickup-date").textContent = formatDate(request.pickupDate) || "Not specified"
            document.getElementById("modal-pickup-contact").textContent = request.pickupContact || "Not specified"
          } else {
            pickupInfo.style.display = "none"
            deliveryInfo.style.display = "block"
            document.getElementById("modal-delivery-address").textContent = request.deliveryAddress || "Not specified"
          }

          // Show modal
          document.getElementById("request-details-modal").style.display = "block"
        }

        window.approveRequest = (refNumber) => {
          if (confirm(`Are you sure you want to approve request ${refNumber}?`)) {
            const request = allRequests.find((r) => r.refNumber === refNumber)
            if (request) {
              request.status = "approved"
              request.dateApproved = new Date().toISOString().split("T")[0]

              // Save updated requests
              localStorage.setItem("adminRequests", JSON.stringify(allRequests))

              // Refresh tables and stats
              populateAllTables()
              updateDashboardStats()

              showNotification("Request approved successfully!", "success")
            }
          }
        }

        window.rejectRequest = (refNumber) => {
          if (confirm(`Are you sure you want to reject request ${refNumber}?`)) {
            const request = allRequests.find((r) => r.refNumber === refNumber)
            if (request) {
              request.status = "rejected"

              // Save updated requests
              localStorage.setItem("adminRequests", JSON.stringify(allRequests))

              // Refresh tables and stats
              populateAllTables()
              updateDashboardStats()

              showNotification("Request rejected successfully!", "warning")
            }
          }
        }

        window.generateCertificateFromRequest = (refNumber) => {
          const request = allRequests.find((r) => r.refNumber === refNumber)
          if (!request) return

          // Switch to certificate generator section
          showSection("certificate-generator")

          // Populate form with request data
          document.getElementById("cert-type").value = request.certificateType
          document.getElementById("cert-number").value = Math.floor(Math.random() * 9999) + 1000 // Generate random cert number
          document.getElementById("cert-name").value = request.name
          document.getElementById("cert-father").value = request.fatherName
          document.getElementById("cert-mother").value = request.motherName
          document.getElementById("cert-birthplace").value = `${request.birthCity}, ${request.birthProvince}`
          document.getElementById("cert-birthdate").value = request.dateOfBirth
          document.getElementById("cert-sacrament-date").value = request.sacramentDate
          document.getElementById("cert-minister").value = certificateSettings.defaultMinister
          document.getElementById("cert-register").value =
            `No. ${Math.floor(Math.random() * 100)} Page ${Math.floor(Math.random() * 500)} Line ${Math.floor(Math.random() * 50)}`

          // Set purpose
          const purposeMapping = {
            "PANG-ESKWELA": "School Requirement",
            "PANG-TRABAHO": "Employment",
            "PANG-KASAL": "Marriage Requirement",
            "PANG-KUMPIL": "Confirmation Requirement",
            "PANG-LEGAL": "Legal Requirement",
            "PANG-BIYAHE": "Travel",
            "PERSONAL NA REKORD": "Record/Reference",
          }

          const mappedPurpose = purposeMapping[request.purpose] || "Record/Reference"
          document.getElementById("cert-purpose").value = mappedPurpose

          // Set sponsors if available
          if (request.sponsorName) {
            const sponsorInputs = document.querySelectorAll(".sponsor-input")
            if (sponsorInputs.length > 0) {
              sponsorInputs[0].value = request.sponsorName
            }
          }

          // Update preview with actual data
          updateCertificatePreview(false)

          // Mark request as completed if it was approved or paid
          if (request.status === "approved" || request.status === "paid") {
            request.status = "completed"
            request.dateCompleted = new Date().toISOString().split("T")[0]

            // Save updated requests
            localStorage.setItem("adminRequests", JSON.stringify(allRequests))

            // Refresh tables and stats
            populateAllTables()
            updateDashboardStats()
          }

          // Show notification
          showNotification("Certificate form populated with request data!", "info")
        }

        function generateCertificateFromEvent(eventId) {
          const event = calendarEvents.find((e) => e.id === eventId)
          if (!event) return

          // Switch to certificate generator section
          showSection("certificate-generator")

          // Populate form with event data
          document.getElementById("cert-type").value = event.type
          document.getElementById("cert-number").value = Math.floor(Math.random() * 9999) + 1000 // Generate random cert number

          // Extract name from title (format is usually "TYPE - NAME")
          const nameParts = event.title.split(" - ")
          if (nameParts.length > 1) {
            document.getElementById("cert-name").value = nameParts[1].toUpperCase()
          } else {
            document.getElementById("cert-name").value = "NAME NOT SPECIFIED"
          }

          // Set other fields with placeholder data
          document.getElementById("cert-father").value = "FATHER'S NAME"
          document.getElementById("cert-mother").value = "MOTHER'S NAME"
          document.getElementById("cert-birthplace").value = "BIRTHPLACE"

          // Set dates
          const eventDate = new Date(event.date)
          const birthDate = new Date()
          birthDate.setFullYear(birthDate.getFullYear() - (event.type === "BAPTISM" ? 1 : 15)) // Assume 1 year for baptism, 15 for confirmation

          document.getElementById("cert-birthdate").value = birthDate.toISOString().split("T")[0]
          document.getElementById("cert-sacrament-date").value = eventDate.toISOString().split("T")[0]

          document.getElementById("cert-minister").value = certificateSettings.defaultMinister
          document.getElementById("cert-register").value =
            `No. ${Math.floor(Math.random() * 100)} Page ${Math.floor(Math.random() * 500)} Line ${Math.floor(Math.random() * 50)}`
          document.getElementById("cert-purpose").value = "Record/Reference"

          // Update preview
          updateCertificatePreview(false)

          showNotification("Certificate form populated with event data!", "info")
        }

        function showNotification(message, type = "info") {
          const notification = document.createElement("div")
          notification.className = `notification notification-${type}`
          notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
          `

          // Add notification to body
          document.body.appendChild(notification)

          // Add close button functionality
          const closeBtn = notification.querySelector(".notification-close")
          closeBtn.addEventListener("click", () => {
            notification.remove()
          })

          // Auto-remove after 5 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove()
            }
          }, 5000)
        }

        function getNotificationIcon(type) {
          switch (type) {
            case "success":
              return "check-circle"
            case "error":
              return "exclamation-circle"
            case "warning":
              return "exclamation-triangle"
            case "info":
              return "info-circle"
            default:
              return "info-circle"
          }
        }

        function formatDate(dateString) {
          if (!dateString) return ""
          const date = new Date(dateString)
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }

        function formatDateForCertificate(dateString) {
          if (!dateString || dateString === "[DATE OF BIRTH]" || dateString === "[DATE OF SACRAMENT]") {
            return dateString // Return placeholder as-is
          }

          const date = new Date(dateString)
          const day = date.getDate()
          const month = date.toLocaleDateString("en-US", { month: "long" })
          const year = date.getFullYear()

          const ordinal = getOrdinal(day)
          return `${ordinal} day of ${month}, ${year}`
        }

        function getOrdinal(day) {
          if (day > 3 && day < 21) return day + "th"
          switch (day % 10) {
            case 1:
              return day + "st"
            case 2:
              return day + "nd"
            case 3:
              return day + "rd"
            default:
              return day + "th"
          }
        }

        // Placeholder functions for missing functionality
        function createRequestFromFormData(data) {
          // This would create a request object from form data
          return {}
        }

        function createEventFromScheduleData(data) {
          // This would create an event object from schedule data
          return {}
        }