<?php
header('Content-Type: application/json');
require 'dbConnection.php'; // include your PDO setup

// Get POST variables safely
$certificateRequest = $_POST['certificateRequest'] ?? null;
// Only proceed if certificateRequest is explicitly true (boolean or string "true")
if ($certificateRequest === true || $certificateRequest === "true" || $certificateRequest === 1 || $certificateRequest === "1") {

    // Always get the CERTIFICATE REQUEST fee
    $sql = "SELECT typeOfService, serviceFee 
        FROM ServiceFeeTable 
        WHERE typeOfService IN ('CERTIFICATE REQUEST', 'CERTIFICATE DELIVERY FEE')";

$stmt = $conn->query($sql);
$fees = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

// ✅ fetchAll(PDO::FETCH_KEY_PAIR) gives:
// [ 'CERTIFICATE REQUEST' => 100.00, 'DELIVERY FEE' => 50.00 ]

$certFee=$fees['CERTIFICATE REQUEST'] ?? 0;
    $deliveryFee = $fees['CERTIFICATE DELIVERY FEE'] ?? 0;

    echo json_encode([
        "certificateFee" => $certFee,
        "deliveryFee"    => $deliveryFee
    ]);

} else {
    echo json_encode(['error' => 'certificateRequest must be true']);
}
