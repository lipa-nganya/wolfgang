# Netlify Environment Variables

Add these environment variables in your Netlify dashboard:

## Steps to Add Environment Variables in Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add each variable below:

## Required Environment Variables:

### SMTP Configuration (from Dialadrink project)

| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `wolf79234@gmail.com` |
| `SMTP_PASS` | `wnwddpaiqwlfmoww` |
| `SMTP_FROM` | `wolf79234@gmail.com` |
| `SMTP_FROM_NAME` | `Wolfgang Contact Form` |
| `TO_EMAIL` | `wolf79234@gmail.com` |

### Optional Environment Variables:

| Key | Value | Description |
|-----|-------|-------------|
| `RECAPTCHA_SECRET_KEY` | `your-recaptcha-secret` | For server-side reCAPTCHA verification (optional) |

## Quick Copy-Paste:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=wolf79234@gmail.com
SMTP_PASS=wnwddpaiqwlfmoww
SMTP_FROM=wolf79234@gmail.com
SMTP_FROM_NAME=Wolfgang Contact Form
TO_EMAIL=wolf79234@gmail.com
```

## Notes:

- These variables are stored securely in Netlify and are not exposed to the frontend
- The serverless function (`netlify/functions/send-email.js`) reads these values
- Make sure to deploy after adding the environment variables
- The function will be available at `/.netlify/functions/send-email`



