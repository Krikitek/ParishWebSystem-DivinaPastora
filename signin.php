<?php
require_once 'dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email']);
        $password = $_POST['password'];

        // Validate input
        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Please enter both email and password']);
            exit;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
            exit;
        }

        // Query user from database
        $sql = "SELECT userID, firstName, lastName, email, password, role, phoneNumber, address, accountStatus 
                FROM UserAccountTable 
                WHERE email = ? AND accountStatus = 'active'";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Incorrect Email or Password']);
            exit;
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Incorrect Email or Password']);
            exit;
        }

        // Update last login time
        $updateSql = "UPDATE UserAccountTable SET lastLogIn = GETDATE() WHERE userID = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->execute([$user['userID']]);

        // Remove password from user data before sending to client
        unset($user['password']);

        // Return success response
        echo json_encode([
            'success' => true,
            'user' => $user,
            'message' => 'Login successful'
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
