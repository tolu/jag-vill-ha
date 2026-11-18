// The address a typed name becomes. Mirrors normalizeUsername in
// src/username.ts, which has the last word on the server;
// src/username-client.test.js keeps the two in step.
export function toUsername(input) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replaceAll('ø', 'o')
    .replaceAll('æ', 'ae')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The same while typing: a space or hyphen just typed stays, as a hyphen. */
export function toUsernameWhileTyping(input) {
  const username = toUsername(input);
  return username && /[\s-]$/.test(input) ? `${username}-` : username;
}
