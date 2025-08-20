<?php
require_once 'dbConnection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $firstName   = trim($_POST['firstName']);
        $lastName    = trim($_POST['lastName']);
        $email       = trim($_POST['email']);
        $password    = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $role        = 'user'; // Default role
        $phoneNumber = trim($_POST['phoneNumber']);
        $address     = trim($_POST['address']);

        // Validate required fields
        if (empty($firstName) || empty($lastName) || empty($email) || empty($_POST['password'])) {
            throw new Exception("Please fill in all required fields");
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Please enter a valid email address");
        }

        // Validate password length
        if (strlen($_POST['password']) < 6) {
            throw new Exception("Password must be at least 6 characters long");
        }

        // Check if email already exists
        $checkEmailSql = "SELECT COUNT(*) FROM UserAccountTable WHERE email = ?";
        $checkEmailStmt = $conn->prepare($checkEmailSql);
        $checkEmailStmt->execute([$email]);
        
        if ($checkEmailStmt->fetchColumn() > 0) {
            throw new Exception("The email is already in use");
        }

        // Check if phone number already exists (if provided)
        if (!empty($phoneNumber)) {
            $checkPhoneSql = "SELECT COUNT(*) FROM UserAccountTable WHERE phoneNumber = ?";
            $checkPhoneStmt = $conn->prepare($checkPhoneSql);
            $checkPhoneStmt->execute([$phoneNumber]);
            
            if ($checkPhoneStmt->fetchColumn() > 0) {
                throw new Exception("The mobile number is already in use");
            }
        }

        // Insert new user
        $sql = "INSERT INTO UserAccountTable 
                (firstName, lastName, email, password, role, phoneNumber, address, accountStatus, accountDateCreated)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active', GETDATE())";

        $stmt = $conn->prepare($sql);
        $stmt->execute([$firstName, $lastName, $email, $password, $role, $phoneNumber, $address]);

        echo "Account created successfully!";

    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'UNIQUE KEY constraint') !== false) {
            echo "Email already exists";
        } else {
            echo "Database error: " . $e->getMessage();
        }
    } catch (Exception $e) {
        echo $e->getMessage();
    }
}
?>
