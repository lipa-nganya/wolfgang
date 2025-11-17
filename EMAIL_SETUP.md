# Email Setup Instructions

This contact form uses SMTP to send emails to `wolf79234@gmail.com`. Follow these steps to configure it:

## Option 1: Using PHPMailer (Recommended)

1. **Install PHPMailer via Composer:**
   ```bash
   composer require phpmailer/phpmailer
   ```

2. **Update SMTP settings in `send-email.php`:**
   - Open `send-email.php`
   - Update the following variables with your LiquorOS (dial a drink) SMTP settings:
     ```php
     $smtp_host = 'your-smtp-host.com'; // e.g., smtp.gmail.com
     $smtp_port = 587; // Usually 587 for TLS or 465 for SSL
     $smtp_username = 'your-email@example.com';
     $smtp_password = 'your-password';
     $smtp_from_email = 'your-email@example.com';
     $smtp_encryption = 'tls'; // or 'ssl'
     ```

## Option 2: Using Basic PHP mail() Function

If you don't want to use PHPMailer, the script will fall back to PHP's `mail()` function. However, this may not work with SMTP authentication and depends on your server's mail configuration.

## SMTP Settings from LiquorOS

If you have the SMTP settings from LiquorOS (dial a drink), update these values in `send-email.php`:

- **SMTP Host:** The mail server address
- **SMTP Port:** Usually 587 (TLS) or 465 (SSL)
- **SMTP Username:** Your email address or SMTP username
- **SMTP Password:** Your email password or App Password
- **Encryption:** Usually 'tls' or 'ssl'

## Testing

After configuring, test the contact form:
1. Fill out the form on the Contact Us page
2. Complete the reCAPTCHA
3. Submit the form
4. Check `wolf79234@gmail.com` for the email

## Troubleshooting

- **Email not sending:** Check that PHPMailer is installed and SMTP credentials are correct
- **SMTP authentication failed:** Verify your username and password
- **Connection timeout:** Check that the SMTP host and port are correct
- **reCAPTCHA errors:** Uncomment and configure the reCAPTCHA verification section in `send-email.php`

## Security Notes

- Never commit SMTP passwords to version control
- Consider using environment variables for sensitive credentials
- Enable reCAPTCHA verification on the server side (currently commented out)



