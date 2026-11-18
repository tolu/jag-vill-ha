import { defineEnv, string } from 'void/env';

export default defineEnv({
  // The user id of the one account that may open /admin. Left unset, nobody may.
  ADMIN_USER_ID: string().optional(),
});
