/**
 * Enhanced Chronos Dashboard Script
 * Features: Authentication, Certificate Management, Language Switching, Chatbot, Enhanced UI
 */

document.addEventListener("DOMContentLoaded", () => {
  // ===========================================
  // LANGUAGE FUNCTIONALITY
  // ===========================================
  let currentLanguage = localStorage.getItem("chronos_language") || "fil"

  // Initialize language on page load
  setLanguage(currentLanguage)

  // Language toggle functionality
  const langToggle = document.getElementById("lang-toggle")
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      currentLanguage = currentLanguage === "en" ? "fil" : "en"
      setLanguage(currentLanguage)
      localStorage.setItem("chronos_language", currentLanguage)
    })
  }

  /**
   * Set the current language for the interface
   * @param {string} lang - Language code ('en' or 'fil')
   */
  function setLanguage(lang) {
    const langToggle = document.getElementById("lang-toggle")
    if (langToggle) {
      const flagIcon = langToggle.querySelector(".flag-icon")
      const langText = langToggle.querySelector(".lang-text")

      // Update flag and text
      if (lang === "fil") {
        if (flagIcon) flagIcon.textContent = "🇵🇭"
        if (langText) langText.textContent = "FIL"
      } else {
        if (flagIcon) flagIcon.textContent = "🇬🇧"
        if (langText) langText.textContent = "EN"
      }
    }

    // Update all elements with language attributes
    const elements = document.querySelectorAll("[data-en][data-fil]")
    elements.forEach((element) => {
      const text = element.getAttribute(`data-${lang}`)
      if (text) {
        // Handle different element types
        if (element.tagName === "INPUT" && element.type === "button") {
          element.value = text
        } else if (element.tagName === "BUTTON") {
          element.textContent = text
        } else if (element.tagName === "A") {
          element.textContent = text
        } else {
          element.textContent = text
        }
      }
    })

    // Update placeholders
    const placeholderElements = document.querySelectorAll("[data-placeholder-en][data-placeholder-fil]")
    placeholderElements.forEach((element) => {
      const placeholder = element.getAttribute(`data-placeholder-${lang}`)
      if (placeholder) {
        element.placeholder = placeholder
      }
    })

    // Update tooltips
    updateTooltips(lang)

    // Update chatbot initial message
    const initialBotMessage = document.querySelector(".message.bot")
    if (initialBotMessage) {
      const botText = initialBotMessage.getAttribute(`data-${lang}`)
      if (botText) {
        initialBotMessage.textContent = botText
      }
    }
  }

  /**
   * Update tooltip text based on current language
   * @param {string} lang - Language code
   */
  function updateTooltips(lang) {
    const tooltipElements = document.querySelectorAll("[data-tooltip-en][data-tooltip-fil]")
    tooltipElements.forEach((element) => {
      const tooltipText = element.getAttribute(`data-tooltip-${lang}`)
      if (tooltipText) {
        element.setAttribute("data-tooltip", tooltipText)
      }
    })
  }

  // ===========================================
  // ENHANCED TOOLTIP FUNCTIONALITY
  // ===========================================
  const tooltip = document.getElementById("tooltip")
  const tooltipElements = document.querySelectorAll("[data-tooltip-en][data-tooltip-fil]")

  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", function (e) {
      const tooltipText = this.getAttribute(`data-tooltip-${currentLanguage}`)
      if (tooltipText && tooltip) {
        tooltip.textContent = tooltipText
        tooltip.classList.add("show")

        // Position tooltip
        const rect = this.getBoundingClientRect()
        const tooltipRect = tooltip.getBoundingClientRect()

        let left = rect.left + rect.width / 2 - tooltipRect.width / 2
        let top = rect.top - tooltipRect.height - 10

        // Ensure tooltip stays within viewport
        if (left < 10) left = 10
        if (left + tooltipRect.width > window.innerWidth - 10) {
          left = window.innerWidth - tooltipRect.width - 10
        }
        if (top < 10) {
          top = rect.bottom + 10
        }

        tooltip.style.left = left + "px"
        tooltip.style.top = top + "px"
      }
    })

    element.addEventListener("mouseleave", () => {
      if (tooltip) {
        tooltip.classList.remove("show")
      }
    })
  })

  // ===========================================
  // AUTHENTICATION FUNCTIONALITY
  // ===========================================

  // Check if user is logged in
  checkLoginStatus()

  // Display user info
  displayUserInfo()

  /**
   * Check if user has active session
   */
  function checkLoginStatus() {
    const session = sessionStorage.getItem("chronos_session")

    if (session !== "active") {
      // If no session is found, redirect to login page
      window.location.href = "index.html"
    }
  }

  /**
   * Display logged in user information
   */
  function displayUserInfo() {
    const userData = JSON.parse(localStorage.getItem("chronos_current_user") || "{}")

    if (userData && userData.name) {
      console.log(`Logged in as: ${userData.name} (${userData.email})`)
    }
  }

  // ===========================================
  // LOGOUT FUNCTIONALITY
  // ===========================================
  const logoutBtn = document.getElementById("logout-btn")
  const logoutModal = document.getElementById("logout-modal")
  const cancelLogout = document.getElementById("cancel-logout")
  const confirmLogout = document.getElementById("confirm-logout")

  if (logoutBtn && logoutModal) {
    logoutBtn.addEventListener("click", () => {
      logoutModal.style.display = "flex"
    })
  }

  if (cancelLogout && logoutModal) {
    cancelLogout.addEventListener("click", () => {
      logoutModal.style.display = "none"
    })
  }

  if (confirmLogout) {
    confirmLogout.addEventListener("click", () => {
      // Clear session data
      sessionStorage.removeItem("chronos_session")
      localStorage.removeItem("chronos_current_user")

      // Redirect to login page
      window.location.href = "index.html"
    })
  }

  // Close modal if clicked outside
  window.addEventListener("click", (event) => {
    if (logoutModal && event.target === logoutModal) {
      logoutModal.style.display = "none"
    }
  })

  // ===========================================
  // ENHANCED NOTIFICATION SYSTEM
  // ===========================================

  /**
   * Show enhanced notification with styling
   * @param {string} message - Notification message
   * @param {string} type - Notification type ('info', 'success', 'warning', 'error')
   */
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

  // ===========================================
  // CHATBOT FUNCTIONALITY
  // ===========================================
  const chatbotToggle = document.getElementById("chatbot-toggle")
  const chatbotWindow = document.getElementById("chatbot-window")
  const closeChat = document.getElementById("close-chatbot")
  const chatMessages = document.getElementById("chatbot-messages")
  const userMessageInput = document.getElementById("user-message")
  const sendMessageBtn = document.getElementById("send-message")

  // Toggle chatbot window
  if (chatbotToggle && chatbotWindow) {
    chatbotToggle.addEventListener("click", () => {
      if (chatbotWindow.style.display === "flex") {
        chatbotWindow.style.display = "none"
      } else {
        chatbotWindow.style.display = "flex"
      }
    })
  }

  // Close chatbot window
  if (closeChat && chatbotWindow) {
    closeChat.addEventListener("click", () => {
      chatbotWindow.style.display = "none"
    })
  }

  /**
   * Send message in chatbot with language support
   */
  function sendMessage() {
    if (!userMessageInput || !chatMessages) return

    const message = userMessageInput.value.trim()

    if (message) {
      // Add user message
      const userMessageElement = document.createElement("div")
      userMessageElement.classList.add("message", "user")
      userMessageElement.textContent = message
      chatMessages.appendChild(userMessageElement)

      // Clear input
      userMessageInput.value = ""

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight

      // Simulate bot response after a short delay with language support
      setTimeout(() => {
        const botResponses =
          currentLanguage === "fil"
            ? [
                "Nandito ako para tumulong sa inyong Chronos account.",
                "Maaari kayong humiling ng mga sertipiko sa pamamagitan ng pag-click sa uri ng sertipikong kailangan ninyo.",
                "Ang proseso ay simple: aplikasyon, bayad, at paghahatid.",
                "Kailangan ng tulong sa isang tukoy na sertipiko? Sabihin ninyo sa akin kung alin.",
                "Maaari ninyong i-track ang inyong mga kahilingan ng sertipiko sa Files section.",
                "Para sa mass intention, i-click lang ang purple na card at sundin ang mga hakbang.",
                "Ang mga donasyon ay tumutulong sa pagpapanatili ng simbahan at mga programa nito.",
              ]
            : [
                "I'm here to help with your Chronos account.",
                "You can request certificates by clicking on the certificate type you need.",
                "The process is simple: application, payment, and delivery.",
                "Need help with a specific certificate? Let me know which one.",
                "You can track your certificate requests in the Files section.",
                "For mass intentions, just click the purple card and follow the steps.",
                "Donations help maintain the church and its programs.",
              ]

        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

        const botMessageElement = document.createElement("div")
        botMessageElement.classList.add("message", "bot")
        botMessageElement.textContent = randomResponse
        chatMessages.appendChild(botMessageElement)

        // Scroll to bottom again
        chatMessages.scrollTop = chatMessages.scrollHeight
      }, 1000)
    }
  }

  // Send message on button click
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener("click", sendMessage)
  }

  // Send message on Enter key
  if (userMessageInput) {
    userMessageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage()
      }
    })
  }

  // ===========================================
  // CERTIFICATE REQUEST TERMS MODAL
  // ===========================================
  const requestCard = document.querySelector(".request-certificate-card")
  const certificateTermsModal = document.getElementById("certificate-terms-modal")
  const cancelCertificateTermsBtn = document.getElementById("cancel-certificate-terms")
  const proceedCertificateTermsBtn = document.getElementById("proceed-certificate-terms")
  const certificateTermsCheckbox = document.getElementById("certificate-terms-checkbox")
  const certificatePrivacyCheckbox = document.getElementById("certificate-privacy-checkbox")

  // Add click handler for the Certificate Request card
  if (requestCard && certificateTermsModal) {
    requestCard.addEventListener("click", () => {
      certificateTermsModal.style.display = "flex"
      document.body.style.overflow = "hidden"
    })
  }

  // Close certificate terms modal
  if (cancelCertificateTermsBtn) {
    cancelCertificateTermsBtn.addEventListener("click", () => {
      closeCertificateTermsModal()
    })
  }

  if (certificateTermsModal) {
    certificateTermsModal.addEventListener("click", (event) => {
      if (event.target === certificateTermsModal) {
        closeCertificateTermsModal()
      }
    })
  }

  function closeCertificateTermsModal() {
    if (certificateTermsModal) {
      certificateTermsModal.style.display = "none"
      document.body.style.overflow = "auto"
      if (certificateTermsCheckbox) certificateTermsCheckbox.checked = false
      if (certificatePrivacyCheckbox) certificatePrivacyCheckbox.checked = false
      updateCertificateProceedButton()
    }
  }

  function updateCertificateProceedButton() {
    if (proceedCertificateTermsBtn) {
      if (
        certificateTermsCheckbox &&
        certificatePrivacyCheckbox &&
        certificateTermsCheckbox.checked &&
        certificatePrivacyCheckbox.checked
      ) {
        proceedCertificateTermsBtn.disabled = false
      } else {
        proceedCertificateTermsBtn.disabled = true
      }
    }
  }

  if (certificateTermsCheckbox) {
    certificateTermsCheckbox.addEventListener("change", updateCertificateProceedButton)
  }

  if (certificatePrivacyCheckbox) {
    certificatePrivacyCheckbox.addEventListener("change", updateCertificateProceedButton)
  }

  if (proceedCertificateTermsBtn) {
    proceedCertificateTermsBtn.addEventListener("click", () => {
      if (
        certificateTermsCheckbox &&
        certificatePrivacyCheckbox &&
        certificateTermsCheckbox.checked &&
        certificatePrivacyCheckbox.checked
      ) {
        closeCertificateTermsModal()
        showNotification("Redirecting to certificate request form...", "info")
        setTimeout(() => {
          window.location.href = "request-certificate-form-user.html"
        }, 1500)
      }
    })
  }

  // ===========================================
  // MASS INTENTION TERMS MODAL
  // ===========================================
  const massIntentionCard = document.querySelector(".mass-intention-card")
  const massIntentionTermsModal = document.getElementById("mass-intention-terms-modal")
  const cancelMassIntentionTermsBtn = document.getElementById("cancel-mass-intention-terms")
  const proceedMassIntentionTermsBtn = document.getElementById("proceed-mass-intention-terms")
  const massIntentionTermsCheckbox = document.getElementById("mass-intention-terms-checkbox")
  const massIntentionPrivacyCheckbox = document.getElementById("mass-intention-privacy-checkbox")

  if (massIntentionCard && massIntentionTermsModal) {
    massIntentionCard.addEventListener("click", () => {
      massIntentionTermsModal.style.display = "flex"
      document.body.style.overflow = "hidden"
    })
  }

  if (cancelMassIntentionTermsBtn) {
    cancelMassIntentionTermsBtn.addEventListener("click", () => {
      closeMassIntentionTermsModal()
    })
  }

  if (massIntentionTermsModal) {
    massIntentionTermsModal.addEventListener("click", (event) => {
      if (event.target === massIntentionTermsModal) {
        closeMassIntentionTermsModal()
      }
    })
  }

  function closeMassIntentionTermsModal() {
    if (massIntentionTermsModal) {
      massIntentionTermsModal.style.display = "none"
      document.body.style.overflow = "auto"
      if (massIntentionTermsCheckbox) massIntentionTermsCheckbox.checked = false
      if (massIntentionPrivacyCheckbox) massIntentionPrivacyCheckbox.checked = false
      updateMassIntentionProceedButton()
    }
  }

  function updateMassIntentionProceedButton() {
    if (proceedMassIntentionTermsBtn) {
      if (
        massIntentionTermsCheckbox &&
        massIntentionPrivacyCheckbox &&
        massIntentionTermsCheckbox.checked &&
        massIntentionPrivacyCheckbox.checked
      ) {
        proceedMassIntentionTermsBtn.disabled = false
      } else {
        proceedMassIntentionTermsBtn.disabled = true
      }
    }
  }

  if (massIntentionTermsCheckbox) {
    massIntentionTermsCheckbox.addEventListener("change", updateMassIntentionProceedButton)
  }

  if (massIntentionPrivacyCheckbox) {
    massIntentionPrivacyCheckbox.addEventListener("change", updateMassIntentionProceedButton)
  }

  if (proceedMassIntentionTermsBtn) {
    proceedMassIntentionTermsBtn.addEventListener("click", () => {
      if (
        massIntentionTermsCheckbox &&
        massIntentionPrivacyCheckbox &&
        massIntentionTermsCheckbox.checked &&
        massIntentionPrivacyCheckbox.checked
      ) {
        closeMassIntentionTermsModal()
        showNotification("Redirecting to Mass Intention form...", "info")
        setTimeout(() => {
          window.location.href = "mass-intention.html"
        }, 1500)
      }
    })
  }

  // ===========================================
  // SCHEDULE SERVICE TERMS MODAL
  // ===========================================
  const scheduleServiceCard = document.querySelector(".schedule-service-card")
  const scheduleServiceTermsModal = document.getElementById("schedule-service-terms-modal")
  const cancelScheduleServiceTermsBtn = document.getElementById("cancel-schedule-service-terms")
  const proceedScheduleServiceTermsBtn = document.getElementById("proceed-schedule-service-terms")
  const scheduleServiceTermsCheckbox = document.getElementById("schedule-service-terms-checkbox")
  const scheduleServicePrivacyCheckbox = document.getElementById("schedule-service-privacy-checkbox")

  if (scheduleServiceCard && scheduleServiceTermsModal) {
    scheduleServiceCard.addEventListener("click", () => {
      scheduleServiceTermsModal.style.display = "flex"
      document.body.style.overflow = "hidden"
    })
  }

  if (cancelScheduleServiceTermsBtn) {
    cancelScheduleServiceTermsBtn.addEventListener("click", () => {
      closeScheduleServiceTermsModal()
    })
  }

  if (scheduleServiceTermsModal) {
    scheduleServiceTermsModal.addEventListener("click", (event) => {
      if (event.target === scheduleServiceTermsModal) {
        closeScheduleServiceTermsModal()
      }
    })
  }

  function closeScheduleServiceTermsModal() {
    if (scheduleServiceTermsModal) {
      scheduleServiceTermsModal.style.display = "none"
      document.body.style.overflow = "auto"
      if (scheduleServiceTermsCheckbox) scheduleServiceTermsCheckbox.checked = false
      if (scheduleServicePrivacyCheckbox) scheduleServicePrivacyCheckbox.checked = false
      updateScheduleServiceProceedButton()
    }
  }

  function updateScheduleServiceProceedButton() {
    if (proceedScheduleServiceTermsBtn) {
      if (
        scheduleServiceTermsCheckbox &&
        scheduleServicePrivacyCheckbox &&
        scheduleServiceTermsCheckbox.checked &&
        scheduleServicePrivacyCheckbox.checked
      ) {
        proceedScheduleServiceTermsBtn.disabled = false
      } else {
        proceedScheduleServiceTermsBtn.disabled = true
      }
    }
  }

  if (scheduleServiceTermsCheckbox) {
    scheduleServiceTermsCheckbox.addEventListener("change", updateScheduleServiceProceedButton)
  }

  if (scheduleServicePrivacyCheckbox) {
    scheduleServicePrivacyCheckbox.addEventListener("change", updateScheduleServiceProceedButton)
  }

  if (proceedScheduleServiceTermsBtn) {
    proceedScheduleServiceTermsBtn.addEventListener("click", () => {
      if (
        scheduleServiceTermsCheckbox &&
        scheduleServicePrivacyCheckbox &&
        scheduleServiceTermsCheckbox.checked &&
        scheduleServicePrivacyCheckbox.checked
      ) {
        closeScheduleServiceTermsModal()
        showNotification("Redirecting to service scheduling...", "info")
        setTimeout(() => {
          window.location.href = "schedule-service-terms-user.html"
        }, 1500)
      }
    })
  }

  // ===========================================
  // DONATION TERMS MODAL
  // ===========================================
  const donateCard = document.querySelector(".donate-card")
  const donationTermsModal = document.getElementById("donation-terms-modal")
  const cancelDonationTermsBtn = document.getElementById("cancel-donation-terms")
  const proceedDonationTermsBtn = document.getElementById("proceed-donation-terms")
  const donationTermsCheckbox = document.getElementById("donation-terms-checkbox")
  const donationPrivacyCheckbox = document.getElementById("donation-privacy-checkbox")

  if (donateCard && donationTermsModal) {
    donateCard.addEventListener("click", () => {
      donationTermsModal.style.display = "flex"
      document.body.style.overflow = "hidden"
    })
  }

  if (cancelDonationTermsBtn) {
    cancelDonationTermsBtn.addEventListener("click", () => {
      closeDonationTermsModal()
    })
  }

  if (donationTermsModal) {
    donationTermsModal.addEventListener("click", (event) => {
      if (event.target === donationTermsModal) {
        closeDonationTermsModal()
      }
    })
  }

  function closeDonationTermsModal() {
    if (donationTermsModal) {
      donationTermsModal.style.display = "none"
      document.body.style.overflow = "auto"
      if (donationTermsCheckbox) donationTermsCheckbox.checked = false
      if (donationPrivacyCheckbox) donationPrivacyCheckbox.checked = false
      updateDonationProceedButton()
    }
  }

  function updateDonationProceedButton() {
    if (proceedDonationTermsBtn) {
      if (
        donationTermsCheckbox &&
        donationPrivacyCheckbox &&
        donationTermsCheckbox.checked &&
        donationPrivacyCheckbox.checked
      ) {
        proceedDonationTermsBtn.disabled = false
      } else {
        proceedDonationTermsBtn.disabled = true
      }
    }
  }

  if (donationTermsCheckbox) {
    donationTermsCheckbox.addEventListener("change", updateDonationProceedButton)
  }

  if (donationPrivacyCheckbox) {
    donationPrivacyCheckbox.addEventListener("change", updateDonationProceedButton)
  }

  if (proceedDonationTermsBtn) {
    proceedDonationTermsBtn.addEventListener("click", () => {
      if (
        donationTermsCheckbox &&
        donationPrivacyCheckbox &&
        donationTermsCheckbox.checked &&
        donationPrivacyCheckbox.checked
      ) {
        closeDonationTermsModal()
        showNotification("Redirecting to donation page...", "info")
        setTimeout(() => {
          window.location.href = "donate-user.html"
        }, 1500)
      }
    })
  }

  // ===========================================
  // ENHANCED UI FEATURES
  // ===========================================

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Enhanced button interactions with ripple effect
  const allButtons = document.querySelectorAll("button, .step-button, .certificate-card")

  allButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Add ripple effect
      const ripple = document.createElement("span")
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `

      // Add ripple animation CSS if not exists
      if (!document.querySelector("#ripple-styles")) {
        const style = document.createElement("style")
        style.id = "ripple-styles"
        style.textContent = `
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `
        document.head.appendChild(style)
      }

      this.style.position = "relative"
      this.style.overflow = "hidden"
      this.appendChild(ripple)

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.remove()
        }
      }, 600)
    })
  })

  // Add fade-in animation to sections
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in")
      }
    })
  }, observerOptions)

  // Observe sections for animation
  document.querySelectorAll(".certificate-section, .welcome-section, .features-section").forEach((section) => {
    observer.observe(section)
  })

  // Enhanced mobile header functionality
  function initializeMobileHeader() {
    const header = document.querySelector(".dashboard-header")
    const userActions = document.querySelector(".user-actions")

    // Add mobile menu toggle functionality if needed
    if (window.innerWidth <= 700) {
      userActions?.classList.add("mobile-layout")
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 700) {
        userActions?.classList.add("mobile-layout")
      } else {
        userActions?.classList.remove("mobile-layout")
      }
    })
  }

  // Add keyboard navigation for certificate cards
  function initializeKeyboardNavigation() {
    const certificateCards = document.querySelectorAll(".certificate-card")

    certificateCards.forEach((card) => {
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          card.click()
        }
      })
    })
  }

  // Enhanced loading states
  function showLoadingState(element) {
    if (element) {
      element.classList.add("loading")
      element.style.pointerEvents = "none"
    }
  }

  function hideLoadingState(element) {
    if (element) {
      element.classList.remove("loading")
      element.style.pointerEvents = "auto"
    }
  }

  // Add these function calls at the end of the DOMContentLoaded event listener
  initializeMobileHeader()
  initializeKeyboardNavigation()

  // Enhanced certificate card interactions with loading states
  const certificateCards = document.querySelectorAll(".certificate-card")
  certificateCards.forEach((card) => {
    card.addEventListener("click", function () {
      showLoadingState(this)
      setTimeout(() => {
        hideLoadingState(this)
      }, 1000)
    })
  })

  // ===========================================
  // INITIALIZATION COMPLETE
  // ===========================================
  console.log("Enhanced Chronos Dashboard initialized successfully with all features")

  // Show welcome notification
  setTimeout(() => {
    const userData = JSON.parse(localStorage.getItem("chronos_current_user") || "{}")
    const userName = userData.name || "User"
    const welcomeMessage = currentLanguage === "fil" ? `Maligayang pagdating, ${userName}!` : `Welcome, ${userName}!`
    showNotification(welcomeMessage, "success")
  }, 1000)
})
