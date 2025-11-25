const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Email endpoint (matching Netlify function path)
app.post('/.netlify/functions/send-email', async (req, res) => {
  try {
    const { name, company, topic, message, recaptcha } = req.body;

    // Validate required fields
    if (!name || !company || !topic || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || '6LcmJxcsAAAAAGRPhGC86o8zAdcSRkAXyG5OiRi_';
    if (recaptchaSecret && recaptcha) {
      try {
        const recaptchaVerify = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptcha}`
        );
        const recaptchaResult = await recaptchaVerify.json();
        if (!recaptchaResult.success) {
          return res.status(400).json({ error: 'reCAPTCHA verification failed' });
        }
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        // Continue without blocking if verification fails due to network issues
      }
    }

    // Get SMTP settings from environment variables (with Dial a Drink defaults)
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || 'wolf79234@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'wnwddpaiqwlfmoww';
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const toEmail = process.env.TO_EMAIL || 'wolf79234@gmail.com';

    console.log('SMTP Configuration:', {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      from: smtpFrom,
      to: toEmail
    });

    // Create transporter with Dial a Drink SMTP settings
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('SMTP server connection verified');
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return res.status(500).json({
        error: 'SMTP server connection failed',
        details: error.message
      });
    }

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
    console.log('Email details:', {
      from: smtpFrom,
      to: toEmail,
      subject: subject,
      messageId: info.messageId
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
      code: error.code
    });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wolfgang server running at http://localhost:${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/.netlify/functions/send-email`);
});

