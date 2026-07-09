import config from "../../../config/config.ts";
import type { EmailTemplateData } from "./index.ts";

const passwordReset = (variables: Record<string, string> = {}): EmailTemplateData => {
  const appName = variables.appName || config.app.name;
  return {
    subject: "Password reset request",
    text: `Hello,\n\nWe received a request to reset your password for ${appName}. Use the link below to proceed:\n\n${variables.resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n`,
    html: `<p>Hello,</p><p>We received a request to reset your password for <strong>${appName}</strong>. Use the link below to proceed:</p><p><a href="${variables.resetUrl}">${variables.resetUrl}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
  };
};

export default passwordReset;
