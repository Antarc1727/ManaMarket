<?php
// Set content type to JSON
header('Content-Type: application/json');

// --- 1. Database Connection and Configuration ---
// Assuming db_connect.php holds your MySQL connection credentials:
// $servername, $username, $password, $dbname
require_once 'db_connect.php'; 

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => "Connection failed: " . $conn->connect_error]);
    exit();
}

// --- 2. Get User Email from Session/Authentication ---
// IMPORTANT: In a real-world scenario, you would use PHP session data
// to verify the user's identity securely. Since this environment uses
// localStorage for a "simulated session," we will simulate reading
// the email from the client-side for demonstration.

// In a real application, you would use:
// session_start();
// if (!isset($_SESSION['user_email'])) {
//     echo json_encode(['success' => false, 'error' => 'User not logged in.']);
//     exit();
// }
// $user_email = $_SESSION['user_email'];

// --- SIMULATED USER EMAIL (Requires client-side input for demo) ---
// This is INSECURE for production but works for demonstration purposes
// where the client is sending the email address.
$user_email = $_GET['email'] ?? ''; // Read email from URL parameter

if (empty($user_email)) {
    // If the client-side hasn't provided the email (e.g., user is not logged in)
    echo json_encode(['success' => false, 'error' => 'User session is required to view orders.']);
    $conn->close();
    exit();
}
// -------------------------------------------------------------------


// --- 3. SQL Query to Fetch Orders ---
// Prepare the SQL statement to prevent SQL injection
$sql = "SELECT order_id, user_email, order_date, total_amount, order_status 
        FROM orders 
        WHERE user_email = ? 
        ORDER BY order_date DESC"; // Most recent orders first

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_email);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'error' => 'Database query failed: ' . $stmt->error]);
    $stmt->close();
    $conn->close();
    exit();
}

// Get the result set
$result = $stmt->get_result();
$orders = [];

// Fetch all rows
while ($row = $result->fetch_assoc()) {
    // Format the date for better display
    $row['order_date'] = date("Y-m-d H:i", strtotime($row['order_date']));
    // Format the amount
    $row['total_amount'] = '$' . number_format($row['total_amount'], 2);
    
    $orders[] = $row;
}

// --- 4. Output Results ---
echo json_encode(['success' => true, 'orders' => $orders]);

// --- 5. Cleanup ---
$stmt->close();
$conn->close();
?>