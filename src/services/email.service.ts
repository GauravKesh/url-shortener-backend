import nodemailer from "nodemailer";
import config from "../config/config.ts";
import logger from "../config/log/logger.ts";
import { renderTemplate } from "./email/templates/index.ts";
import type {
  EmailTemplateName,
  EmailTemplateData,
  SendTemplateEmailOptions,
} from "./email/templates/index.ts";

const createTransporter = () =>
  nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });


const canSendEmail = () => {
  return (
    config.email.host &&
    config.email.user &&
    config.email.pass &&
    config.email.from
  );
};

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  if (!canSendEmail()) {
    logger.warn(`Email config missing, skipping send to ${to}`);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html: html ?? text.replace(/\n/g, "<br />"),
  });
};

export const sendTemplateEmail = async ({
  to,
  template,
  variables,
}: SendTemplateEmailOptions) => {
  const message = renderTemplate(template, variables);

  if (config.app.env !== "development" && !canSendEmail()) {
    logger.warn("Email configuration missing, skipping template email send");
    return;
  }

  if (config.app.env === "development") {
    logger.info(`Development email preview to ${to}:`, message);
    return;
  }

  await sendEmail(to, message.subject, message.text, message.html);
};

export const sendCustomEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  await sendEmail(to, subject, text, html);
};
