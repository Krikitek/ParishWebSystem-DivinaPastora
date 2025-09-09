// file-upload-validation.js - Comprehensive file upload validation
document.addEventListener("DOMContentLoaded", () => {
  // File validation configuration
  const fileValidationConfig = {
    allowedTypes: {
      documents: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
      images: ["image/jpeg", "image/png", "image/jpg"],
      certificates: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
    },
    maxSizes: {
      documents: 5 * 1024 * 1024, // 5MB
      images: 3 * 1024 * 1024, // 3MB
      certificates: 5 * 1024 * 1024, // 5MB
    },
    minSizes: {
      documents: 10 * 1024, // 10KB
      images: 5 * 1024, // 5KB
      certificates: 10 * 1024, // 10KB
    },
  }

  // File type mappings
  const fileTypeMap = {
    birthCertificate: "certificates",
    baptismCertificate: "certificates",
    deathCertificate: "certificates",
    groomBaptismal: "certificates",
    brideBaptismal: "certificates",
    cenomar: "documents",
    marriageLicense: "documents",
    paymentScreenshot: "images",
  }

  // Validate file upload
  function validateFileUpload(fileInput) {
    const fieldName = fileInput.id
    const fileType = fileTypeMap[fieldName] || "documents"
    const files = fileInput.files

    // Clear previous errors
    clearFileError(fileInput)

    if (files.length === 0) {
      return showFileError(fileInput, "Please select a file to upload")
    }

    const file = files[0]

    // File type validation
    const allowedTypes = fileValidationConfig.allowedTypes[fileType]
    if (!allowedTypes.includes(file.type)) {
      const typeNames = allowedTypes
        .map((type) => {
          switch (type) {
            case "application/pdf":
              return "PDF"
            case "image/jpeg":
            case "image/jpg":
              return "JPG"
            case "image/png":
              return "PNG"
            default:
              return type
          }
        })
        .join(", ")
      return showFileError(fileInput, `Please upload a valid file type: ${typeNames}`)
    }

    // File size validation
    const maxSize = fileValidationConfig.maxSizes[fileType]
    const minSize = fileValidationConfig.minSizes[fileType]

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      return showFileError(fileInput, `File size must be less than ${maxSizeMB}MB`)
    }

    if (file.size < minSize) {
      const minSizeKB = (minSize / 1024).toFixed(0)
      return showFileError(fileInput, `File size must be at least ${minSizeKB}KB`)
    }

    // Image dimension validation for images
    if (fileType === "images") {
      return validateImageDimensions(file, fileInput)
    }

    // PDF page count validation for documents
    if (file.type === "application/pdf") {
      return validatePDFDocument(file, fileInput)
    }

    showFileSuccess(fileInput, file)
    return true
  }

  // Validate image dimensions
  function validateImageDimensions(file, fileInput) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = function () {
        const minWidth = 300
        const minHeight = 300
        const maxWidth = 4000
        const maxHeight = 4000

        if (this.width < minWidth || this.height < minHeight) {
          showFileError(fileInput, `Image must be at least ${minWidth}x${minHeight} pixels`)
          resolve(false)
        } else if (this.width > maxWidth || this.height > maxHeight) {
          showFileError(fileInput, `Image must be no larger than ${maxWidth}x${maxHeight} pixels`)
          resolve(false)
        } else {
          showFileSuccess(fileInput, file)
          resolve(true)
        }
      }

      img.onerror = () => {
        showFileError(fileInput, "Invalid image file")
        resolve(false)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Validate PDF document
  function validatePDFDocument(file, fileInput) {
    // Basic PDF validation (in a real app, you might use PDF.js for more thorough validation)
    const reader = new FileReader()

    return new Promise((resolve) => {
      reader.onload = (e) => {
        const arrayBuffer = e.target.result
        const uint8Array = new Uint8Array(arrayBuffer)

        // Check PDF header
        const pdfHeader = String.fromCharCode.apply(null, uint8Array.slice(0, 4))
        if (pdfHeader !== "%PDF") {
          showFileError(fileInput, "Invalid PDF file")
          resolve(false)
        } else {
          showFileSuccess(fileInput, file)
          resolve(true)
        }
      }

      reader.onerror = () => {
        showFileError(fileInput, "Error reading PDF file")
        resolve(false)
      }

      reader.readAsArrayBuffer(file.slice(0, 1024)) // Read first 1KB for header check
    })
  }

  // Show file error
  function showFileError(fileInput, message) {
    const container = fileInput.closest(".input-field")
    let errorElement = container.querySelector(".file-error")

    if (!errorElement) {
      errorElement = document.createElement("div")
      errorElement.className = "file-error"
      errorElement.style.color = "#ea4335"
      errorElement.style.fontSize = "12px"
      errorElement.style.marginTop = "5px"
      container.appendChild(errorElement)
    }

    errorElement.textContent = message
    errorElement.style.display = "block"
    fileInput.style.borderColor = "#ea4335"

    // Remove file preview if exists
    const preview = container.querySelector(".file-preview")
    if (preview) {
      preview.remove()
    }

    return false
  }

  // Show file success
  function showFileSuccess(fileInput, file) {
    const container = fileInput.closest(".input-field")

    // Clear any errors
    clearFileError(fileInput)

    // Create or update file preview
    let preview = container.querySelector(".file-preview")
    if (!preview) {
      preview = document.createElement("div")
      preview.className = "file-preview"
      preview.style.marginTop = "10px"
      preview.style.padding = "10px"
      preview.style.backgroundColor = "#f8f9fa"
      preview.style.border = "1px solid #dee2e6"
      preview.style.borderRadius = "4px"
      preview.style.fontSize = "12px"
      container.appendChild(preview)
    }

    const fileSize = (file.size / 1024).toFixed(1)
    const fileSizeUnit = fileSize > 1024 ? `${(fileSize / 1024).toFixed(1)} MB` : `${fileSize} KB`

    preview.innerHTML = `
      <div style="display: flex; align-items: center; color: #28a745;">
        <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
        <div>
          <div style="font-weight: bold;">${file.name}</div>
          <div style="color: #6c757d;">${fileSizeUnit} • ${file.type}</div>
        </div>
      </div>
    `

    fileInput.style.borderColor = "#28a745"
  }

  // Clear file error
  function clearFileError(fileInput) {
    const container = fileInput.closest(".input-field")
    const errorElement = container.querySelector(".file-error")

    if (errorElement) {
      errorElement.style.display = "none"
    }

    fileInput.style.borderColor = "#dee2e6"
  }

  // Add file upload validation listeners
  function addFileUploadListeners() {
    const fileInputs = document.querySelectorAll('input[type="file"]')

    fileInputs.forEach((fileInput) => {
      fileInput.addEventListener("change", async () => {
        await validateFileUpload(fileInput)
      })

      // Drag and drop support
      fileInput.addEventListener("dragover", (e) => {
        e.preventDefault()
        fileInput.style.borderColor = "#007bff"
        fileInput.style.backgroundColor = "#f8f9fa"
      })

      fileInput.addEventListener("dragleave", (e) => {
        e.preventDefault()
        fileInput.style.borderColor = "#dee2e6"
        fileInput.style.backgroundColor = "white"
      })

      fileInput.addEventListener("drop", (e) => {
        e.preventDefault()
        fileInput.style.borderColor = "#dee2e6"
        fileInput.style.backgroundColor = "white"

        const files = e.dataTransfer.files
        if (files.length > 0) {
          fileInput.files = files
          validateFileUpload(fileInput)
        }
      })
    })
  }

  // Initialize file upload validation
  addFileUploadListeners()

  // Export validation functions
  window.validateFileUpload = validateFileUpload
  window.FileUploadValidation = {
    validateFileUpload,
    fileValidationConfig,
  }
})
