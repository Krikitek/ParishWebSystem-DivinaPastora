<?php
session_start();

header("Content-Type: application/json");

// Always allow POST logout requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);
    exit();
}

// If not POST, return an error
echo json_encode(['success' => false, 'message' => 'Invalid request']);
exit();
?>