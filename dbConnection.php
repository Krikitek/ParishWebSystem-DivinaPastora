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

require 'vendor/autoload.php';
use MicrosoftAzure\Storage\Blob\BlobRestProxy;
use MicrosoftAzure\Storage\Common\Exceptions\ServiceException;

$storageConnectionString = "DefaultEndpointsProtocol=https;AccountName=parishstorage;AccountKey=31WAA5vvg55Uev7QxWjGkyVdu+83vIlTtDbRjzIOQHJ8saQCssUqNkh6zKuMKcSPQXdw5QMADYXB+AStd6JAoA==;EndpointSuffix=core.windows.net";

try {
    $blobClient = BlobRestProxy::createBlobService($storageConnectionString);
    // echo "✅ Connected to Azure Blob Storage!";
} catch (ServiceException $e) {
    die("❌ Storage connection failed: " . $e->getMessage());
}
?>
