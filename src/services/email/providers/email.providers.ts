import nodemailer from "nodemailer";
import config from "../../../config/config.ts";
import logger from "../../../config/log/logger.ts";

//standard payload every provider must accept
export interface SendEmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

//Interface every provider must follow
export interface EmailProvider {
  send(payload: SendEmailPayload): Promise<void>;
}

//Nodemailer Adapter
export class NodemailerProvider implements EmailProvider {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async send({ to, subject, text, html }: SendEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html: html ?? text.replace(/\n/g, "<br />"),
    });
  }
}

// AWS SES Adapter 
export class SESProvider implements EmailProvider {
  async send({ to, subject, text, html }: SendEmailPayload): Promise<void> {
    //use @aws-sdk/client-ses to construct and send the command
    logger.info(`Sending email via AWS SES to ${to}`);
  }
}

// Console Logger Adapter (Great for local dev)
export class DevLogProvider implements EmailProvider {
  async send(payload: SendEmailPayload): Promise<void> {
    logger.info(`[DEV EMAIL SINK] Email to ${payload.to}:`, payload);
  }
}