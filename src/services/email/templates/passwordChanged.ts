import config from "../../../config/config.ts";
import type { EmailTemplateData } from "./index.ts";

const passwordChanged = (variables: Record<string, string> = {}): EmailTemplateData => {
  const appName = variables.appName || config.app.name;
  return {
    subject: "Your password has been changed",
    text: `Hello,\n\nYour ${appName} password was successfully changed. If you did not perform this action, please contact support immediately.\n`,
    html: `<p>Hello,</p><p>Your <strong>${appName}</strong> password was successfully changed. If you did not perform this action, please contact support immediately.</p>`,
  };
};

export default passwordChanged;
