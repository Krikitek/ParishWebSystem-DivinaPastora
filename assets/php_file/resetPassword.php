<?php
require_once 'dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $method = $_POST['method']; // 'email' or 'mobile'
        $contact = trim($_POST['contact']);
        $newPassword = $_POST['newPassword'];

        // Validate input
        if (empty($method) || empty($contact) || empty($newPassword)) {
            echo json_encode(['success' => false, 'message' => 'Missing required information']);
            exit;
        }

        // Validate password length
        if (strlen($newPassword) < 6) {
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
            exit;
        }

        // In a real application, you would verify the verification code from database
        // For this demo, we'll assume the verification was already done in JavaScript

        // Find user based on contact method
        if ($method === 'email') {
            if (!filter_var($contact, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
                exit;
            }

            $sql = "SELECT userID FROM UserAccountTable WHERE email = ? AND accountStatus = 'active'";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$contact]);
            
        } else if ($method === 'mobile') {
            $sql = "SELECT userID FROM UserAccountTable WHERE phoneNumber = ? AND accountStatus = 'active'";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$contact]);
            
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid verification method']);
            exit;
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }

        // Hash the new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        // Update password in database
        $updateSql = "UPDATE UserAccountTable SET password = ? WHERE userID = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->execute([$hashedPassword, $user['userID']]);

        echo json_encode([
            'success' => true,
            'message' => 'Password reset successfully'
        ]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'An error occurred']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
