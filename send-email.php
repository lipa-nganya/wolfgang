<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// SMTP Configuration - Update with your LiquorOS (dial a drink) SMTP settings
// Replace these values with your actual SMTP credentials
$smtp_host = 'smtp.gmail.com'; // e.g., smtp.gmail.com, smtp.mailtrap.io, or your custom SMTP
$smtp_port = 587; // Usually 587 for TLS or 465 for SSL
$smtp_username = 'your-email@gmail.com'; // Your SMTP username/email
$smtp_password = 'your-app-password'; // Your SMTP password or App Password
$smtp_from_email = 'your-email@gmail.com'; // Sender email address
$smtp_from_name = 'Wolfgang Contact Form';
$smtp_encryption = 'tls'; // 'tls' or 'ssl'

// Recipient email
$to_email = 'wolf79234@gmail.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$company = isset($_POST['company']) ? trim($_POST['company']) : '';
$topic = isset($_POST['topic']) ? trim($_POST['topic']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$recaptcha = isset($_POST['recaptcha']) ? trim($_POST['recaptcha']) : '';

// Validate required fields
if (empty($name) || empty($company) || empty($topic) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

// Verify reCAPTCHA (uncomment and add your secret key)
// $recaptcha_secret = 'YOUR_RECAPTCHA_SECRET_KEY';
// $recaptcha_verify = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret={$recaptcha_secret}&response={$recaptcha}");
// $recaptcha_result = json_decode($recaptcha_verify);
// if (!$recaptcha_result->success) {
//     http_response_code(400);
//     echo json_encode(['error' => 'reCAPTCHA verification failed']);
//     exit;
// }

// Email subject
$subject = "New Contact Form Submission - " . $topic;

// Email body (HTML format)
$email_body_html = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #A22C29; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #A22C29; }
        .message-box { background-color: white; padding: 15px; border-left: 4px solid #A22C29; margin-top: 10px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <span class='label'>Name:</span> {$name}
            </div>
            <div class='field'>
                <span class='label'>Company:</span> {$company}
            </div>
            <div class='field'>
                <span class='label'>Topic:</span> {$topic}
            </div>
            <div class='field'>
                <span class='label'>Message:</span>
                <div class='message-box'>" . nl2br(htmlspecialchars($message)) . "</div>
            </div>
        </div>
    </div>
</body>
</html>
";

// Plain text version
$email_body_text = "New contact form submission from Wolfgang website:\n\n";
$email_body_text .= "Name: " . $name . "\n";
$email_body_text .= "Company: " . $company . "\n";
$email_body_text .= "Topic: " . $topic . "\n";
$email_body_text .= "Message:\n" . $message . "\n";

// Use PHPMailer if available, otherwise use basic mail() function
// Check if PHPMailer is available (you'll need to install it via Composer)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host = $smtp_host;
        $mail->SMTPAuth = true;
        $mail->Username = $smtp_username;
        $mail->Password = $smtp_password;
        $mail->SMTPSecure = $smtp_encryption;
        $mail->Port = $smtp_port;
        
        // Sender and recipient
        $mail->setFrom($smtp_from_email, $smtp_from_name);
        $mail->addAddress($to_email);
        $mail->addReplyTo($smtp_from_email, $name);
        
        // Email content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $email_body_html;
        $mail->AltBody = $email_body_text;
        
        $mail->send();
        echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send email: ' . $mail->ErrorInfo]);
    }
} else {
    // Fallback to basic mail() function (may not work with SMTP authentication)
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: {$smtp_from_name} <{$smtp_from_email}>\r\n";
    $headers .= "Reply-To: {$name} <{$smtp_from_email}>\r\n";
    
    if (mail($to_email, $subject, $email_body_html, $headers)) {
        echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send email. Please configure PHPMailer for SMTP support.']);
    }
}
?>

