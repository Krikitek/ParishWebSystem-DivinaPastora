<?php
session_start();
require_once 'dbConnection.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit;
}

$userID = $_SESSION['user_id'];

// Set maximum file size (10MB)
$maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

// Function to validate file size
function validateFileSize($file) {
    global $maxFileSize;
    if ($file['size'] > $maxFileSize) {
        return false;
    }
    return true;
}

// Function to upload file to Azure Blob Storage
function uploadToAzureStorage($file, $containerName, $blobName) {
    global $blobClient;
    
    try {
        // Validate file size
        if (!validateFileSize($file)) {
            throw new Exception("File size exceeds 10MB limit");
        }
        
        // Get file content
        $fileContent = file_get_contents($file['tmp_name']);
        
        // Upload to Azure Blob Storage
        $blobClient->createBlockBlob($containerName, $blobName, $fileContent);
        
        // Return the blob URL
        return "https://parishstorage.blob.core.windows.net/$containerName/$blobName";
        
    } catch (Exception $e) {
        throw new Exception("File upload failed: " . $e->getMessage());
    }
}

// Function to save document info to database
function saveDocumentInfo($userID, $title, $documentType, $fileURL, $appointmentID = null) {
    global $conn;
    
    try {
        $metadata = json_encode(['appointmentID' => $appointmentID]);
        
        $stmt = $conn->prepare("
            INSERT INTO UploadDocumentsTable 
            (title, documentType, userID, fileURL, metadata, dateUploaded, lastModified) 
            VALUES (?, ?, ?, ?, ?, GETDATE(), GETDATE())
        ");
        
        $stmt->execute([$title, $documentType, $userID, $fileURL, $metadata]);
        
        return $conn->lastInsertId();
        
    } catch (PDOException $e) {
        throw new Exception("Database error: " . $e->getMessage());
    }
}

try {
    // Start transaction
    $conn->beginTransaction();
    
    // Validate required fields
    $requiredFields = [
        'preferredCommunionDate',
        'preferredCommunionTime',
        'communionChildLastName',
        'communionChildFirstName',
        'communionChildGender',
        'communionChildBirthProvince',
        'communionChildBirthCity',
        'communionChildBirthDate',
        'communionBaptizedAt'
    ];
    
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
            throw new Exception("Required field missing: $field");
        }
    }
    
    // Validate required files
    $requiredFiles = [
        'communionBaptismalCert'
    ];
    
    foreach ($requiredFiles as $fileField) {
        if (!isset($_FILES[$fileField]) || $_FILES[$fileField]['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Required file missing: $fileField");
        }
        
        // Validate file size
        if (!validateFileSize($_FILES[$fileField])) {
            throw new Exception("File $fileField exceeds 10MB limit");
        }
    }
    
    // Calculate age from birth date
    $birthDate = new DateTime($_POST['communionChildBirthDate']);
    $today = new DateTime();
    $age = $today->diff($birthDate)->y;
    
    // Validate minimum age for first communion (7 years)
    if ($age < 7) {
        throw new Exception("Child must be at least 7 years old for First Communion");
    }
    
    // Insert into ServiceAppointmentsTable
    $stmt = $conn->prepare("
        INSERT INTO ServiceAppointmentsTable 
        (userID, serviceType, preferredDate, preferredTime, status, createdAt, updatedAt) 
        VALUES (?, 'COMMUNION', ?, ?, 'pending', GETDATE(), GETDATE())
    ");
    
    $stmt->execute([
        $userID,
        $_POST['preferredCommunionDate'],
        $_POST['preferredCommunionTime']
    ]);
    
    // Get the appointment ID
    $appointmentID = $conn->lastInsertId();
    
    // Insert into FirstCommunionServiceTable
    $stmt = $conn->prepare("
        INSERT INTO FirstCommunionServiceTable 
        (lastName, firstName, middleName, gender, province, city, dateOfBirth, baptizedAt, age,
         fatherLname, fatherFname, fatherMname, motherLname, motherFname, motherMname) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        strtoupper(trim($_POST['communionChildLastName'])),
        strtoupper(trim($_POST['communionChildFirstName'])),
        isset($_POST['communionChildMiddleName']) ? strtoupper(trim($_POST['communionChildMiddleName'])) : null,
        $_POST['communionChildGender'],
        $_POST['communionChildBirthProvince'],
        $_POST['communionChildBirthCity'],
        $_POST['communionChildBirthDate'],
        strtoupper(trim($_POST['communionBaptizedAt'])),
        $age,
        isset($_POST['communionFatherLastName']) ? strtoupper(trim($_POST['communionFatherLastName'])) : null,
        isset($_POST['communionFatherFirstName']) ? strtoupper(trim($_POST['communionFatherFirstName'])) : null,
        isset($_POST['communionFatherMiddleName']) ? strtoupper(trim($_POST['communionFatherMiddleName'])) : null,
        isset($_POST['communionMotherLastName']) ? strtoupper(trim($_POST['communionMotherLastName'])) : null,
        isset($_POST['communionMotherFirstName']) ? strtoupper(trim($_POST['communionMotherFirstName'])) : null,
        isset($_POST['communionMotherMiddleName']) ? strtoupper(trim($_POST['communionMotherMiddleName'])) : null
    ]);
    
    // Handle file uploads
    $containerName = 'communion-documents';
    $uploadedFiles = [];
    
    // Upload Baptismal Certificate (required)
    if (isset($_FILES['communionBaptismalCert']) && $_FILES['communionBaptismalCert']['error'] === UPLOAD_ERR_OK) {
        $fileName = 'baptismal_cert_' . $appointmentID . '_' . time() . '.' . pathinfo($_FILES['communionBaptismalCert']['name'], PATHINFO_EXTENSION);
        $fileURL = uploadToAzureStorage($_FILES['communionBaptismalCert'], $containerName, $fileName);
        
        saveDocumentInfo(
            $userID,
            'Baptismal Certificate - First Communion',
            'baptismal_certificate',
            $fileURL,
            $appointmentID
        );
        
        $uploadedFiles[] = [
            'type' => 'baptismal_certificate',
            'url' => $fileURL
        ];
    }
    
    // Upload Parish Permit (optional)
    if (isset($_FILES['communionParishPermit']) && $_FILES['communionParishPermit']['error'] === UPLOAD_ERR_OK) {
        if (!validateFileSize($_FILES['communionParishPermit'])) {
            throw new Exception("Parish Permit exceeds 10MB limit");
        }
        
        $fileName = 'parish_permit_' . $appointmentID . '_' . time() . '.' . pathinfo($_FILES['communionParishPermit']['name'], PATHINFO_EXTENSION);
        $fileURL = uploadToAzureStorage($_FILES['communionParishPermit'], $containerName, $fileName);
        
        saveDocumentInfo(
            $userID,
            'Parish Permit - First Communion',
            'parish_permit',
            $fileURL,
            $appointmentID
        );
        
        $uploadedFiles[] = [
            'type' => 'parish_permit',
            'url' => $fileURL
        ];
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'First Communion service appointment created successfully',
        'appointmentID' => $appointmentID,
        'uploadedFiles' => $uploadedFiles
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
