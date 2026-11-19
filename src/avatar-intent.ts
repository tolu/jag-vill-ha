/**
 * What the account page's form sends as `intent` for the owner's picture, and
 * what its server looks for. Anything else falls through to the e-mail form,
 * where an empty field removes the address.
 */
export const AVATAR_INTENT = 'avatar';
