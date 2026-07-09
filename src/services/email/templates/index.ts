export type EmailTemplateName =
  | "passwordReset"
  | "welcome"
  | "passwordChanged"
  | "generic";

export interface EmailTemplateData {
  subject: string;
  text: string;
  html: string;
}

export type TemplateRenderer = (
  variables?: Record<string, string>
) => EmailTemplateData;

import passwordReset from "./passwordReset.ts";
import welcome from "./welcome.ts";
import passwordChanged from "./passwordChanged.ts";
import generic from "./generic.ts";

const templates: Record<EmailTemplateName, TemplateRenderer> = {
  passwordReset,
  welcome,
  passwordChanged,
  generic,
};
export interface SendTemplateEmailOptions {
  to: string;
  template: EmailTemplateName;
  variables?: Record<string, string>;
}

export function renderTemplate(
  templateName: EmailTemplateName,
  variables: Record<string, string> = {}
): EmailTemplateData {
  const renderer = templates[templateName];
  if (!renderer) return templates.generic(variables);
  return renderer(variables);
}

export const templatesMap = templates;
