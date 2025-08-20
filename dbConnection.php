<?php
// Azure SQL Database credentials
$serverName = "parishdatabase.database.windows.net";
$database   = "parishdatabase";
$username   = "parishdatabase";
$password   = "Password1";

// Create connection using PDO
try {
    $conn = new PDO(
        "sqlsrv:server=$serverName;Database=$database",
        $username,
        $password,
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::SQLSRV_ATTR_ENCODING => PDO::SQLSRV_ENCODING_UTF8
        )
    );
    // echo "✅ Connected to Azure SQL Database!";
} catch (PDOException $e) {
    die("❌ Connection failed: " . $e->getMessage());
}
?>
