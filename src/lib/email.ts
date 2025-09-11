import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  email: string;
  token: string;
  organizationName: string;
  role: string;
}

export async function sendInvitationEmail({
  email,
  token,
  organizationName,
  role,
}: SendInvitationEmailParams) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/accept?token=${token}`;

  try {
    await resend.emails.send({
      from: "Thrive Send <noreply@thrivesend.com>",
      to: email,
      subject: `You've been invited to join ${organizationName}`,
      html: `
        <div>
          <h1>You've been invited to join ${organizationName}</h1>
          <p>You have been invited to join ${organizationName} as a ${role.toLowerCase()}.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${acceptUrl}" style="
            display: inline-block;
            background-color: #000;
            color: #fff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 16px 0;
          ">
            Accept Invitation
          </a>
          <p>If you did not expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
} 