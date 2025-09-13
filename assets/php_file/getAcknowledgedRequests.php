<?php
session_start();
header('Content-Type: application/json');
require_once 'dbConnection.php';

$userID = $_SESSION['user_id'];
$requestID = $_SESSION['requestID'] ?? ($_GET['requestID'] ?? null);

try {
    $sql = "
        SELECT TOP 1
    r.requestID, 
    r.documentType AS certificateType, 
    r.purposeOfRequest, 
    r.docDeliverAddress, 
    r.requestStatus, 
    r.requestDate AS dateRequested,
    p.amount, 
    p.paymentMethod, 
    p.paymentDate, 
    p.paymentRef,
    c.lastName AS confirmation_lastName, 
    c.firstName AS confirmation_firstName, 
    c.middleName AS confirmation_middleName, 
    c.dateOfConfirmation,
    b.lastName AS baptism_lastName, 
    b.firstName AS baptism_firstName, 
    b.middleName AS baptism_middleName, 
    b.dateOfBaptism
FROM RequestDocumentsTable r
LEFT JOIN RecordsOfPaymentTable p 
    ON r.requestID = p.serviceID 
    AND r.userID = p.userID
LEFT JOIN ConfirmationCertificateTable c 
    ON r.requestID = c.requestID 
    AND r.userID = c.userID
LEFT JOIN BaptismCertificateTable b 
    ON r.requestID = b.requestID 
    AND r.userID = b.userID
WHERE r.userID = ? AND r.requestID = ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$userID, $requestID]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC); // only fetch one row

    if ($result) {
        echo json_encode([
        'success' => true,
        'data' => $result,
        'requestID' => $requestID  // ✅ pass it back
    ]);
    unset($_SESSION['requestID']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No matching request found.']);
    }

} catch (Exception $e) {
    error_log("DB Error: " . $e->getMessage()); // log error for debugging
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve request.',
        'error' => $e->getMessage()
    ]);
}
