<?php
require_once 'dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $method = $_POST['method']; // 'email' or 'mobile'
        $contact = trim($_POST['contact']);
        $purpose = $_POST['purpose']; // 'account_creation' or 'password_reset'

        // Validate input
        if (empty($method) || empty($contact) || empty($purpose)) {
            echo json_encode(['success' => false, 'message' => 'Missing required information']);
            exit;
        }

        // Store verification request in database for tracking purposes
        try {
            $storeSql = "INSERT INTO OTPTable (contact, method, otp, purpose, expiry, created_at) VALUES (?, ?, ?, ?, ?, GETDATE())";
            $storeStmt = $conn->prepare($storeSql);
            $storeStmt->execute([$contact, $method, 'FIREBASE_VERIFY', $purpose, date('Y-m-d H:i:s', strtotime('+10 minutes'))]);
        } catch (PDOException $e) {
            // If table doesn't exist, create it first
            if (strpos($e->getMessage(), 'Invalid object name') !== false || strpos($e->getMessage(), "doesn't exist") !== false) {
                $createTableSql = "
                CREATE TABLE OTPTable (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    contact NVARCHAR(100) NOT NULL,
                    method NVARCHAR(10) NOT NULL,
                    otp NVARCHAR(20) NOT NULL,
                    purpose NVARCHAR(20) NOT NULL,
                    expiry DATETIME NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    used BIT DEFAULT 0
                )";
                $conn->exec($createTableSql);
                
                // Try inserting again
                $storeStmt = $conn->prepare($storeSql);
                $storeStmt->execute([$contact, $method, 'FIREBASE_VERIFY', $purpose, date('Y-m-d H:i:s', strtotime('+10 minutes'))]);
            } else {
                throw $e;
            }
        }

        // For Firebase, we return success immediately since OTP sending is handled client-side
        // The client will use Firebase Auth to send the OTP directly
        if ($method === 'email') {
            // For email, generate and send OTP via SendGrid
            $otp = generateOTP();
            $success = sendEmailOTP($contact, $otp, $purpose);
            
            // Update the stored OTP with the actual generated OTP
            if ($success) {
                $updateSql = "UPDATE OTPTable SET otp = ? WHERE contact = ? AND method = ? AND otp = 'FIREBASE_VERIFY' AND used = 0";
                $updateStmt = $conn->prepare($updateSql);
                $updateStmt->execute([$otp, $contact, $method]);
            }
        } else {
            // For mobile, Firebase handles this client-side
            $success = true; // Firebase will handle SMS OTP on client-side
        }

        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => $method === 'mobile' ? 'Ready for Firebase OTP' : 'OTP sent successfully',
                'method' => $method,
                'contact' => $contact,
                'expires_in' => 300, // 5 minutes in seconds
                'firebase_ready' => $method === 'mobile' // Indicates client should use Firebase
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to send OTP']);
        }

    } catch (PDOException $e) {
        error_log("Database error in sendOTP.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error occurred: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("General error in sendOTP.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

function generateOTP() {
    return sprintf('%06d', mt_rand(0, 999999));
}

function sendEmailOTP($email, $otp, $purpose) {
    $apiKey = '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';
    $emailObj = new \SendGrid\Mail\Mail();

    $emailObj->setFrom("aparish0019@gmail.com", "Divina Pastora");
    $emailObj->setSubject($purpose === 'account_creation' ? 'Account Verification Code' : 'Password Reset Code');
    $emailObj->addTo($email);

    // Use your SendGrid dynamic template ID
    $emailObj->setTemplateId("d-731b20cc61fb4326878f46cbd53bb926");

    // Pass dynamic data to template
    $emailObj->addDynamicTemplateDatas([
        "otp" => $otp,
        "purpose" => $purpose === 'account_creation' ? 'Thank you for creating an account with us.' : 'You requested to reset your password.'
    ]);

    $sendgrid = new \SendGrid($apiKey);

    try {
        $response = $sendgrid->send($emailObj);
        return $response->statusCode();
    } catch (Exception $e) {
        return 'Caught exception: '. $e->getMessage();
    }
}

?>
