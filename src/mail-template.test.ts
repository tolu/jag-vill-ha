import { describe, expect, it } from 'vite-plus/test';
import { confirmationMail, escapeHtml, recoveryMail } from './mail-template';

const link = 'https://jagvillha.fyi/api/auth/magic-link/verify?token=abc&callbackURL=%2Fkonto%3Faterstalld%3D1';

describe('escapeHtml', () => {
  it('escapes what would end an attribute or start a tag', () => {
    expect(escapeHtml(`a&b<c>"d"`)).toBe('a&amp;b&lt;c&gt;&quot;d&quot;');
  });
});

describe('recoveryMail', () => {
  const mail = recoveryMail(link);

  it('writes the link out in the text version', () => {
    expect(mail.text).toContain(link);
  });

  it('puts the link on the button, escaped', () => {
    expect(mail.html).toContain(`href="${link.replaceAll('&', '&amp;')}"`);
    expect(mail.html).not.toContain('token=abc&callbackURL');
  });

  it('cannot be broken out of by a link with a quote in it', () => {
    expect(recoveryMail('https://jagvillha.fyi/"><script>').html).not.toContain('"><script>');
  });

  it('says how long the link lasts in both versions', () => {
    expect(mail.text).toContain('en timme');
    expect(mail.html).toContain('en timme');
  });
});

describe('confirmationMail', () => {
  const mail = confirmationMail();

  it('has no button and no link', () => {
    expect(mail.html).not.toContain('<a ');
    expect(mail.text).not.toContain('http');
  });

  // A mistyped address belongs to a stranger, who could ask for a login link.
  it('does not say which list the address was added to', () => {
    expect(mail.text).not.toMatch(/jagvillha\.fyi\/\w/);
    expect(mail.html).not.toMatch(/jagvillha\.fyi\/\w/);
  });
});

describe.each([
  ['recovery', recoveryMail(link)],
  ['confirmation', confirmationMail()],
])('the %s mail', (_name, mail) => {
  it('is in Swedish, for screen readers and spam filters alike', () => {
    expect(mail.html).toContain('<html lang="sv"');
  });

  // No ads, tracking or third-party anything: a mail that loads nothing cannot report back.
  it('fetches nothing: no pictures, fonts or stylesheets', () => {
    expect(mail.html).not.toMatch(/<img|<link|url\(|@import|<script/i);
  });

  it('uses only colours a mail program understands', () => {
    expect(mail.html).not.toMatch(/oklch|light-dark|var\(/);
  });

  it('says the same thing in text as in HTML', () => {
    for (const line of mail.text.split('\n\n').filter((part) => !part.startsWith('http'))) {
      expect(mail.html).toContain(escapeHtml(line));
    }
  });
});
