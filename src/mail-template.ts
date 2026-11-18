// The two mails this app sends, as subject, plain text and HTML. Nothing here
// touches a binding, so it can be tested: src/recovery-mail.ts does the sending.
//
// Mail programs are not browsers. What they have in common is old: tables for
// layout, styles written on each element, colours as hex. The markup follows
// what react.email renders, without taking the package in for two mails.
// Nothing is fetched from anywhere: no pictures, no fonts, no tracking.

// The app's colours (src/styles.css) as hex: mail programs do not read oklch.
const LIGHT = { bg: '#F9F5EC', ink: '#261D16', inkSoft: '#665B53', line: '#DCD7CD', accent: '#225A31', onAccent: '#FFFFFF' };
const DARK = { bg: '#181611', ink: '#EBE7E0', inkSoft: '#A7A49E', line: '#3A3832', accent: '#82CB92', onAccent: '#101911' };

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";

export function escapeHtml(text: string) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

type Mail = {
  subject: string;
  /** Shown after the subject in the inbox list, and nowhere in the mail itself. */
  preview: string;
  heading: string;
  body: string;
  button?: { label: string; url: string };
  /** A quieter line under the button. */
  note?: string;
  footer: string;
};

// Mail programs fill the inbox preview with whatever text comes next. These
// invisible characters push the mail's own text out of it.
const PREVIEW_PADDING = ' ‌​‍‎‏﻿'.repeat(20);

function html(mail: Mail) {
  const text = (size: number, line: number, color: string, klass: string, margin: string, content: string) =>
    `<p class="${klass}" style="margin:${margin};font-family:${SANS};font-size:${size}px;line-height:${line}px;color:${color};">${content}</p>`;

  // The cell carries the colour and, for Outlook on Windows, the padding: it
  // only pads table cells. Everywhere else the link is padded, so the whole
  // button can be pressed.
  const button = mail.button
    ? `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
<tr><td class="button" align="center" bgcolor="${LIGHT.accent}" style="background-color:${LIGHT.accent};border-radius:8px;mso-padding-alt:14px 20px;">
<a class="button-label" href="${escapeHtml(mail.button.url)}" target="_blank" style="display:block;padding:14px 20px;font-family:${SANS};font-size:16px;line-height:20px;font-weight:600;color:${LIGHT.onAccent};text-decoration:none;mso-padding-alt:0;">${escapeHtml(mail.button.label)}</a>
</td></tr>
</table>`
    : '';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="sv" dir="ltr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(mail.subject)}</title>
<style>
:root { color-scheme: light dark; }
@media (prefers-color-scheme: dark) {
  .page { background-color: ${DARK.bg} !important; }
  .ink { color: ${DARK.ink} !important; }
  .soft { color: ${DARK.inkSoft} !important; }
  .rule { border-top-color: ${DARK.line} !important; }
  .button { background-color: ${DARK.accent} !important; }
  .button-label { color: ${DARK.onAccent} !important; }
}
</style>
</head>
<body class="page" style="margin:0;padding:0;background-color:${LIGHT.bg};">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">${escapeHtml(mail.preview)}${PREVIEW_PADDING}</div>
<table class="page" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${LIGHT.bg}" style="background-color:${LIGHT.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:440px;">
<tr><td align="left">
<p class="ink" style="margin:0 0 28px;font-family:${SERIF};font-size:18px;line-height:24px;font-weight:500;color:${LIGHT.ink};">jagvillha</p>
<h1 class="ink" style="margin:0 0 12px;font-family:${SERIF};font-size:28px;line-height:34px;font-weight:500;color:${LIGHT.ink};">${escapeHtml(mail.heading)}</h1>
${text(16, 24, LIGHT.ink, 'ink', '0 0 24px', escapeHtml(mail.body))}
${button}
${mail.note ? text(15, 22, LIGHT.inkSoft, 'soft', '0 0 24px', escapeHtml(mail.note)) : ''}
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
<tr><td class="rule" style="border-top:1px solid ${LIGHT.line};padding-top:16px;">
${text(15, 22, LIGHT.inkSoft, 'soft', '0', escapeHtml(mail.footer))}
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** The same mail for a program that shows no HTML: the link is written out. */
function plain(mail: Mail) {
  return [mail.heading, mail.body, mail.button?.url, mail.note, mail.footer].filter(Boolean).join('\n\n');
}

const compose = (mail: Mail) => ({ subject: mail.subject, text: plain(mail), html: html(mail) });

/** The one-time link that logs her in when she cannot get in. */
export function recoveryMail(url: string) {
  return compose({
    subject: 'Logga in på din önskelista (jagvillha.fyi)',
    preview: 'Länken gäller i en timme och bara en gång.',
    heading: 'Här är din länk',
    body: 'Öppna den på telefonen eller datorn du vill använda.',
    button: { label: 'Logga in', url },
    note: 'Länken gäller i en timme och bara en gång.',
    footer: 'Bad du inte om den? Strunta i mejlet.',
  });
}

/**
 * Sent when an address is added. It does not say which list: a mistyped
 * address is someone else's, and they could ask for a link to get in.
 */
export function confirmationMail() {
  return compose({
    subject: 'Din e-post är sparad (jagvillha.fyi)',
    preview: 'Den används bara för att mejla dig en länk om du inte kan logga in.',
    heading: 'Din e-post är sparad',
    body: 'Den här adressen hör nu till en önskelista på jagvillha.fyi. Den används bara för att mejla dig en länk om du inte kan logga in.',
    footer: 'Var det inte du som lade till den? Strunta i mejlet.',
  });
}
