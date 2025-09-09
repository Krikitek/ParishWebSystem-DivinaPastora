<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;

// Load .env file
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();
// Azure SQL Database credentials
$serverName = $_ENV['DB_serverName'];
$database   = $_ENV['DB_database'];
$username   = $_ENV['DB_username'];
$password   = $_ENV['DB_password'];

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


use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Common\Exceptions\ServiceException;

$storageConnectionString = $_ENV['AZURE_string'];

try {
    $blobClient = BlobRestProxy::createBlobService($storageConnectionString);
    // echo "✅ Connected to Azure Blob Storage!";
} catch (ServiceException $e) {
    die("❌ Storage connection failed: " . $e->getMessage());
}
?>
