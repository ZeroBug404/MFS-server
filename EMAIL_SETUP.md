# Email Notification Setup Guide

## Overview

The AmarCash system now includes comprehensive email notifications for all users. This guide will help you configure email notifications.

## Email Notifications Include

1. **Welcome Email** - Sent when a new user registers
2. **Agent Approval Email** - Sent when an agent account is approved
3. **Transaction Emails** - Sent after every transaction (send money, cash-in, cash-out)
4. **Account Status Change** - Sent when an account is blocked or unblocked
5. **PIN Change Confirmation** - Sent after PIN is successfully changed

## Installation

### 1. Install nodemailer

```bash
# Using npm
npm install nodemailer @types/nodemailer

# Or using yarn
yarn add nodemailer @types/nodemailer
```

### 2. Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=AmarCash
EMAIL_FROM=your-email@gmail.com
```

## Email Provider Setup

### For Gmail

1. **Enable 2-Factor Authentication**

   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create App Password**

   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "AmarCash" as the name
   - Copy the generated 16-character password
   - Use this password as `EMAIL_PASS` in your `.env` file

3. **Configure .env**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   EMAIL_FROM_NAME=AmarCash
   EMAIL_FROM=your.email@gmail.com
   ```

### For Other Email Providers

#### SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-password
```

#### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

## Features

### Automatic Email Triggers

1. **Registration**

   - Triggered when: New user completes registration
   - Recipients: New user
   - Content: Welcome message and account features

2. **Agent Approval**

   - Triggered when: Admin approves an agent account
   - Recipients: Approved agent
   - Content: Approval confirmation and available features

3. **Transactions**

   - Triggered when: Any transaction completes (send money, cash-in, cash-out)
   - Recipients: Both sender and receiver
   - Content: Transaction details, amounts, fees, new balance

4. **Account Status**

   - Triggered when: Admin blocks or unblocks an account
   - Recipients: Affected user
   - Content: Status change notification

5. **PIN Change**
   - Triggered when: User successfully changes their PIN
   - Recipients: User
   - Content: Security notification

### Email Templates

All emails use professional HTML templates with:

- Responsive design
- Brand colors (Primary: #2A5C8A, Secondary: #27AE60)
- Clear call-to-actions
- Security warnings where applicable
- Professional footer

## Testing

### Test Email Configuration

You can test your email configuration by registering a new user or performing a test transaction.

### Development Mode

For development, you can use services like:

- [Mailtrap](https://mailtrap.io/) - Email testing service
- [Ethereal Email](https://ethereal.email/) - Fake SMTP service

Example configuration for Ethereal:

```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ethereal-user
EMAIL_PASS=your-ethereal-password
```

## Error Handling

Email sending is non-blocking. If an email fails to send:

- The operation (registration, transaction, etc.) will still complete successfully
- An error will be logged to the console
- The user will not be notified of the email failure

This ensures that email service issues don't affect core functionality.

## Troubleshooting

### Emails Not Sending

1. **Check environment variables** - Ensure all EMAIL\_\* variables are set correctly
2. **Verify credentials** - Test your email credentials separately
3. **Check firewall** - Ensure outbound SMTP connections are allowed
4. **Review logs** - Check console for email error messages

### Gmail-Specific Issues

1. **"Username and Password not accepted"**

   - Make sure you're using an App Password, not your regular Gmail password
   - Verify 2-Step Verification is enabled

2. **"Daily sending quota exceeded"**
   - Gmail free accounts have a daily sending limit (500 emails/day)
   - Consider using SendGrid or another service for production

### Common Errors

- **"Connection timeout"** - Check firewall and PORT settings
- **"Invalid login"** - Verify EMAIL_USER and EMAIL_PASS
- **"Self-signed certificate"** - Set EMAIL_SECURE to false or use port 587

## Security Best Practices

1. **Never commit .env files** - Add `.env` to `.gitignore`
2. **Use app-specific passwords** - Don't use your main email password
3. **Rotate credentials regularly** - Change email passwords periodically
4. **Use environment-specific configs** - Different settings for dev/staging/production
5. **Monitor email logs** - Watch for suspicious activity

## Production Recommendations

For production environments, consider using:

1. **SendGrid** - Reliable with good free tier (100 emails/day)
2. **Mailgun** - Good for transactional emails
3. **Amazon SES** - Cost-effective for high volume
4. **Postmark** - Great deliverability rates

These services offer:

- Better deliverability rates
- Analytics and tracking
- Higher sending limits
- Better spam score
- Professional support

## Support

If you encounter issues with email configuration:

1. Check this documentation
2. Review error logs
3. Test with a different email provider
4. Verify all environment variables are set correctly

## File Structure

```
MFS-server/
├── src/
│   ├── services/
│   │   └── email.service.ts      # Email service implementation
│   ├── config/
│   │   └── index.ts               # Email configuration
│   └── app/
│       └── modules/
│           ├── auth/
│           │   └── auth.service.ts      # Welcome emails
│           ├── user/
│           │   └── user.service.ts      # Account & PIN emails
│           └── transaction/
│               └── transaction.service.ts  # Transaction emails
└── .env                           # Email credentials (not in repo)
```

## Next Steps

After configuring email:

1. Restart your development server
2. Register a test user to verify welcome email
3. Perform a test transaction to verify transaction emails
4. Monitor console logs for any email errors
