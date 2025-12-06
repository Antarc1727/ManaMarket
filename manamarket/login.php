<?php
// removed session_start()
ini_set('display_errors', 1);
error_reporting(E_ALL);

// logging in
$host = "localhost";
$user = "root"; 
$pass = ""; 
$db   = "manamarket";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    $error_message = "Please enter both email and password.";
} else {
    $sql = "SELECT email, password FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            if (password_verify($password, $user['password'])) {
                $email_safe = htmlspecialchars($user['email'], ENT_QUOTES, 'UTF-8');
                
                echo '<script>
                        // Save the email to client-side storage
                        localStorage.setItem("loggedInUserEmail", "' . $email_safe . '");
                        // Redirect to home page
                        window.location.href = "index.html";
                      </script>';
                $stmt->close();
                $conn->close();
                exit;

            } else {
                $error_message = "Incorrect password.";
            }
        } else {
            $error_message = "No account found with that email.";
        }
        $stmt->close();
    } else {
        $error_message = "Database query preparation failed: " . $conn->error;
    }
}

$conn->close();

echo '<!DOCTYPE html><html><head><title>Login Failed</title><link rel="stylesheet" href="style.css"></head><body>';

echo '<div class="topnav">
        <a href="index.html">Home</a>
        <a href="store.html">Store</a>
        <a href="signup.html">Sign Up</a>
        <a class="active" href="login.html">Log In</a>
        <a href="contactus.html">Contact</a>
        <span id="userEmailDisplay" class="email-display" style="float: right; padding: 14px 16px; color: #ffafcc; font-weight: bold; display:none;"></span>
        <a href="#" id="logoutBtn" style="float: right; display:none;">Log Out</a>
      </div>
      <center>';

echo "<div class='container' id='login'>
        <h3 class='bitcount-grid-double' style='color: red;'>Login Failed</h3>
        <p class='epunda-slab-font' style='color:red; text-align:center; font-size: 1.1em;'>
            Error: $error_message
        </p>
        <div class='small-link'><a href=\"login.html\" style=\"font-weight:700; text-decoration:underline;\">Try Again</a> or <a href=\"signup.html\" style=\"font-weight:700; text-decoration:underline;\">Sign Up</a></div>
      </div>";

echo '</center></body></html>';
?>