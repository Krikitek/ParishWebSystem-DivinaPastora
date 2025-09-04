<?php
require_once 'dbConnection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $method = $_POST['method'];  // 'email' or 'mobile'
        $contact = trim($_POST['contact']);
        $purpose = $_POST['purpose']; // 'account_creation' or 'password_reset'

        // Validate input
        if (empty($method) || empty($contact) || empty($purpose)) {
            echo json_encode(['success' => false, 'message' => 'Missing required information']);
            exit;
        }

        // Ensure OTPTable exists
        try {
            $conn->query("SELECT 1 FROM OTPTable");
        } catch (PDOException $e) {
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
            } else {
                throw $e;
            }
        } 
        
        // Default expiry time = 10 minutes from now
        $dateadd = new DateTime('now', new DateTimeZone('Asia/Manila'));
        $dateadd->modify('+5 minutes');
        $expiry = $dateadd->format('Y-m-d H:i:s');

        $date = new DateTime('now', new DateTimeZone('Asia/Manila'));
        $localDate = $date->format('Y-m-d H:i:s');

        // Insertion logic based on method
        if ($method === 'mobile') {
            // ✅ MOBILE: Firebase will handle OTP verification on client-side
            $storeSql = "INSERT INTO OTPTable (contact, method, otp, purpose, expiry, created_at) 
                         VALUES (?, ?, ?, ?, ?, ?)";
            $storeStmt = $conn->prepare($storeSql);
            $storeStmt->execute([$contact, $method, 'FIREBASE_VERIFY', $purpose, $expiry, $localDate]);

            echo json_encode([
                'success' => true,
                'message' => 'Ready for Firebase OTP',
                'method' => $method,
                'contact' => $contact,
                'expires_in' => 300,
                'firebase_ready' => true
            ]);
            exit();
        } 
        
        elseif ($method === 'email') {
            // ✅ EMAIL: Generate a unique 6-digit OTP
            $otp = null;
            $isUnique = false;

            while (!$isUnique) {
                $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT); // 6-digit random OTP

                // Check if OTP already exists in DB
                $checkSql = "SELECT COUNT(*) FROM OTPTable WHERE otp = ?";
                $checkStmt = $conn->prepare($checkSql);
                $checkStmt->execute([$otp]);
                $count = $checkStmt->fetchColumn();

                if ($count == 0) {
                    $isUnique = true; // OTP is unique
                }
            }

            // Insert OTP into the database
            $storeSql = "INSERT INTO OTPTable (contact, method, otp, purpose, expiry, created_at) 
                         VALUES (?, ?, ?, ?, ?, ?)";
            $storeStmt = $conn->prepare($storeSql);
            $storeStmt->execute([$contact, $method, $otp, $purpose, $expiry, $localDate]);

            echo json_encode([
                'success' => true,
                'message' => 'OTP sent successfully via email',
                'method' => $method,
                'contact' => $contact,
                'otp' => $otp,  // You can remove this in production for security
                'expires_in' => 300,
                'firebase_ready' => false
            ]);
            exit();
        } 
        
        else {
            echo json_encode(['success' => false, 'message' => 'Invalid method']);
            exit();
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
?>
