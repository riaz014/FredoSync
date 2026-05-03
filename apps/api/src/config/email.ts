import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: any = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = (nodemailer as any).createTransporter({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendInvitationEmail = async (
  to: string,
  workspaceName: string,
  inviteToken: string
) => {
  try {
    const transporter = getTransporter();
    const inviteUrl = `${process.env.CLIENT_URL}/invite/${inviteToken}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `You've been invited to join ${workspaceName} on Fredo Cloud`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited!</h2>
          <p>You've been invited to join <strong>${workspaceName}</strong> on Fredo Cloud.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Accept Invitation
          </a>
          <p style="color: #666; font-size: 14px;">
            Or copy this link: <br/>
            ${inviteUrl}
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            This invitation will expire in 7 days.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending invitation email:', error);
    // Don't throw - email is optional in development
  }
};

export const sendMentionEmail = async (
  to: string,
  fromUser: string,
  content: string,
  link: string
) => {
  try {
    const transporter = getTransporter();
    const fullLink = `${process.env.CLIENT_URL}${link}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `${fromUser} mentioned you on Fredo Cloud`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You were mentioned!</h2>
          <p><strong>${fromUser}</strong> mentioned you in a comment:</p>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">${content}</p>
          </div>
          <a href="${fullLink}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Comment
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending mention email:', error);
    // Don't throw - email is optional in development
  }
};

export default getTransporter;
