<?php
session_start();
header('Content-Type: application/json');
require_once 'dbConnection.php';

// ✅ Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// ✅ Extract data safely
$userID = $_SESSION['user_id'];
$certificateType = $data['certificateType'] ?? '';
$purposeOfRequest = $data['purposeOfRequest'] ?? '';
$docDeliverAddress = $data['docDeliverAddress'] ?? '';
$pickupDate = $data['pickupDate'] ?? '';
$relationshipToTheDocumentOwner = $data['relationshipToTheDocumentOwner'] ?? '';
$lastName = $data['lastName'] ?? '';
$firstName = $data['firstName'] ?? '';
$middleName = $data['middleName'] ?? '';
$dateOfSacrament = $data['dateOfSacrament'] ?? '';
$fatherLastName = $data['fatherLastName'] ?? '';
$fatherFirstName = $data['fatherFirstName'] ?? '';
$fatherMiddleName = $data['fatherMiddleName'] ?? '';
$motherMaidenName = $data['motherMaidenName'] ?? '';
$motherFirstName = $data['motherFirstName'] ?? '';
$motherMiddleName = $data['motherMiddleName'] ?? '';
$placeOfBirth = $data['placeOfBirth'] ?? '';
$dateOfBirth = $data['dateOfBirth'] ?? '';
$paymentRef = $data['paymentRef'] ?? '';
$paymentDate = date('Y-m-d H:i:s');
$paymentID = uniqid();
$pickUpMode = !empty($docDeliverAddress) ? 'PAGHAHATID' : 'KUKUNIN SA PAROKYA';
$zipcode = $data['zipcode'] ?? '';
$status = $data['status'] ?? '';
$sex = $data['sex'] ?? '';
$totalFee = $data['amount'] ?? 0;
try {
    $conn->beginTransaction();

    // Determine pickup mode based on whether there's a delivery address

date_default_timezone_set('Asia/Manila');
$requestDate = date('Y-m-d H:i:s');

// Insert query including pickUpMode column
$sql = "INSERT INTO RequestDocumentsTable 
        (userID, documentType, purposeOfRequest, docDeliverAddress, pickUpMode, requestStatus, requestDate, zipcode, preferredDate)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->execute([$userID, $certificateType, $purposeOfRequest, $docDeliverAddress, $pickUpMode, $requestDate, $zipcode, $pickupDate]);


    // ✅ Get the new requestID safely
    $requestID = $conn->lastInsertId();
    

    // ✅ Insert into RecordsOfPaymentTable
    $sql = "INSERT INTO RecordsOfPaymentTable 
            (userID, serviceID, amount, paymentMethod, paymentDate, paymentRef, status)
            VALUES (?, ?, ?, 'Online', ?, ?, 'pending')";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$userID, $requestID, $totalFee, $paymentDate, $paymentRef]);

    // ✅ Insert into the appropriate certificate table
    if ($certificateType === 'Confirmation' || $certificateType === 'CONFIRMATION') {
        $sql = "INSERT INTO ConfirmationCertificateTable 
                (userID, requestID, relationshipToTheDocumentOwner, lastName, firstName, middleName, dateOfConfirmation,
                fatherLastName, fatherFirstName, fatherMiddleName, motherMaidenName, motherFirstName, motherMiddleName,
                placeOfBirth, dateOfBirth, sex)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$userID, $requestID, $relationshipToTheDocumentOwner, $lastName, $firstName, $middleName,
                        $dateOfSacrament, $fatherLastName, $fatherFirstName, $fatherMiddleName,
                        $motherMaidenName, $motherFirstName, $motherMiddleName, $placeOfBirth, $dateOfBirth]);
    } elseif ($certificateType === 'Baptism' || $certificateType === 'BAPTISMAL') {
        $sql = "INSERT INTO BaptismCertificateTable 
                (userID, requestID, relationshipToTheDocumentOwner, lastName, firstName, middleName, dateOfBaptism,
                fatherLastName, fatherFirstName, fatherMiddleName, motherMaidenName, motherFirstName, motherMiddleName,
                placeOfBirth, dateOfBirth, sex)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$userID, $requestID, $relationshipToTheDocumentOwner, $lastName, $firstName, $middleName,
                        $dateOfSacrament, $fatherLastName, $fatherFirstName, $fatherMiddleName,
                        $motherMaidenName, $motherFirstName, $motherMiddleName, $placeOfBirth, $dateOfBirth, $sex]);
    }

    $conn->commit();
    $_SESSION['requestID'] = $requestID;
    

    echo json_encode([
        'success' => true,
        'message' => 'Request submitted successfully.'
    ]);

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        'success' => false,
        'message' => 'Failed to submit request.',
        'error' => $e->getMessage()
    ]);
}
?>
