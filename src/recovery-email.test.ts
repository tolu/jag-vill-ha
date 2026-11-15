import { describe, expect, it } from 'vite-plus/test';
import { isPlaceholderEmail, parseRecoveryEmail, placeholderEmail } from './recovery-email';

describe('placeholder email', () => {
  it('is recognised as a placeholder', () => {
    expect(isPlaceholderEmail(placeholderEmail('anna'))).toBe(true);
    expect(isPlaceholderEmail('anna@exempel.se')).toBe(false);
  });
});

describe('parseRecoveryEmail', () => {
  it('normalizes a real address', () => {
    expect(parseRecoveryEmail('  Anna@Exempel.se ')).toBe('anna@exempel.se');
  });

  it.each(['', 'anna', 'anna@', 'anna@exempel', 'a b@exempel.se'])('rejects "%s"', (input) => {
    expect(parseRecoveryEmail(input)).toBeNull();
  });

  it('rejects the placeholder domain, so nobody can claim to have no email', () => {
    expect(parseRecoveryEmail(placeholderEmail('anna'))).toBeNull();
  });
});
