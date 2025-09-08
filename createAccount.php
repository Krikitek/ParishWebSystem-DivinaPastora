<?php
require_once 'dbConnection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $firstName   = strtoupper(trim($_POST['firstName']));
        $midName   = strtoupper(trim($_POST['midName']));
        $lastName    = strtoupper(trim(($_POST['lastName'])));
        $birthDate    = $_POST['dateInput'];
        $email       = trim($_POST['email']);
        $password    = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $role        = 'user'; // Default role
        $phoneNumber = trim($_POST['phoneNumber']);
        $province    = strtoupper($_POST['province']);
        $city    = strtoupper($_POST['city']);
        $barangay    = strtoupper($_POST['barangay']);

        // Validate required fields
        if (empty($firstName) || empty($midName) || empty($lastName) || empty($birthDate) || empty($email) || empty($_POST['password'])) {
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

        $date = new DateTime('now', new DateTimeZone('Asia/Manila'));
        $localDate = $date->format('Y-m-d H:i:s');

        // Insert new user
        $sql = "INSERT INTO UserAccountTable 
                (firstName, lastName, email, password, role, phoneNumber, accountStatus, accountDateCreated, middleName, dateOfBirth, birthProvince, birthCity, birthBarangay)
                VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        $stmt->execute([$firstName, $lastName, $email, $password, $role, $phoneNumber, $localDate, $midName, $birthDate, $province, $city, $barangay]);

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
