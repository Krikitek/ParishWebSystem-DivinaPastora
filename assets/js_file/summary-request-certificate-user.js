// Enhanced Summary Page with Fixed UI - Eliminates Flashing and Improves Performance
document.addEventListener("DOMContentLoaded", () => {
  // State management system
  const SummaryState = {
    allRequests: [],
    currentRequestId: null,
    displayMode: "loading", // 'loading', 'single', 'multiple', 'empty'
    isUpdating: false,
    lastUpdateTime: 0,

    // Getters
    get hasRequests() {
      return this.allRequests.length > 0
    },

    get isSingleRequest() {
      return this.allRequests.length === 1
    },

    get isMultipleRequests() {
      return this.allRequests.length > 1
    },

    // State setters with change detection
    setRequests(requests) {
      const hasChanged = JSON.stringify(this.allRequests) !== JSON.stringify(requests)
      if (hasChanged) {
        this.allRequests = requests
        this.scheduleUpdate()
      }
    },

    setDisplayMode(mode) {
      if (this.displayMode !== mode) {
        this.displayMode = mode
        this.scheduleUpdate()
      }
    },

    // Update scheduling to prevent rapid re-renders
    scheduleUpdate() {
      if (this.isUpdating) return

      const now = Date.now()
      if (now - this.lastUpdateTime < 100) {
        // Debounce updates
        clearTimeout(this.updateTimeout)
        this.updateTimeout = setTimeout(() => this.performUpdate(), 100)
        return
      }

      requestAnimationFrame(() => this.performUpdate())
    },

    performUpdate() {
      this.isUpdating = true
      this.lastUpdateTime = Date.now()

      try {
        this.renderCurrentState()
      } finally {
        this.isUpdating = false
      }
    },

    renderCurrentState() {
      switch (this.displayMode) {
        case "loading":
          this.showLoadingState()
          break
        case "empty":
          this.showEmptyState()
          break
        case "single":
          this.showSingleRequestView()
          break
        case "multiple":
          this.showMultipleRequestsView()
          break
      }
    },
  }

  // DOM Element Cache for performance
  const ElementCache = {
    cache: new Map(),

    get(selector) {
      if (!this.cache.has(selector)) {
        this.cache.set(selector, document.querySelector(selector))
      }
      return this.cache.get(selector)
    },

    getAll(selector) {
      const cacheKey = `all:${selector}`
      if (!this.cache.has(cacheKey)) {
        this.cache.set(cacheKey, document.querySelectorAll(selector))
      }
      return this.cache.get(cacheKey)
    },

    clear() {
      this.cache.clear()
    },
  }

  // Optimized DOM manipulation utilities
  const DOMUtils = {
    // Smooth transition between states
    transitionTo(element, newContent, callback) {
      if (!element) return

      element.style.opacity = "0"
      element.style.transition = "opacity 0.2s ease-in-out"

      setTimeout(() => {
        if (typeof newContent === "string") {
          element.innerHTML = newContent
        } else if (typeof newContent === "function") {
          newContent(element)
        }

        element.style.opacity = "1"
        if (callback) callback()
      }, 200)
    },

    // Create element with attributes efficiently
    createElement(tag, attributes = {}, children = []) {
      const element = document.createElement(tag)

      Object.entries(attributes).forEach(([key, value]) => {
        if (key === "className") {
          element.className = value
        } else if (key === "innerHTML") {
          element.innerHTML = value
        } else {
          element.setAttribute(key, value)
        }
      })

      children.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child))
        } else {
          element.appendChild(child)
        }
      })

      return element
    },

    // Update element content efficiently
    updateElement(id, value) {
      const element = ElementCache.get(`#${id}`)
      if (element && value !== undefined && value !== null) {
        // Remove loading state
        const loadingSpan = element.querySelector(".table-loading")
        if (loadingSpan) {
          loadingSpan.remove()
        }

        if (element.textContent !== value) {
          element.textContent = value
        }
      }
    },

    // Show/hide elements with animation
    showElement(element, animationClass = "fade-in") {
      if (element) {
        element.style.display = "block"
        element.classList.add(animationClass)
      }
    },

    hideElement(element) {
      if (element) {
        element.style.display = "none"
        element.classList.remove("fade-in", "slide-in")
      }
    },
  }

  // Memoization for expensive calculations
  const MemoCache = {
    cache: new Map(),

    memoize(key, fn) {
      if (this.cache.has(key)) {
        return this.cache.get(key)
      }

      const result = fn()
      this.cache.set(key, result)

      // Clear cache after 5 minutes to prevent memory leaks
      setTimeout(() => this.cache.delete(key), 5 * 60 * 1000)

      return result
    },

    invalidate(pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    },
  }

  // Initialize the component
  init()

  async function init() {
    // Show loading state immediately
    SummaryState.setDisplayMode("loading")

    // Load data asynchronously
    await loadAllRequests()

    // Determine display mode
    determineDisplayMode()

    // Set up optimized event listeners
    setupOptimizedEventListeners()

    // Start optimized status checking
    startOptimizedStatusChecking()
  }

  async function loadAllRequests() {
    return new Promise((resolve) => {
      // Simulate async loading to prevent blocking
      setTimeout(() => {
        const storedRequests = localStorage.getItem("allCertificateRequests")
        let requests = []

        if (storedRequests) {
          try {
            requests = JSON.parse(storedRequests)
          } catch (error) {
            console.error("Error loading requests:", error)
            requests = []
          }
        }

        // Check for legacy data migration
        const legacyData = localStorage.getItem("baptismRequestData")
        if (legacyData && requests.length === 0) {
          try {
            const parsedLegacyData = JSON.parse(legacyData)
            if (parsedLegacyData.requestDetails) {
              const migratedRequest = {
                id: `legacy_${Date.now()}`,
                data: parsedLegacyData,
                createdAt: new Date().toISOString(),
                status: "completed",
              }
              requests = [migratedRequest]
              localStorage.setItem("allCertificateRequests", JSON.stringify(requests))
              localStorage.removeItem("baptismRequestData")
            }
          } catch (error) {
            console.error("Error migrating legacy data:", error)
          }
        }

        SummaryState.setRequests(requests)
        resolve()
      }, 50) // Small delay to show loading state
    })
  }

  function determineDisplayMode() {
    // Determine current request ID
    const urlParams = new URLSearchParams(window.location.search)
    const requestIdFromUrl = urlParams.get("requestId")
    const requestIdFromSession = sessionStorage.getItem("currentRequestId")

    if (requestIdFromUrl) {
      SummaryState.currentRequestId = requestIdFromUrl
    } else if (requestIdFromSession) {
      SummaryState.currentRequestId = requestIdFromSession
      sessionStorage.removeItem("currentRequestId")
    } else if (SummaryState.isSingleRequest) {
      SummaryState.currentRequestId = SummaryState.allRequests[0].id
    }

    // Set display mode
    if (!SummaryState.hasRequests) {
      SummaryState.setDisplayMode("empty")
    } else if (SummaryState.isSingleRequest) {
      SummaryState.setDisplayMode("single")
    } else {
      SummaryState.setDisplayMode("multiple")
    }
  }

  // Optimized state renderers
  SummaryState.showLoadingState = () => {
    const container = ElementCache.get(".summary-container")
    if (!container) return

    // Hide all sections
    const sections = container.querySelectorAll(".summary-section")
    sections.forEach((section) => DOMUtils.hideElement(section))

    // Show loading state
    const loadingState = container.querySelector(".loading-state")
    if (loadingState) {
      DOMUtils.showElement(loadingState)
    }
  }

  SummaryState.showEmptyState = () => {
    const container = ElementCache.get(".summary-container")
    if (!container) return

    // Hide all sections
    const sections = container.querySelectorAll(".summary-section")
    sections.forEach((section) => DOMUtils.hideElement(section))

    // Show empty state
    const emptyState = container.querySelector(".empty-state")
    if (emptyState) {
      DOMUtils.showElement(emptyState)
    }
  }

  SummaryState.showSingleRequestView = function () {
    const request = this.allRequests.find((req) => req.id === this.currentRequestId) || this.allRequests[0]
    if (!request) return

    const certificateType = request.data.requestDetails?.certificateType || "BAPTISMAL"

    // Hide loading and empty states
    const container = ElementCache.get(".summary-container")
    if (container) {
      const loadingState = container.querySelector(".loading-state")
      const emptyState = container.querySelector(".empty-state")
      DOMUtils.hideElement(loadingState)
      DOMUtils.hideElement(emptyState)
    }

    // Show all individual sections
    this.showIndividualSections()

    // Update progress labels efficiently
    this.updateProgressLabels(certificateType)

    // Batch all single request updates
    requestAnimationFrame(() => {
      this.populateCertificateDetails(request.data, certificateType)
      this.populateRequesterDetails(request.data)
      this.populateParentInformation(request.data)
      this.populateDeliveryDetails(request.data)
      this.calculateAndDisplayFees(request.data, certificateType)
      this.updateSingleRequestActions(request)
      this.checkPaymentStatus(request.data)
    })
  }

  SummaryState.showMultipleRequestsView = function () {
    // Update page title efficiently
    const headerTitle = ElementCache.get(".summary-header h2")
    if (headerTitle) {
      headerTitle.innerHTML = `
        Buod ng Mga Kahilingan (${this.allRequests.length})
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Summary of Requests (${this.allRequests.length})
        </span>
      `
    }

    // Hide individual sections and show table
    this.hideIndividualSections()
    this.createOptimizedRequestsTable()
    this.updateMultipleRequestsActions()
  }

  SummaryState.createOptimizedRequestsTable = function () {
    const summaryContainer = ElementCache.get(".summary-container")
    if (!summaryContainer) return

    // Remove existing table efficiently
    const existingTable = document.getElementById("multiple-requests-table")
    if (existingTable) {
      existingTable.remove()
    }

    // Create table with memoized calculations
    const tableData = MemoCache.memoize(`table-data-${JSON.stringify(this.allRequests)}`, () => {
      return this.calculateTableData()
    })

    const tableContainer = DOMUtils.createElement("div", {
      id: "multiple-requests-table",
      className: "summary-section fade-in",
    })

    tableContainer.innerHTML = `
      <div class="section-header">
        <div>
          <h3 class="section-title">
            Mga Kahilingan para sa Sertipiko
          </h3>
          <div class="section-subtitle">Certificate Requests</div>
        </div>
      </div>
      <div class="section-content">
        <div class="table-container">
          <table class="requests-table">
            <thead>
              <tr>
                <th>
                  #<br>
                  <span style="font-style: italic; font-size: 0.8em;">No.</span>
                </th>
                <th>
                  URI NG SERTIPIKO<br>
                  <span style="font-style: italic; font-size: 0.8em;">Certificate Type</span>
                </th>
                <th>
                  PANGALAN NG MAY-ARI<br>
                  <span style="font-style: italic; font-size: 0.8em;">Owner's Name</span>
                </th>
                <th>
                  PETSA NG PANGYAYARI<br>
                  <span style="font-style: italic; font-size: 0.8em;">Event Date</span>
                </th>
                <th>
                  BILANG NG KOPYA<br>
                  <span style="font-style: italic; font-size: 0.8em;">Copies</span>
                </th>
                <th>
                  PAGHAHATID<br>
                  <span style="font-style: italic; font-size: 0.8em;">Delivery</span>
                </th>
                <th>
                  HALAGA<br>
                  <span style="font-style: italic; font-size: 0.8em;">Amount</span>
                </th>
                <th>
                  STATUS<br>
                  <span style="font-style: italic; font-size: 0.8em;">Status</span>
                </th>
                <th>
                  AKSYON<br>
                  <span style="font-style: italic; font-size: 0.8em;">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              ${this.generateTableRows(tableData)}
            </tbody>
          </table>
        </div>
      </div>
    `

    // Insert table after progress steps
    const progressSteps = ElementCache.get(".progress-steps")
    if (progressSteps) {
      progressSteps.insertAdjacentElement("afterend", tableContainer)
    }
  }

  SummaryState.calculateTableData = function () {
    let totalAmount = 0

    const rows = this.allRequests.map((request, index) => {
      const data = request.data
      const details = data.requestDetails
      const certificateType = details?.certificateType || "BAPTISMAL"
      const numberOfCopies = Number.parseInt(details?.numberOfCopies || "1")
      const isPickup = data.deliveryDetails?.deliveryOption === "pickup"

      // Calculate amount
      const baseCertificatePrice = 100
      const certificatePrice = numberOfCopies * baseCertificatePrice
      const deliveryFee = isPickup ? 0 : 150
      const requestAmount = certificatePrice + deliveryFee
      totalAmount += requestAmount

      return {
        index: index + 1,
        id: request.id,
        certificateType: certificateType === "KUMPIL" ? "KUMPIL" : "BINYAG",
        ownerName: this.formatName(details?.lastName, details?.firstName, details?.middleName),
        eventDate: details?.sacramentDate ? this.formatDate(details.sacramentDate) : "Hindi nabanggit",
        numberOfCopies,
        deliveryMethod: isPickup ? "PICKUP" : "DELIVERY",
        amount: requestAmount,
        status: this.getRequestStatus(request),
      }
    })

    return { rows, totalAmount }
  }

  SummaryState.generateTableRows = (tableData) => {
    const { rows, totalAmount } = tableData

    const dataRows = rows
      .map(
        (row) => `
      <tr>
        <td>${row.index}</td>
        <td>${row.certificateType}</td>
        <td>${row.ownerName}</td>
        <td>${row.eventDate}</td>
        <td>${row.numberOfCopies}</td>
        <td>${row.deliveryMethod}</td>
        <td>PHP ${row.amount.toFixed(2)}</td>
        <td>
          <span class="status-badge ${row.status.class}">
            ${row.status.text}
          </span>
        </td>
        <td class="action-cell">
          <button class="action-btn edit-btn" onclick="editRequest('${row.id}')" title="I-edit ang Kahilingan">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" onclick="window.deleteRequest('${row.id}')" title="Burahin ang Kahilingan">
            <i class="fas fa-trash-alt"></i>
          </button>
          <button class="action-btn view-btn" onclick="viewRequest('${row.id}')" title="Tingnan ang Detalye">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `,
      )
      .join("")

    const totalRow = `
      <tr class="total-amount-row">
        <td colspan="6" style="text-align: right; padding-right: 20px;">
          KABUUANG HALAGA / TOTAL AMOUNT:
        </td>
        <td>PHP ${totalAmount.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>
    `

    return dataRows + totalRow
  }

  // Optimized helper methods
  SummaryState.hideIndividualSections = () => {
    const sectionsToHide = [
      "#certificate-details-section",
      "#parent-details-section",
      "#requester-details-section",
      "#delivery-details-section",
      ".fee-breakdown",
    ]

    sectionsToHide.forEach((selector) => {
      const element = ElementCache.get(selector)
      DOMUtils.hideElement(element)
    })

    // Hide loading and empty states
    const container = ElementCache.get(".summary-container")
    if (container) {
      const loadingState = container.querySelector(".loading-state")
      const emptyState = container.querySelector(".empty-state")
      DOMUtils.hideElement(loadingState)
      DOMUtils.hideElement(emptyState)
    }
  }

  SummaryState.showIndividualSections = () => {
    const sectionsToShow = [
      "#certificate-details-section",
      "#parent-details-section",
      "#requester-details-section",
      "#delivery-details-section",
      ".fee-breakdown",
    ]

    sectionsToShow.forEach((selector) => {
      const element = ElementCache.get(selector)
      DOMUtils.showElement(element)
    })

    // Hide multiple requests table
    const multipleTable = document.getElementById("multiple-requests-table")
    DOMUtils.hideElement(multipleTable)

    // Hide loading and empty states
    const container = ElementCache.get(".summary-container")
    if (container) {
      const loadingState = container.querySelector(".loading-state")
      const emptyState = container.querySelector(".empty-state")
      DOMUtils.hideElement(loadingState)
      DOMUtils.hideElement(emptyState)
    }
  }

  // Implement remaining methods with optimizations
  SummaryState.updateProgressLabels = (certType) => {
    const certificateNameFilipino = certType === "KUMPIL" ? "KUMPIL" : "BINYAG"
    const certificateNameEnglish = certType === "KUMPIL" ? "Confirmation" : "Baptism"

    const progressStepLabel = ElementCache.get("#progress-step1-label")
    if (progressStepLabel) {
      progressStepLabel.innerHTML = `Mga Detalye ng Kahilingan - ${certificateNameFilipino}<br>
        <span class="step-subtitle">
          Request Details - ${certificateNameEnglish}
        </span>`
    }
  }

  SummaryState.populateCertificateDetails = function (data, certType) {
    if (!data.requestDetails) return

    const details = data.requestDetails

    // Update certificate type display
    DOMUtils.updateElement("certificate-type-display", certType === "KUMPIL" ? "KUMPIL" : "BINYAG")

    // Update event date header
    const eventDateHeader = ElementCache.get("#event-date-header")
    if (eventDateHeader) {
      eventDateHeader.innerHTML = `
        ${certType === "KUMPIL" ? "PETSA NG KUMPIL" : "PETSA NG BINYAG"}
        <br>
        <span class="th-subtitle">${certType === "KUMPIL" ? "Date of Confirmation" : "Date of Baptism"}</span>
      `
    }

    // Update other fields
    const fullName = this.formatName(details.lastName, details.firstName, details.middleName)
    DOMUtils.updateElement("document-owner-name", fullName)
    DOMUtils.updateElement(
      "event-date",
      details.sacramentDate ? this.formatDate(details.sacramentDate) : "Hindi nabanggit",
    )

    // Format place of birth
    const birthPlace = this.formatLocation(details.birthCity, details.birthProvince)
    DOMUtils.updateElement("event-place", birthPlace)
    DOMUtils.updateElement("number-of-copies", details.numberOfCopies || "1")
  }

  SummaryState.populateRequesterDetails = function (data) {
    let requesterName = data.requesterName
    if (!requesterName && data.requestDetails) {
      requesterName = this.formatName(
        data.requestDetails.lastName,
        data.requestDetails.firstName,
        data.requestDetails.middleName,
      )
    }

    DOMUtils.updateElement("requester-name", requesterName || "")
    DOMUtils.updateElement("requester-email", data.requesterEmail || "")
    DOMUtils.updateElement("requester-mobile", data.requesterMobile || "")
    DOMUtils.updateElement("requester-relationship", data.requestDetails?.relationship || "")
    DOMUtils.updateElement("requester-purpose", data.requestDetails?.purpose || "")
  }

  SummaryState.populateParentInformation = function (data) {
    if (!data.requestDetails) return

    const details = data.requestDetails
    const fatherName = this.formatName(details.fatherLastName, details.fatherFirstName, details.fatherMiddleName)
    const motherName = this.formatName(details.motherLastName, details.motherFirstName, details.motherMiddleName)

    DOMUtils.updateElement("father-name", fatherName || "Hindi nabanggit")
    DOMUtils.updateElement("mother-name", motherName || "Hindi nabanggit")
  }

  SummaryState.populateDeliveryDetails = (data) => {
    if (!data.deliveryDetails) return

    const delivery = data.deliveryDetails
    const isPickup = delivery.deliveryOption === "pickup"

    if (isPickup) {
      DOMUtils.updateElement("delivery-method", "PICK UP")
      DOMUtils.updateElement("address-line-1", "N/A")
      DOMUtils.updateElement("address-line-2", "N/A")
      DOMUtils.updateElement("barangay", "N/A")
      DOMUtils.updateElement("location", "OPISINA NG PAROKYA")
    } else {
      DOMUtils.updateElement("delivery-method", "PAGHAHATID")
      DOMUtils.updateElement("address-line-1", delivery.addressLine1 || "")
      DOMUtils.updateElement("address-line-2", delivery.addressLine2 || "")
      DOMUtils.updateElement("barangay", delivery.deliveryBarangay || "")

      const location = SummaryState.formatLocation(delivery.deliveryCity, delivery.deliveryProvince)
      DOMUtils.updateElement("location", location)
    }
  }

  SummaryState.calculateAndDisplayFees = (data, certType) => {
    const numberOfCopies = Number.parseInt(data.requestDetails?.numberOfCopies || "1")
    const isPickup = data.deliveryDetails?.deliveryOption === "pickup"

    const baseCertificatePrice = 100
    const certificatePrice = numberOfCopies * baseCertificatePrice
    const deliveryFee = isPickup ? 0 : 150
    const totalAmount = certificatePrice + deliveryFee

    DOMUtils.updateElement("certificate-fee-amount", `PHP ${certificatePrice.toFixed(2)}`)
    DOMUtils.updateElement("total-fee-amount", `PHP ${totalAmount.toFixed(2)}`)

    // Handle delivery fee display
    const deliveryFeeRow = ElementCache.get("#delivery-fee-row")
    if (deliveryFeeRow) {
      if (isPickup) {
        DOMUtils.hideElement(deliveryFeeRow)
      } else {
        DOMUtils.showElement(deliveryFeeRow)
        DOMUtils.updateElement("delivery-fee-amount", `PHP ${deliveryFee.toFixed(2)}`)
      }
    }
  }

  SummaryState.checkPaymentStatus = (data) => {
    const referenceNumber = data.referenceNumber
    if (!referenceNumber) return

    const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")
    const adminRequest = adminRequests.find((req) => req.refNumber === referenceNumber)

    if (adminRequest) {
      updatePaymentStatusUI(adminRequest.status, adminRequest.paymentStatus)
    }
  }

  SummaryState.updateSingleRequestActions = (request) => {
    const summaryActions = ElementCache.get(".summary-actions")
    if (summaryActions) {
      summaryActions.innerHTML = `
        <button class="btn add-request-btn" id="add-new-request-btn">
          <i class="fas fa-plus"></i> Magdagdag ng Bagong Kahilingan
        </button>
        <div class="right-actions">
          <button class="btn cancel-btn" id="cancel-summary-btn">
            <i class="fas fa-times"></i> Kanselahin
          </button>
          <button class="btn next-btn" id="next-summary-btn">
            <i class="fas fa-arrow-right"></i> Susunod
          </button>
        </div>
      `
    }
  }

  SummaryState.updateMultipleRequestsActions = () => {
    const summaryActions = ElementCache.get(".summary-actions")
    if (summaryActions) {
      summaryActions.innerHTML = `
        <button class="btn add-request-btn" id="add-new-request-btn">
          <i class="fas fa-plus"></i> Magdagdag ng Bagong Kahilingan
        </button>
        <div class="right-actions">
          <button class="btn cancel-btn" id="cancel-all-btn">
            <i class="fas fa-times"></i> Kanselahin Lahat
          </button>
          <button class="btn next-btn" id="proceed-all-btn">
            <i class="fas fa-arrow-right"></i> Magpatuloy sa Lahat
          </button>
        </div>
      `
    }
  }

  // Optimized event listeners with debouncing
  function setupOptimizedEventListeners() {
    const debouncedHandlers = new Map()

    function createDebouncedHandler(handler, delay = 300) {
      return function (...args) {
        const key = handler.name || "anonymous"
        clearTimeout(debouncedHandlers.get(key))
        debouncedHandlers.set(
          key,
          setTimeout(() => handler.apply(this, args), delay),
        )
      }
    }

    // Edit certificate button
    const editCertBtn = ElementCache.get("#edit-certificate-btn")
    if (editCertBtn) {
      editCertBtn.addEventListener(
        "click",
        createDebouncedHandler(() => {
          if (SummaryState.currentRequestId) {
            sessionStorage.setItem("editingRequestId", SummaryState.currentRequestId)
            sessionStorage.setItem("currentFormStep", "step1")
            window.location.href = "request-certificate-form-user.html"
          }
        }),
      )
    }

    // Edit delivery button
    const editDeliveryBtn = ElementCache.get("#edit-delivery-btn")
    if (editDeliveryBtn) {
      editDeliveryBtn.addEventListener(
        "click",
        createDebouncedHandler(() => {
          if (SummaryState.currentRequestId) {
            sessionStorage.setItem("editingRequestId", SummaryState.currentRequestId)
            sessionStorage.setItem("currentFormStep", "delivery")
            window.location.href = "request-certificate-form-user.html"
          }
        }),
      )
    }

    // Use event delegation for dynamic buttons
    document.addEventListener(
      "click",
      createDebouncedHandler((e) => {
        if (e.target.id === "add-new-request-btn" || e.target.closest("#add-new-request-btn")) {
          if (confirm("Magsisimula ito ng bagong kahilingan para sa sertipiko. Magpapatuloy ka ba?")) {
            window.location.href = "request-certificate-form-user.html"
          }
        }

        if (e.target.id === "cancel-all-btn" || e.target.closest("#cancel-all-btn")) {
          if (confirm("Sigurado ka bang gusto mong kanselahin ang lahat ng kahilingan?")) {
            localStorage.removeItem("allCertificateRequests")
            localStorage.removeItem("baptismRequestData")
            window.location.href = "dashboard-user.html"
          }
        }

        if (e.target.id === "proceed-all-btn" || e.target.closest("#proceed-all-btn")) {
          SummaryState.allRequests.forEach((request) => {
            request.status = "ready-for-acknowledgement"
          })
          localStorage.setItem("allCertificateRequests", JSON.stringify(SummaryState.allRequests))
          window.location.href = "acknowledgement-request-certificate-user.html"
        }

        if (e.target.id === "cancel-summary-btn" || e.target.closest("#cancel-summary-btn")) {
          if (confirm("Sigurado ka bang gusto mong kanselahin ang kahilingang ito?")) {
            if (SummaryState.currentRequestId) {
              window.deleteRequest(SummaryState.currentRequestId)
            } else {
              window.location.href = "dashboard-user.html"
            }
          }
        }

        if (e.target.id === "next-summary-btn" || e.target.closest("#next-summary-btn")) {
          window.location.href = "acknowledgement-request-certificate-user.html"
        }
      }, 100),
    )
  }

  // Optimized status checking with intelligent polling
  function startOptimizedStatusChecking() {
    let pollInterval = 5000 // Start with 5 seconds
    let consecutiveNoChanges = 0

    function checkStatus() {
      if (!SummaryState.currentRequestId || SummaryState.displayMode !== "single") {
        return
      }

      const currentRequest = SummaryState.allRequests.find((req) => req.id === SummaryState.currentRequestId)
      if (!currentRequest) return

      const adminRequests = JSON.parse(localStorage.getItem("adminRequests") || "[]")
      const adminRequest = adminRequests.find((req) => req.refNumber === currentRequest.data.referenceNumber)

      if (adminRequest) {
        const hasStatusChanged = updatePaymentStatusUI(adminRequest.status, adminRequest.paymentStatus)

        if (hasStatusChanged) {
          consecutiveNoChanges = 0
          pollInterval = 3000 // Increase frequency when changes detected
        } else {
          consecutiveNoChanges++
          // Gradually decrease polling frequency if no changes
          if (consecutiveNoChanges > 5) {
            pollInterval = Math.min(pollInterval * 1.2, 30000) // Max 30 seconds
          }
        }
      }

      setTimeout(checkStatus, pollInterval)
    }

    // Start status checking
    setTimeout(checkStatus, 3000)
  }

  // Optimized utility functions with memoization
  SummaryState.formatName = (lastName, firstName, middleName) => {
    const cacheKey = `name:${lastName}:${firstName}:${middleName}`
    return MemoCache.memoize(cacheKey, () => {
      if (!lastName || !firstName) return ""
      const middle = middleName ? ` ${middleName.toUpperCase()}` : ""
      return `${lastName.toUpperCase()}, ${firstName.toUpperCase()}${middle}`
    })
  }

  SummaryState.formatDate = (dateString) => {
    const cacheKey = `date:${dateString}`
    return MemoCache.memoize(cacheKey, () => {
      if (!dateString) return ""
      const date = new Date(dateString)
      const options = { year: "numeric", month: "long", day: "numeric" }
      return date.toLocaleDateString("tl-PH", options).toUpperCase()
    })
  }

  SummaryState.formatLocation = (city, province) => {
    const cacheKey = `location:${city}:${province}`
    return MemoCache.memoize(cacheKey, () => {
      const parts = [city, province].filter(Boolean)
      return parts.join(", ")
    })
  }

  SummaryState.getRequestStatus = (request) => {
    const cacheKey = `status:${request.id}:${request.status}:${request.data.paymentStatus}`
    return MemoCache.memoize(cacheKey, () => {
      const status = request.status || "draft"
      const paymentStatus = request.data.paymentStatus

      if (paymentStatus === "completed" || status === "paid") {
        return { text: "NABAYAD", class: "paid" }
      } else if (paymentStatus === "approved" || status === "approved") {
        return { text: "INAPRUBAHAN", class: "approved" }
      } else if (paymentStatus === "rejected" || status === "rejected") {
        return { text: "ITINANGGI", class: "rejected" }
      } else if (status === "completed") {
        return { text: "KUMPLETO", class: "completed" }
      } else {
        return { text: "DRAFT", class: "draft" }
      }
    })
  }

  function updatePaymentStatusUI(status, paymentStatus) {
    const summaryContainer = ElementCache.get(".summary-container")
    if (!summaryContainer) return false

    const existingStatus = summaryContainer.querySelector(".payment-status-indicator")
    let hasChanged = false

    // Check if status actually changed
    if (existingStatus) {
      const currentStatus = existingStatus.dataset.status
      if (currentStatus === `${status}-${paymentStatus}`) {
        return false // No change
      }
      hasChanged = true
    }

    if (existingStatus) {
      existingStatus.remove()
    }

    const statusIndicator = DOMUtils.createElement("div", {
      className: "payment-status-indicator fade-in",
      "data-status": `${status}-${paymentStatus}`,
    })

    let statusContent = ""
    if (status === "approved" || paymentStatus === "approved") {
      statusContent = `
        <div class="status-badge approved">
          <i class="fas fa-check-circle"></i>
          <span>INAPRUBAHAN / APPROVED</span>
        </div>
        <p class="status-message">
          Ang inyong kahilingan ay naaprubahan na. Maaari na kayong magbayad.
          <br><em>Your request has been approved. You may now proceed to payment.</em>
        </p>
      `
    } else if (status === "rejected" || paymentStatus === "rejected") {
      statusContent = `
        <div class="status-badge rejected">
          <i class="fas fa-times-circle"></i>
          <span>ITINANGGI / REJECTED</span>
        </div>
        <p class="status-message">
          Ikinalulungkot namin na ang inyong kahilingan ay itinanggi.
          <br><em>We regret to inform you that your request has been rejected.</em>
        </p>
      `
    } else if (status === "paid" || paymentStatus === "completed") {
      statusContent = `
        <div class="status-badge paid">
          <i class="fas fa-credit-card"></i>
          <span>NABAYAD / PAID</span>
        </div>
        <p class="status-message">
          Salamat sa inyong bayad. Ang inyong sertipiko ay ihahanda na.
          <br><em>Thank you for your payment. Your certificate will be prepared.</em>
        </p>
      `
    }

    if (statusContent) {
      statusIndicator.innerHTML = statusContent
      const progressSteps = summaryContainer.querySelector(".progress-steps")
      if (progressSteps) {
        progressSteps.insertAdjacentElement("afterend", statusIndicator)
      }
    }

    return hasChanged
  }

  // Global functions for table actions (optimized with debouncing)
  window.editRequest = (requestId) => {
    sessionStorage.setItem("editingRequestId", requestId)
    window.location.href = "request-certificate-form-user.html"
  }

  window.deleteRequest = (requestId) => {
    if (confirm("Sigurado ka bang gusto mong burahin ang kahilingang ito?")) {
      SummaryState.allRequests = SummaryState.allRequests.filter((req) => req.id !== requestId)
      localStorage.setItem("allCertificateRequests", JSON.stringify(SummaryState.allRequests))

      if (SummaryState.allRequests.length === 0) {
        window.location.href = "dashboard-user.html"
      } else {
        // Smooth transition to updated state
        SummaryState.setRequests(SummaryState.allRequests)
        determineDisplayMode()
      }
    }
  }

  window.viewRequest = (requestId) => {
    window.location.href = `summary-request-certificate-user.html?requestId=${requestId}`
  }

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    ElementCache.clear()
    MemoCache.cache.clear()
  })
})
