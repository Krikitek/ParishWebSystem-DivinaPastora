<?php
header('Content-Type: application/json');
require_once 'dbConnection.php';

try {
    // Get latest Confirmation request
    $stmtConfirm = $conn->query("
        SELECT TOP 1 
    b.lastName, 
    b.firstName, 
    b.requestID, 
    b.userID, 
    r.requestDate,
    r.documentType
FROM BaptismCertificateTable b
INNER JOIN RequestDocumentsTable r 
    ON b.requestID = r.requestID 
   AND b.userID = r.userID
ORDER BY r.requestDate DESC, b.requestID DESC;
    ");
    $latestConfirm = $stmtConfirm->fetch(PDO::FETCH_ASSOC);

    // Get latest Baptism request
    $stmtBaptism = $conn->query("
        SELECT TOP 1 
    c.lastName, 
    c.firstName, 
    c.requestID, 
    c.userID, 
    r.requestDate,
    r.documentType
FROM ConfirmationCertificateTable c
INNER JOIN RequestDocumentsTable r 
    ON c.requestID = r.requestID 
   AND c.userID = r.userID
ORDER BY r.requestDate DESC, c.requestID DESC;
    ");
    $latestBaptism = $stmtBaptism->fetch(PDO::FETCH_ASSOC);

    // Determine which is newer
    $latestRequest = null;
    if ($latestConfirm && $latestBaptism) {
        $latestRequest = ($latestConfirm['requestDate'] > $latestBaptism['requestDate'])
            ? $latestConfirm
            : $latestBaptism;
    } elseif ($latestConfirm) {
        $latestRequest = $latestConfirm;
    } elseif ($latestBaptism) {
        $latestRequest = $latestBaptism;
    }

    if ($latestRequest) {
        // Count how many requests happened at the same requestDate
        $stmtCount = $conn->prepare("
            SELECT COUNT(*) AS cnt
            FROM RequestDocumentsTable
            WHERE requestDate = ?
        ");
        $stmtCount->execute([$latestRequest['requestDate']]);
        $countResult = $stmtCount->fetch(PDO::FETCH_ASSOC);

        if ($countResult['cnt'] == 1) {
            // ✅ Only one request at that time → return names
            echo json_encode([
                'success' => true,
                'type' => 'single',
                'data' => [
                    'fullName'  => $latestRequest['firstName'] . ' ' . $latestRequest['lastName'],
                    'requestID' => $latestRequest['requestID'],
                    'documentType' => $latestRequest['documentType']
                ]
            ]);
        } else {
            // ⚠ Multiple requests → return count
            echo json_encode([
                'success' => true,
                'type' => 'multiple',
                'count' => $countResult['cnt']
            ]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No requests found']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
