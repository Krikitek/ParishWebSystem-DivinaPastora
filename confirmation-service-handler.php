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
        'preferredConfirmationDate',
        'preferredConfirmationTime',
        'confirmandLastName',
        'confirmandFirstName',
        'confirmandGender',
        'confirmandBirthProvince',
        'confirmandBirthCity',
        'confirmandBirthDate',
        'baptizedAt'
    ];
    
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
            throw new Exception("Required field missing: $field");
        }
    }
    
    // Validate required files
    $requiredFiles = [
        'confirmandBaptismalCert',
        'confirmandCommunionCert'
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
    $birthDate = new DateTime($_POST['confirmandBirthDate']);
    $today = new DateTime();
    $age = $today->diff($birthDate)->y;
    
    // Validate minimum age for confirmation (10 years)
    if ($age < 10) {
        throw new Exception("Confirmand must be at least 10 years old");
    }
    
    // Insert into ServiceAppointmentsTable
    $stmt = $conn->prepare("
        INSERT INTO ServiceAppointmentsTable 
        (userID, serviceType, preferredDate, preferredTime, status, createdAt, updatedAt) 
        VALUES (?, 'CONFIRMATION', ?, ?, 'pending', GETDATE(), GETDATE())
    ");
    
    $stmt->execute([
        $userID,
        $_POST['preferredConfirmationDate'],
        $_POST['preferredConfirmationTime']
    ]);
    
    // Get the appointment ID
    $appointmentID = $conn->lastInsertId();
    
    // Prepare sponsor data
    $sponsor1Lname = isset($_POST['sponsorLastName1']) ? $_POST['sponsorLastName1'] : null;
    $sponsor1Fname = isset($_POST['sponsorFirstName1']) ? $_POST['sponsorFirstName1'] : null;
    $sponsor1Mname = isset($_POST['sponsorMiddleName1']) ? $_POST['sponsorMiddleName1'] : null;
    
    $sponsor2Lname = isset($_POST['sponsorLastName2']) ? $_POST['sponsorLastName2'] : null;
    $sponsor2Fname = isset($_POST['sponsorFirstName2']) ? $_POST['sponsorFirstName2'] : null;
    $sponsor2Mname = isset($_POST['sponsorMiddleName2']) ? $_POST['sponsorMiddleName2'] : null;
    
    // Insert into ConfirmationServiceTable
    $stmt = $conn->prepare("
        INSERT INTO ConfirmationServiceTable 
        (appointmentID, lastName, firstName, midName, gender, province, city, dateOfBirth, age, baptizedAt,
         fatherFname, fatherLname, fatherMname, motherFname, motherLname, motherMname,
         sponsor1Lname, sponsor1Fname, sponsor1Mname, sponsor2Lname, sponsor2Fname, sponsor2Mname) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $appointmentID,
        strtoupper(trim($_POST['confirmandLastName'])),
        strtoupper(trim($_POST['confirmandFirstName'])),
        isset($_POST['confirmandMiddleName']) ? strtoupper(trim($_POST['confirmandMiddleName'])) : null,
        $_POST['confirmandGender'],
        $_POST['confirmandBirthProvince'],
        $_POST['confirmandBirthCity'],
        $_POST['confirmandBirthDate'],
        $age,
        strtoupper(trim($_POST['baptizedAt'])),
        isset($_POST['confirmandFatherFirstName']) ? strtoupper(trim($_POST['confirmandFatherFirstName'])) : null,
        isset($_POST['confirmandFatherLastName']) ? strtoupper(trim($_POST['confirmandFatherLastName'])) : null,
        isset($_POST['confirmandFatherMiddleName']) ? strtoupper(trim($_POST['confirmandFatherMiddleName'])) : null,
        isset($_POST['confirmandMotherFirstName']) ? strtoupper(trim($_POST['confirmandMotherFirstName'])) : null,
        isset($_POST['confirmandMotherLastName']) ? strtoupper(trim($_POST['confirmandMotherLastName'])) : null,
        isset($_POST['confirmandMotherMiddleName']) ? strtoupper(trim($_POST['confirmandMotherMiddleName'])) : null,
        $sponsor1Lname ? strtoupper(trim($sponsor1Lname)) : null,
        $sponsor1Fname ? strtoupper(trim($sponsor1Fname)) : null,
        $sponsor1Mname ? strtoupper(trim($sponsor1Mname)) : null,
        $sponsor2Lname ? strtoupper(trim($sponsor2Lname)) : null,
        $sponsor2Fname ? strtoupper(trim($sponsor2Fname)) : null,
        $sponsor2Mname ? strtoupper(trim($sponsor2Mname)) : null
    ]);
    
    // Handle file uploads
    $containerName = 'confirmation-documents';
    $uploadedFiles = [];
    
    // Upload Baptismal Certificate
    if (isset($_FILES['confirmandBaptismalCert']) && $_FILES['confirmandBaptismalCert']['error'] === UPLOAD_ERR_OK) {
        $fileName = 'baptismal_cert_' . $appointmentID . '_' . time() . '.' . pathinfo($_FILES['confirmandBaptismalCert']['name'], PATHINFO_EXTENSION);
        $fileURL = uploadToAzureStorage($_FILES['confirmandBaptismalCert'], $containerName, $fileName);
        
        saveDocumentInfo(
            $userID,
            'Baptismal Certificate - Confirmation',
            'baptismal_certificate',
            $fileURL,
            $appointmentID
        );
        
        $uploadedFiles[] = [
            'type' => 'baptismal_certificate',
            'url' => $fileURL
        ];
    }
    
    // Upload First Communion Certificate
    if (isset($_FILES['confirmandCommunionCert']) && $_FILES['confirmandCommunionCert']['error'] === UPLOAD_ERR_OK) {
        $fileName = 'communion_cert_' . $appointmentID . '_' . time() . '.' . pathinfo($_FILES['confirmandCommunionCert']['name'], PATHINFO_EXTENSION);
        $fileURL = uploadToAzureStorage($_FILES['confirmandCommunionCert'], $containerName, $fileName);
        
        saveDocumentInfo(
            $userID,
            'First Communion Certificate - Confirmation',
            'communion_certificate',
            $fileURL,
            $appointmentID
        );
        
        $uploadedFiles[] = [
            'type' => 'communion_certificate',
            'url' => $fileURL
        ];
    }
    
    // Upload Father's Pre-Pentecost Seminar Card (optional)
    if (isset($_FILES['confirmandFatherPrePentecostCard']) && $_FILES['confirmandFatherPrePentecostCard']['error'] === UPLOAD_ERR_OK) {
        if (!validateFileSize($_FILES['confirmandFatherPrePentecostCard'])) {
            throw new Exception("Father's Pre-Pentecost Seminar Card exceeds 10MB limit");
        }
        
        $fileName = 'father_prepentecost_' . $appointmentID . '_' . time() . '.' . pathinfo($_FILES['confirmandFatherPrePentecostCard']['name'], PATHINFO_EXTENSION);
        $fileURL = uploadToAzureStorage($_FILES['confirmandFatherPrePentecostCard'], $containerName, $fileName);
        
        saveDocumentInfo(
            $userID,
            'Father Pre-Pentecost Seminar Card - Confirmation',
            'father_prepentecost_card',
            $fileURL,
            $appointmentID
        );
        
        $uploadedFiles[] = [
            'type' => 'father_prepentecost_card',
            'url' => $fileURL
        ];
    }
    
    // Upload Mother's Pre-Pentecost Seminar Card (optional)
    if (isset($_FILES['confirmandMotherPrePentecostCard']) && $_FILES['confirmandMotherPrePentecostCard']['error'] === UPLOAD_ERR_OK) {
        if (!validateFileSize($_FILES['confirmandMotherPrePentecostCard'])) {
            throw new Exception("Mother's Pre-Pentecost Seminar Card exceeds 10MB limit");
        }
        
        $fileName = 'mother_prepentecost_' . $appointmentID . '_' . time() . '.' . pathinfo($_FILES['confirmandMotherPrePentecostCard']['name'], PATHINFO_EXTENSION);
        $fileURL = uploadToAzureStorage($_FILES['confirmandMotherPrePentecostCard'], $containerName, $fileName);
        
        saveDocumentInfo(
            $userID,
            'Mother Pre-Pentecost Seminar Card - Confirmation',
            'mother_prepentecost_card',
            $fileURL,
            $appointmentID
        );
        
        $uploadedFiles[] = [
            'type' => 'mother_prepentecost_card',
            'url' => $fileURL
        ];
    }
    
    // Upload Parish Permit (optional)
    if (isset($_FILES['confirmationParishPermit']) && $_FILES['confirmationParishPermit']['error'] === UPLOAD_ERR_OK) {
        if (!validateFileSize($_FILES['confirmationParishPermit'])) {
            throw new Exception("Parish Permit exceeds 10MB limit");
        }
        
        $fileName = 'parish_permit_' . $appointmentID . '_' . time() . '.' . pathinfo($_FILES['confirmationParishPermit']['name'], PATHINFO_EXTENSION);
        $fileURL = uploadToAzureStorage($_FILES['confirmationParishPermit'], $containerName, $fileName);
        
        saveDocumentInfo(
            $userID,
            'Parish Permit - Confirmation',
            'parish_permit',
            $fileURL,
            $appointmentID
        );
        
        $uploadedFiles[] = [
            'type' => 'parish_permit',
            'url' => $fileURL
        ];
    }
    
    // Handle sponsor documents (if sponsors exist)
    for ($i = 1; $i <= 2; $i++) {
        // Sponsor Marriage Contract
        $marriageContractField = "sponsorMarriageContract$i";
        if (isset($_FILES[$marriageContractField]) && $_FILES[$marriageContractField]['error'] === UPLOAD_ERR_OK) {
            if (!validateFileSize($_FILES[$marriageContractField])) {
                throw new Exception("Sponsor $i Marriage Contract exceeds 10MB limit");
            }
            
            $fileName = "sponsor{$i}_marriage_contract_" . $appointmentID . '_' . time() . '.' . pathinfo($_FILES[$marriageContractField]['name'], PATHINFO_EXTENSION);
            $fileURL = uploadToAzureStorage($_FILES[$marriageContractField], $containerName, $fileName);
            
            saveDocumentInfo(
                $userID,
                "Sponsor $i Marriage Contract - Confirmation",
                'sponsor_marriage_contract',
                $fileURL,
                $appointmentID
            );
            
            $uploadedFiles[] = [
                'type' => "sponsor{$i}_marriage_contract",
                'url' => $fileURL
            ];
        }
        
        // Sponsor Confirmation Certificate
        $confirmationCertField = "sponsorConfirmationCert$i";
        if (isset($_FILES[$confirmationCertField]) && $_FILES[$confirmationCertField]['error'] === UPLOAD_ERR_OK) {
            if (!validateFileSize($_FILES[$confirmationCertField])) {
                throw new Exception("Sponsor $i Confirmation Certificate exceeds 10MB limit");
            }
            
            $fileName = "sponsor{$i}_confirmation_cert_" . $appointmentID . '_' . time() . '.' . pathinfo($_FILES[$confirmationCertField]['name'], PATHINFO_EXTENSION);
            $fileURL = uploadToAzureStorage($_FILES[$confirmationCertField], $containerName, $fileName);
            
            saveDocumentInfo(
                $userID,
                "Sponsor $i Confirmation Certificate - Confirmation",
                'sponsor_confirmation_certificate',
                $fileURL,
                $appointmentID
            );
            
            $uploadedFiles[] = [
                'type' => "sponsor{$i}_confirmation_certificate",
                'url' => $fileURL
            ];
        }
        
        // Sponsor Pre-Pentecost Seminar Card
        $prePentecostCardField = "sponsorPrePentecostCard$i";
        if (isset($_FILES[$prePentecostCardField]) && $_FILES[$prePentecostCardField]['error'] === UPLOAD_ERR_OK) {
            if (!validateFileSize($_FILES[$prePentecostCardField])) {
                throw new Exception("Sponsor $i Pre-Pentecost Seminar Card exceeds 10MB limit");
            }
            
            $fileName = "sponsor{$i}_prepentecost_card_" . $appointmentID . '_' . time() . '.' . pathinfo($_FILES[$prePentecostCardField]['name'], PATHINFO_EXTENSION);
            $fileURL = uploadToAzureStorage($_FILES[$prePentecostCardField], $containerName, $fileName);
            
            saveDocumentInfo(
                $userID,
                "Sponsor $i Pre-Pentecost Seminar Card - Confirmation",
                'sponsor_prepentecost_card',
                $fileURL,
                $appointmentID
            );
            
            $uploadedFiles[] = [
                'type' => "sponsor{$i}_prepentecost_card",
                'url' => $fileURL
            ];
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Confirmation service appointment created successfully',
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
