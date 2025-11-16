const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const formData = JSON.parse(event.body);
    const { name, company, topic, message, recaptcha } = formData;

    // Validate required fields
    if (!name || !company || !topic || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields are required' })
      };
    }

    // Verify reCAPTCHA (optional - uncomment and add your secret key)
    // const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    // if (recaptchaSecret) {
    //   const recaptchaVerify = await fetch(
    //     `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptcha}`
    //   );
    //   const recaptchaResult = await recaptchaVerify.json();
    //   if (!recaptchaResult.success) {
    //     return {
    //       statusCode: 400,
    //       body: JSON.stringify({ error: 'reCAPTCHA verification failed' })
    //     };
    //   }
    // }

    // Get SMTP settings from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const toEmail = process.env.TO_EMAIL || 'wolf79234@gmail.com';

    // Validate SMTP configuration
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.error('SMTP configuration missing');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Email service not configured' })
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // Email subject
    const subject = `New Contact Form Submission - ${topic}`;

    // HTML email body
    const htmlBody = `
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
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span> ${name}
            </div>
            <div class="field">
              <span class="label">Company:</span> ${company}
            </div>
            <div class="field">
              <span class="label">Topic:</span> ${topic}
            </div>
            <div class="field">
              <span class="label">Message:</span>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textBody = `New contact form submission from Wolfgang website:\n\nName: ${name}\nCompany: ${company}\nTopic: ${topic}\nMessage:\n${message}`;

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Wolfgang Contact Form'}" <${smtpFrom}>`,
      to: toEmail,
      replyTo: smtpFrom,
      subject: subject,
      html: htmlBody,
      text: textBody
    });

    console.log('Email sent successfully:', info.messageId);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: info.messageId
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      })
    };
  }
};

