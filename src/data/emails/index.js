// ─────────────────────────────────────────────────────────────────────────────
// Email definitions — barrel file
//
// Each trigger receives: { time, popularity, cash, machines, sentIds }
// sentIds is a Set of IDs already in the player's inbox (used to sequence emails)
//
// To add a new sender: create a new file in this directory, export an array,
// and import + spread it below. Order doesn't matter — emails fire by trigger.
// ─────────────────────────────────────────────────────────────────────────────

import { quillEmails }     from './quill';
import { garyEmails }      from './gary';
import { regEmails }       from './reg';
import { flipperEmails }   from './flipper';
import { crabtreeEmails }  from './crabtree';
import { vossEmails }      from './voss';
import { corporateEmails } from './corporate';

export const EMAIL_DEFS = [
  ...quillEmails,
  ...garyEmails,
  ...regEmails,
  ...flipperEmails,
  ...crabtreeEmails,
  ...vossEmails,
  ...corporateEmails,
];
