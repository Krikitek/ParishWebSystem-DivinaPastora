<?php
// Simple test file to debug OTP functionality
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>OTP System Test</h2>";

// Test 1: Check if dbConnection.php exists and works
echo "<h3>1. Testing Database Connection</h3>";
if (file_exists('dbConnection.php')) {
    echo "✓ dbConnection.php file exists<br>";
    try {
        require_once 'dbConnection.php';
        echo "✓ Database connection file loaded<br>";
        
        if (isset($conn)) {
            echo "✓ Database connection variable exists<br>";
            
            // Test connection
            $testQuery = $conn->query("SELECT 1 as test");
            if ($testQuery) {
                echo "✓ Database connection is working<br>";
            } else {
                echo "✗ Database connection failed<br>";
            }
        } else {
            echo "✗ Database connection variable not found<br>";
        }
    } catch (Exception $e) {
        echo "✗ Error loading database connection: " . $e->getMessage() . "<br>";
    }
} else {
    echo "✗ dbConnection.php file not found<br>";
}

// Test 2: Check if OTP table exists
echo "<h3>2. Testing OTP Table</h3>";
if (isset($conn)) {
    try {
        $checkTable = $conn->query("SELECT COUNT(*) FROM OTPTable");
        if ($checkTable) {
            echo "✓ OTPTable exists<br>";
        }
    } catch (PDOException $e) {
        echo "✗ OTPTable does not exist: " . $e->getMessage() . "<br>";
        
        // Try to create the table
        echo "Attempting to create OTPTable...<br>";
        try {
            $createTableSql = "
            CREATE TABLE OTPTable (
                id INT IDENTITY(1,1) PRIMARY KEY,
                contact NVARCHAR(100) NOT NULL,
                method NVARCHAR(10) NOT NULL,
                otp NVARCHAR(6) NOT NULL,
                purpose NVARCHAR(20) NOT NULL,
                expiry DATETIME NOT NULL,
                created_at DATETIME DEFAULT GETDATE(),
                used BIT DEFAULT 0
            )";
            $conn->exec($createTableSql);
            echo "✓ OTPTable created successfully<br>";
        } catch (PDOException $e2) {
            echo "✗ Failed to create OTPTable: " . $e2->getMessage() . "<br>";
        }
    }
}

// Test 3: Test OTP generation and storage
echo "<h3>3. Testing OTP Generation and Storage</h3>";
if (isset($conn)) {
    try {
        $testEmail = "test@example.com";
        $testOTP = sprintf('%06d', mt_rand(0, 999999));
        $testExpiry = date('Y-m-d H:i:s', strtotime('+5 minutes'));
        
        echo "Generated OTP: $testOTP<br>";
        
        $storeSql = "INSERT INTO OTPTable (contact, method, otp, purpose, expiry, created_at) VALUES (?, ?, ?, ?, ?, GETDATE())";
        $storeStmt = $conn->prepare($storeSql);
        $result = $storeStmt->execute([$testEmail, 'email', $testOTP, 'test', $testExpiry]);
        
        if ($result) {
            echo "✓ OTP stored successfully<br>";
            
            // Test retrieval
            $retrieveSql = "SELECT * FROM OTPTable WHERE contact = ? AND otp = ? ORDER BY created_at DESC";
            $retrieveStmt = $conn->prepare($retrieveSql);
            $retrieveStmt->execute([$testEmail, $testOTP]);
            $otpRecord = $retrieveStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($otpRecord) {
                echo "✓ OTP retrieved successfully<br>";
                echo "Record ID: " . $otpRecord['id'] . "<br>";
            } else {
                echo "✗ Failed to retrieve OTP<br>";
            }
        } else {
            echo "✗ Failed to store OTP<br>";
        }
    } catch (Exception $e) {
        echo "✗ Error in OTP test: " . $e->getMessage() . "<br>";
    }
}

// Test 4: Test POST data handling
echo "<h3>4. Testing POST Data</h3>";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "POST data received:<br>";
    echo "Method: " . ($_POST['method'] ?? 'not set') . "<br>";
    echo "Contact: " . ($_POST['contact'] ?? 'not set') . "<br>";
    echo "Purpose: " . ($_POST['purpose'] ?? 'not set') . "<br>";
} else {
    echo "No POST data (this is normal for direct access)<br>";
}

echo "<h3>Test Complete</h3>";
echo "<p>If you see any ✗ marks above, those indicate issues that need to be fixed.</p>";
?>
