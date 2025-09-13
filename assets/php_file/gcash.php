<?php
// Step 1: Set your secret key

// Step 2: Create Payment Intent
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://api.paymongo.com/v1/payment_intents");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Basic " . base64_encode($secret_key . ":"),
    "Content-Type: application/json"
]);

// Step 3: Define payment details
$data = [
    "data" => [
        "attributes" => [
            "amount" => 50000,  // Amount in centavos (₱500.00 = 50000)
            "payment_method_allowed" => ["gcash"],
            "payment_method_options" => [
                "gcash" => ["setup_future_usage" => "on_session"]
            ],
            "currency" => "PHP"
        ]
    ]
];

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

// Step 4: Execute request
$response = curl_exec($ch);
if (curl_errno($ch)) {
    echo "cURL Error: " . curl_error($ch);
    exit;
}

curl_close($ch);

// Step 5: Handle response
$result = json_decode($response, true);

if (isset($result['errors'])) {
    echo "<pre>";
    print_r($result['errors']);
    echo "</pre>";
    exit;
}

// Step 6: Get client_key for frontend
echo json_encode($result);
?>
