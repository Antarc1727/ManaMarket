<?php
// Database Configuration and Connection Details
// You MUST replace the placeholder values below with your actual MySQL credentials.

$servername = "localhost"; // Usually 'localhost' for local development environments
$username = "root";       // Your MySQL username (commonly 'root' by default)
$password = "";           // Your MySQL password (often empty or 'root' for MAMP)
$dbname = "manamarket"; // The EXACT name of your database

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection and exit if failed
if ($conn->connect_error) {
    // Stop the script and output the error to the console (not the client)
    die("Connection failed: " . $conn->connect_error);
}

// If the connection is successful, the $conn variable is now ready to be used
// in scripts that require this file (like fetch_orders.php).
?>