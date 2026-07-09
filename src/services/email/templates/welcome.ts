import config from "../../../config/config.ts";
import type { EmailTemplateData } from "./index.ts";

const welcome = (variables: Record<string, string> = {}): EmailTemplateData => {
  const appName = variables.appName || config.app.name;
  return {
    subject: `Welcome to ${appName}`,
    text: `Hello ${variables.name || "there"},\n\nWelcome to ${appName}! We're happy to have you on board.\n`,
    html: `<p>Hello ${variables.name || "there"},</p><p>Welcome to <strong>${appName}</strong>! We're happy to have you on board.</p>`,
  };
};

export default welcome;
