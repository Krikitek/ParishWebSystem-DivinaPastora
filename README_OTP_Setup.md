# OTP System Setup Guide

This guide explains how to set up the OTP (One-Time Password) system for the Chronos Parish Web System.

## Features Implemented

1. **Account Creation with OTP Verification**
   - Email and mobile number validation for duplicates
   - Choice between email or SMS OTP delivery
   - Individual input boxes for 6-digit OTP entry
   - Real OTP sending via email and SMS services

2. **Password Reset with OTP Verification**
   - Individual input boxes for 6-digit OTP entry
   - Real OTP sending via email and SMS services
   - Integration with existing password reset flow

3. **Enhanced User Experience**
   - Modern modal dialogs for OTP selection and entry
   - Individual digit input boxes with auto-focus
   - Copy-paste support for OTP codes
   - Timer countdown for OTP expiration
   - Resend functionality

## Database Setup

1. **Create the OTP Table**
   Run the SQL script in `createOTPTable.sql`:
   ```sql
   -- This creates the OTPTable for storing verification codes
   ```

2. **Ensure UserAccountTable exists**
   The system expects a UserAccountTable with these columns:
   - userID (Primary Key)
   - firstName
   - lastName
   - email (Unique)
   - phoneNumber
   - password
   - role
   - address
   - accountStatus
   - accountDateCreated

## Email Configuration

The system uses PHP's built-in `mail()` function. For production use:

1. **Configure PHP mail settings** in `php.ini`:
   ```ini
   [mail function]
   SMTP = your-smtp-server.com
   smtp_port = 587
   sendmail_from = noreply@yourdomain.com
   ```

2. **Alternative: Use PHPMailer** (recommended for production)
   - Install PHPMailer via Composer
   - Update `sendOTP.php` to use PHPMailer instead of `mail()`
   - Configure SMTP settings for your email provider

## SMS Configuration

The system includes placeholder code for SMS sending via Semaphore API (Philippines).

### To enable SMS functionality:

1. **Sign up for Semaphore SMS service** at https://semaphore.co/
2. **Get your API key** from the dashboard
3. **Update `sendOTP.php`**:
   ```php
   // Replace this line:
   $apiKey = 'YOUR_SEMAPHORE_API_KEY';
   // With your actual API key:
   $apiKey = 'your-actual-api-key-here';
   ```

### Alternative SMS Providers:

You can also use other SMS providers like:
- **Twilio**: Global SMS service
- **Nexmo/Vonage**: Global SMS service
- **Infobip**: Global SMS service

Update the `sendSMSOTP()` function in `sendOTP.php` with your chosen provider's API.

## File Structure

```
Parish Web System/
├── index.html              # Main login/signup page with OTP modals
├── auth.js                 # Enhanced JavaScript with OTP functionality
├── createAccount.php       # Account creation with validation
├── checkExistingUser.php   # Validates email/phone uniqueness
├── sendOTP.php            # Sends OTP via email/SMS
├── verifyOTP.php          # Verifies OTP codes
├── forgotPassword.php     # Password reset user validation
├── resetPassword.php      # Password reset functionality
├── createOTPTable.sql     # Database table creation script
└── README_OTP_Setup.md    # This setup guide
```

## Security Considerations

1. **OTP Expiration**: OTPs expire after 5 minutes
2. **One-time Use**: OTPs are marked as used after verification
3. **Rate Limiting**: Consider implementing rate limiting for OTP requests
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: All inputs are validated on both client and server side

## Testing

1. **Email Testing**: Use a test email service like Mailtrap for development
2. **SMS Testing**: Most SMS providers offer test numbers/sandbox modes
3. **Database Testing**: Ensure the OTPTable is created and accessible

## Production Deployment

1. **Update API Keys**: Replace all placeholder API keys with real ones
2. **Configure Email**: Set up proper SMTP configuration
3. **Enable SMS**: Configure your chosen SMS provider
4. **Database**: Ensure the OTPTable is created in production database
5. **Security**: Enable HTTPS and implement additional security measures

## Troubleshooting

### Common Issues:

1. **OTP not received**:
   - Check email/SMS provider configuration
   - Verify API keys are correct
   - Check spam/junk folders for emails

2. **Database errors**:
   - Ensure OTPTable exists
   - Check database connection settings
   - Verify table permissions

3. **JavaScript errors**:
   - Check browser console for errors
   - Ensure all required DOM elements exist
   - Verify fetch API calls are working

### Debug Mode:

For development, you can enable debug mode by:
1. Checking the browser console for JavaScript errors
2. Adding `error_log()` statements in PHP files
3. Temporarily displaying OTP codes in alerts (already implemented for demo)

## Support

For issues or questions about the OTP system implementation, check:
1. Browser developer console for JavaScript errors
2. Server error logs for PHP errors
3. Database logs for SQL errors
