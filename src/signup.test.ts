import { describe, expect, it } from 'vite-plus/test';
import { parseSignup, signupContext } from './signup';

describe('parseSignup', () => {
  it('reads the address and the e-mail back', () => {
    expect(parseSignup(signupContext('gorel', ' Gorel@Example.com '))).toEqual({ username: 'gorel', email: 'gorel@example.com' });
  });

  it('treats an empty e-mail as none', () => {
    expect(parseSignup(signupContext('gorel', '  '))).toEqual({ username: 'gorel', email: null });
  });

  it('flags an e-mail that cannot be one', () => {
    expect(parseSignup(signupContext('gorel', 'gorel@hemma'))).toEqual({ username: 'gorel', email: 'bad' });
  });

  it('survives characters that mean something in a query string', () => {
    expect(parseSignup(signupContext('a&b=c', 'a+b@example.com'))).toEqual({ username: 'a&b=c', email: 'a+b@example.com' });
  });

  it.each([null, undefined, ''])('has no address when nothing was sent: %s', (context) => {
    expect(parseSignup(context)).toEqual({ username: '', email: null });
  });
});
