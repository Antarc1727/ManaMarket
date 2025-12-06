<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$host = "localhost";
$user = "root"; 
$pass = ""; 
$db   = "manamarket";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!isset($data['email'], $data['total'], $data['address'], $data['items']) || !is_array($data['items']) || empty($data['items'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or incomplete data provided. Missing email, total, address, or items."]);
    exit;
}

$user_email = $data['email'];
$total_amount = (float)$data['total'];
$shipping_address = $data['address'];
$items = $data['items'];

$conn->begin_transaction();
$is_successful = true;
$error_message = "";

try {
    $sql_order = "INSERT INTO orders (user_email, total_amount, shipping_address, order_status) VALUES (?, ?, ?, 'Processing')";
    $stmt_order = $conn->prepare($sql_order);
    
    if (!$stmt_order) {
        throw new Exception("Prepare statement failed for ORDER: " . $conn->error);
    }
    
    $stmt_order->bind_param("sds", $user_email, $total_amount, $shipping_address);
    
    if (!$stmt_order->execute()) {
        throw new Exception("Order insertion failed: " . $stmt_order->error);
    }
    
    $order_id = $conn->insert_id; 
    $stmt_order->close();

    $sql_item = "INSERT INTO order_items (order_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?)";
    $stmt_item = $conn->prepare($sql_item);

    if (!$stmt_item) {
        throw new Exception("Prepare item statement failed: " . $conn->error);
    }
    
    foreach ($items as $item) {
        $name = $item['name'];
        $price = (float)$item['price'];
        $quantity = (int)$item['quantity'];

        $stmt_item->bind_param("isdi", $order_id, $name, $price, $quantity);
        
        if (!$stmt_item->execute()) {
             throw new Exception("Order item insertion failed for product '{$name}': " . $stmt_item->error);
        }
    }
    
    $stmt_item->close();

    $conn->commit();

} catch (Exception $e) {
    $conn->rollback();
    $is_successful = false;
    $error_message = $e->getMessage();
}

$conn->close();

if ($is_successful) {
    echo json_encode(["success" => true, "order_id" => $order_id]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "An error occurred during checkout. Please check the database and the 'users' table foreign key setup. Error details: " . ($error_message ?? "Unknown error.")]);
}
?>