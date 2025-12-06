<?php
// removed session_start()
ini_set('display_errors', 1);
error_reporting(E_ALL);

// signing up
$host = "localhost";
$user = "root"; 
$pass = ""; 
$db   = "manamarket";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 1. Get user input
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// 2. Server-side validation for password length
if (strlen($password) < 6) {
    $error_message = "Error: Password must be at least 6 characters long.";
    
    // Output standard HTML structure for the error page
    echo '<!DOCTYPE html><html><head><title>Registration Failed</title><link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@100..900&family=Epunda+Slab:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
    </head><body>';

    // *** UPDATED NAV BAR TO MATCH signup.html ***
    echo '<div class="topnav">
            <div class="topnav-left">
                <a href="index.html">Home</a>
            </div>
            <div class="topnav-right">
                <a href="store.html">Store</a>
                <a href="store.html">Cart</a>
                <a class="active" href="signup.html">Sign Up</a>
                <a href="login.html">Log In</a>
                <a href="contactus.html">Contact</a>

                <span id="userEmailDisplay" class="email-display" style="padding: 14px 16px; color: #ffafcc; font-weight: bold; display:none;"></span>
                <a href="#" id="logoutBtn" style="display:none;">Log Out</a>
            </div>
          </div>
          <center>';

    echo '<div class="container" id="login">
            <h3 class="bitcount-grid-double" style="color: red;">Registration Failed</h3>
            <p class="epunda-slab-font" style="color:red; text-align:center; font-size: 1.1em;">
                ' . $error_message . '
            </p>
            <div class="small-link"><a href="signup.html" style="font-weight:700; text-decoration:underline;">Try Again</a></div>
          </div>';
    echo '</center></body></html>';
    $conn->close();
    exit; // Stop execution
}

// 3. Hash the password before storage
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (email, password) VALUES (?, ?)";
$stmt = $conn->prepare($sql);

if ($stmt === false) {
    die('Prepare failed: ' . htmlspecialchars($conn->error));
}

$stmt->bind_param("ss", $email, $hashed_password);

echo '<!DOCTYPE html>
<html>
<head>
    <title>Registration Result</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@100..900&family=Epunda+Slab:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
</head>
<body>
    <div class="topnav">
    <div class="topnav-left">
        <a href="index.html">Home</a>
    </div>
    <div class="topnav-right">
        <a href="store.html">Store</a>
        <a href="store.html">Cart</a>
        <a class="active" href="signup.html">Sign Up</a>
        <a href="login.html">Log In</a>
        <a href="contactus.html">Contact</a>

        <span id="userEmailDisplay" class="email-display" style="padding: 14px 16px; color: #ffafcc; font-weight: bold; display:none;"></span>
        <a href="#" id="logoutBtn" style="display:none;">Log Out</a>
    </div>
</div>
    <center>';

if ($stmt->execute()) {
    
    echo '<script>
        // Use a short delay before redirecting to allow the success message to show
        setTimeout(function() {
            window.location.href = "login.html";
        }, 1500); 
    </script>';

    echo '<div class="container" id="login">
            <h3 class="bitcount-grid-double">Success!</h3>
            <p class="epunda-slab-font" style="color:#023e8a; font-weight:bold; text-align:center; font-size: 1.1em;">
                Registration successful! Redirecting...
            </p>
          </div>';
} else {
    $error_message = "Error: Could not register user. " . $stmt->error . " (Code: " . $stmt->errno . ")";
    
    if ($conn->errno == 1062) {
         $error_message = "Error: An account with that email already exists. Please <a href='login.html'>Log In</a>.";
    } 
    
    echo '<div class="container" id="login">
            <h3 class="bitcount-grid-double" style="background-color: #e68e8e !important;">Registration Failed</h3>
            <p class="epunda-slab-font" style="color:red; text-align:center; font-size: 1.1em;">
                ' . $error_message . '
            </p>
            <div class="small-link"><a href="signup.html" style="font-weight:700; text-decoration:underline;">Try Again</a></div>
          </div>';
}

$stmt->close();

echo '</center></body></html>';
$conn->close();
?>