<?php
require_once 'dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $method = $_POST['method']; // 'email' or 'mobile'
        $contact = trim($_POST['contact']);

        // Validate input
        if (empty($method) || empty($contact)) {
            echo json_encode(['success' => false, 'message' => 'Missing required information']);
            exit;
        }

        // Prepare query based on method
        if ($method === 'email') {
            // Validate email format
            if (!filter_var($contact, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
                exit;
            }

            $sql = "SELECT userID, firstName, lastName, email FROM UserAccountTable WHERE email = ? AND accountStatus = 'active'";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$contact]);
            
        } else if ($method === 'mobile') {
            // For mobile, we expect the contact to be in format +63XXXXXXXXXX
            $sql = "SELECT userID, firstName, lastName, phoneNumber FROM UserAccountTable WHERE phoneNumber = ? AND accountStatus = 'active'";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$contact]);
            
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid verification method']);
            exit;
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Contact information not found']);
            exit;
        }

        // In a real application, you would:
        // 1. Generate a verification code
        // 2. Store it in database with expiration time
        // 3. Send it via email/SMS service
        
        // For this demo, we'll just return success
        echo json_encode([
            'success' => true,
            'message' => 'Verification code sent successfully'
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
