<?php
session_start();
require_once 'dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {              
        $contact = trim($_POST['contact']);
        $password = $_POST['password'];

        // Validate input
        if (empty($contact) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Please enter complete credentials']);
            exit;
        }

        // ✅ MSSQL compatible query
        $sql = "SELECT *
                FROM UserAccountTable
                WHERE (email = ? OR phoneNumber = ?)
                AND accountStatus = 'active'";

        // ✅ Prepare & execute for MSSQL
        $stmt = $conn->prepare($sql);
        $stmt->execute([$contact, $contact]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // If no user found
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Incorrect Email or Password']);
            exit;
        }

        // ✅ Verify password
        if (!password_verify($password, $user['password'])) {            
            echo json_encode(['success' => false, 'message' => 'Incorrect Email or Password']);            
            exit;
        }

        // ✅ Set timezone & get local time
        $date = new DateTime('now', new DateTimeZone('Asia/Manila'));
        $localDate = $date->format('Y-m-d H:i:s');

        // ✅ Update last login time (MSSQL)
        $updateSql = "UPDATE UserAccountTable SET lastLogIn = ? WHERE userID = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->execute([$localDate, $user['userID']]);

        // ✅ Start session
        $_SESSION['user_id'] = $user['userID'];

        // Remove password before sending response
        unset($user['password']);

                echo json_encode([
            'success' => true,
            'user' => $user,
            'firstName' => $user['firstName'],
            'middleName'  => $user['middleName'],
            'lastName'  => $user['lastName'],
            'dateOfBirth' => $user['dateOfBirth'],
            'birthProvince'  => $user['birthProvince'],
            'birthCity'  => $user['birthCity'],
            'birthBarangay'  => $user['birthBarangay'],
            'email'  => $user['email'],
            'phoneNumber'  => $user['phoneNumber'],
            'message' => 'Login successful'
        ]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'An error occurred']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
