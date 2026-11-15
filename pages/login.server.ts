import { defineHandler, defineHead } from 'void';
import { getUser } from 'void/auth';

export const prerender = false;

export const loader = defineHandler((c) => {
  if (getUser()) return c.redirect('/konto');
  return {};
});

export const head = defineHead(() => ({ title: 'Logga in – Jag vill ha' }));
