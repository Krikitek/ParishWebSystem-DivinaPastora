<?php
require_once 'dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $email = $_GET['email'];

        if (empty($email)) {
            echo json_encode(['success' => false, 'message' => 'Email is required']);
            exit;
        }

        $sql = "SELECT otp FROM OTPTable WHERE contact = ? AND used = 0 ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$email]);
        $otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($otpRecord) {
            echo json_encode(['success' => true, 'otp' => $otpRecord['otp']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No valid OTP found']);
        }

    } catch (Exception $e) {
        error_log("Error in getOTP.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'An error occurred']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
