<?php
require_once 'dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $contact = trim($_POST['contact']);
        $otp = trim($_POST['otp']);
        $method = $_POST['method'] ?? null; // 'email' or 'mobile'

        // Validate input
        if (empty($contact) || empty($otp)) {
            echo json_encode(['success' => false, 'message' => 'Missing required information']);
            exit;
        }

        // If method is not provided, determine it from contact format
        if (empty($method)) {
            $method = (strpos($contact, '@') !== false) ? 'email' : 'mobile';
        }

        $result = verifyOTP($contact, $otp, $method);
        echo json_encode($result);

    } catch (Exception $e) {
        error_log("Error in verifyOTP.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

function verifyOTP($contact, $otp, $method) {
    global $conn;
    
    try {
        if ($method === 'mobile') {
            // For mobile OTP, Firebase handles verification on client-side
            // We just need to mark the verification as successful in our database
            $updateSql = "UPDATE OTPTable SET used = 1 WHERE contact = ? AND method = ? AND used = 0";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->execute([$contact, $method]);
            
            if ($updateStmt->rowCount() > 0) {
                return [
                    'success' => true,
                    'message' => 'Mobile OTP verified successfully via Firebase'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'No valid OTP request found or OTP expired'
                ];
            }
        } else {
            // For email OTP, verify against stored OTP
            $verifySql = "SELECT * FROM OTPTable WHERE contact = ? AND otp = ? AND used = 0 ORDER BY created_at DESC";
            $verifyStmt = $conn->prepare($verifySql);
            $verifyStmt->execute([$contact, $otp]);
            $otpRecord = $verifyStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($otpRecord) {
                // Mark OTP as used
                $updateSql = "UPDATE OTPTable SET used = 1 WHERE id = ?";
                $updateStmt = $conn->prepare($updateSql);
                $updateStmt->execute([$otpRecord['id']]);
                
                return [
                    'success' => true,
                    'message' => 'Email OTP verified successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Invalid OTP or OTP expired'
                ];
            }
        }
        
    } catch (Exception $e) {
        error_log("OTP verification failed: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Verification error occurred'
        ];
    }
}
?>
