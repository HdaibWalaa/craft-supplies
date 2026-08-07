/**
 * Minimal transactional email abstraction. No email provider is configured
 * for this build (no SendGrid/Postmark/Resend account was supplied), so
 * this logs to the server console in place of sending. Swap the body of
 * this function for a real provider call once an API key is available —
 * every call site in the app stays the same.
 */
export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  console.log(
    `\n===== [DEV EMAIL] =====\nTo: ${to}\nSubject: ${subject}\n\n${text}\n========================\n`
  );
  return { sent: true, provider: "console" as const };
}
