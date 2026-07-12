import logger from "../../config/log/logger.ts";
import config from "../../config/config.ts";
import { DevLogProvider, NodemailerProvider, SESProvider } from "./providers/email.providers.ts";
import { renderTemplate } from "./templates/index.ts";
import type { EmailProvider } from "./providers/email.providers.ts";
import type {
  EmailTemplateName,
  EmailTemplateData,
  SendTemplateEmailOptions
} from "./templates/index.ts";

// The Factory: Decides which provider to use based on config
const getEmailProvider = (): EmailProvider => {
  // If in dev mode, just log emails to the console
  if (config.app.env === "development") {
    return new DevLogProvider();
  }

  // Check which provider is configured in your .env (e.g., EMAIL_PROVIDER=ses)
  switch (config.email.provider) {
    case "ses":
      return new SESProvider();
    case "resend":
    // return new ResendProvider();
    case "smtp":
    default:
      if (!config.email.host || !config.email.user) {
        logger.warn("SMTP config missing, falling back to DevLogProvider");
        return new DevLogProvider();
      }
      return new NodemailerProvider();
  }
};

// Instantiate the provider once
const activeProvider = getEmailProvider();

// 2. Your original functions, now powered by the active provider
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  await activeProvider.send({ to, subject, text, html });
};

export const sendTemplateEmail = async ({
  to,
  template,
  variables,
}: SendTemplateEmailOptions) => {
  const message = renderTemplate(template, variables);

  await activeProvider.send({
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
};

export const sendCustomEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  await sendEmail(to, subject, text, html);
};