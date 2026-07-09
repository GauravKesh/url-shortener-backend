import type { EmailTemplateData } from "./index.ts";

const generic = (variables: Record<string, string> = {}): EmailTemplateData => {
  const appName = variables.appName || "App";
  return {
    subject: variables.subject || `${appName} notification`,
    text: variables.message || "You have a new notification.",
    html: `<p>${variables.message || "You have a new notification."}</p>`,
  };
};

export default generic;
