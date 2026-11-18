import { describe, expect, it } from 'vite-plus/test';
import { toUsername, toUsernameWhileTyping } from '../public/js/username.js';
import { normalizeUsername } from './username';

describe('toUsername', () => {
  it.each(['Görel', 'Åsa Öberg', ' Mamma  Lundin ', 'André', 'Søren Næss', 'anna - karin', '-anna-', 'tobias.lundin', ''])(
    'agrees with the server on "%s"',
    (typed) => {
      expect(toUsername(typed)).toBe(normalizeUsername(typed));
    },
  );
});

describe('toUsernameWhileTyping', () => {
  it('keeps the hyphen she is in the middle of typing', () => {
    expect(toUsernameWhileTyping('Anna ')).toBe('anna-');
    expect(toUsernameWhileTyping('anna-')).toBe('anna-');
    expect(toUsernameWhileTyping('anna- ')).toBe('anna-');
  });

  it('does not start with a hyphen', () => {
    expect(toUsernameWhileTyping(' ')).toBe('');
  });

  it('leaves a finished address alone', () => {
    expect(toUsernameWhileTyping('anna-karin')).toBe('anna-karin');
  });
});
