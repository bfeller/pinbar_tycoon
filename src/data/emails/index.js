// ─────────────────────────────────────────────────────────────────────────────
// Email definitions — barrel file
//
// Each trigger receives: { time, popularity, cash, machines, sentIds, completedCourseIds, staff, decisions, franchises, upgrades }
// sentIds is a Set of IDs already in the player's inbox (used to sequence emails)
// completedCourseIds is a Set of course IDs that completed this day (only populated on that day)
// decisions is the full decisions object { flagId: true, ... } (read-only)
//
// To add a new sender: create a new file in this directory, export an array,
// and import + spread it below. Order doesn't matter — emails fire by trigger.
// ─────────────────────────────────────────────────────────────────────────────

import { quillEmails }     from './quill';
import { garyEmails }      from './gary';
import { regEmails }       from './reg';
import { regSpyEmails }    from './reg_spy';
import { flipperEmails }   from './flipper';
import { crabtreeEmails }  from './crabtree';
import { vossEmails }      from './voss';
import { corporateEmails }  from './corporate';
import { universityEmails } from './university';
import { terryEmails }     from './terry';
import { mickEmails }      from './mick';
import { cassEmails }      from './cass';
import { dannyEmails }        from './danny';
import { consoleWaveEmails }  from './console_wave';
import { regMedicalEmails }   from './reg_medical';
import { loyaltyCultEmails }  from './loyaltyCult';

export const EMAIL_DEFS = [
  ...quillEmails,
  ...garyEmails,
  ...regEmails,
  ...regSpyEmails,
  ...flipperEmails,
  ...crabtreeEmails,
  ...vossEmails,
  ...corporateEmails,
  ...universityEmails,
  ...terryEmails,
  ...mickEmails,
  ...cassEmails,
  ...dannyEmails,
  ...consoleWaveEmails,
  ...regMedicalEmails,
  ...loyaltyCultEmails,
];
