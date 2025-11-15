import { Resend } from 'resend';

const resend = new Resend(process.env.EMAILAPI);

/**
 * Generates a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends OTP email to the user
 */
export async function sendOTPEmail(email: string, otp: string, name: string): Promise<boolean> {
  try {
    console.log('Attempting to send OTP email to:', email);
    console.log('Resend API Key configured:', !!process.env.EMAILAPI);

    const fromDomain = process.env.EMAIL_FROM_DOMAIN || 'spacesolutionsinternational.com';
    const fromEmail = `Hostel Management System <noreply@${fromDomain}>`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Verify Your Email - Hostel Management System',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .otp-box {
                background: white;
                border: 2px dashed #667eea;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #667eea;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                <p>Thank you for registering with the Hostel Management System. To complete your registration, please use the following One-Time Password (OTP):</p>

                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>

                <p><strong>Important:</strong></p>
                <ul>
                  <li>This OTP is valid for <strong>10 minutes</strong></li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>

                <p>Best regards,<br>Hostel Management Team</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API Error:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('OTP email sent successfully. Message ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Exception while sending OTP email:', error);
    return false;
  }
}

/**
 * Validates OTP format (6 digits)
 */
export function validateOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Checks if OTP has expired (10 minutes expiry)
 */
export function isOTPExpired(createdAt: string): boolean {
  const OTP_EXPIRY_MINUTES = 10;
  const otpCreatedTime = new Date(createdAt).getTime();
  const currentTime = Date.now();
  const diffMinutes = (currentTime - otpCreatedTime) / (1000 * 60);

  return diffMinutes > OTP_EXPIRY_MINUTES;
}
