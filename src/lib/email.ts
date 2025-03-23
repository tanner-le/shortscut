import nodemailer from 'nodemailer';

// Configure nodemailer transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

// Send invitation email
export async function sendInvitationEmail(email: string, name: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/register/complete?token=${token}`;
  
  // Create email content with HTML
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@shortscut.com',
    to: email,
    subject: 'Your Shortscut Account Invitation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Shortscut</h2>
        <p>Hello ${name},</p>
        <p>You've been invited to join Shortscut. Please click the button below to complete your registration:</p>
        <div style="margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Complete Registration
          </a>
        </div>
        <p>This invitation link will expire in 7 days.</p>
        <p>If you didn't request this invitation, you can safely ignore this email.</p>
        <p>Thanks,<br>The Shortscut Team</p>
      </div>
    `,
    text: `
      Welcome to Shortscut
      
      Hello ${name},
      
      You've been invited to join Shortscut. Please visit the following link to complete your registration:
      
      ${inviteUrl}
      
      This invitation link will expire in 7 days.
      
      If you didn't request this invitation, you can safely ignore this email.
      
      Thanks,
      The Shortscut Team
    `,
  };

  // Check if we're in development mode - log instead of sending
  if (process.env.NODE_ENV === 'development' && process.env.SEND_EMAILS !== 'true') {
    console.log('=== DEVELOPMENT MODE: Email not sent ===');
    console.log('To:', email);
    console.log('Subject:', mailOptions.subject);
    console.log('Invite URL:', inviteUrl);
    return;
  }

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send invitation email');
  }
} 