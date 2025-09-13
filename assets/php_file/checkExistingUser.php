<?php
require_once 'dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email']);
        $phoneNumber = isset($_POST['phoneNumber']) ? trim($_POST['phoneNumber']) : '';

        // Validate input
        if (empty($email)) {
            echo json_encode(['success' => false, 'message' => 'Email is required']);
            exit;
        }

        // Check if email already exists
        $checkEmailSql = "SELECT COUNT(*) FROM UserAccountTable WHERE email = ?";
        $checkEmailStmt = $conn->prepare($checkEmailSql);
        $checkEmailStmt->execute([$email]);
        
        if ($checkEmailStmt->fetchColumn() > 0) {
            echo json_encode(['success' => false, 'message' => 'The email is already in use']);
            exit;
        }

        // Check if phone number already exists (if provided)
        if (!empty($phoneNumber)) {
            $checkPhoneSql = "SELECT COUNT(*) FROM UserAccountTable WHERE phoneNumber = ?";
            $checkPhoneStmt = $conn->prepare($checkPhoneSql);
            $checkPhoneStmt->execute([$phoneNumber]);
            
            if ($checkPhoneStmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'The mobile number is already in use']);
                exit;
            }
        }

        // If we get here, both email and phone number are available
        echo json_encode(['success' => true, 'message' => 'Email and phone number are available']);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
