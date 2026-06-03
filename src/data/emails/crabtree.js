import { lin } from './utils';

// ── Inspector Bernard Crabtree ────────────────────────────────────────────────
// Environmental Health Officer Grade 2 (later Grade 1, later retired).
// Means well. Has become existentially distracted by pinball as a metaphor.
// Corresponds with the player across five decades without completing a
// satisfactory formal inspection.
//
// Arc flags set via email choices:
//   crabtree_welcomed / crabtree_corresponded          — from crabtree_03
//   crabtree_margaret_known / _told_bernard            — from crabtree_09_margaret
//   crabtree_retirement_visit / _letter                — from crabtree_11_retirement
//   crabtree_window_machine_confirmed / _times_changed — from crabtree_13_final
//
// Arc flags set via decisions (decisions.js):
//   crabtree_inspection_completed / _derailed          — crabtree_third_attempt
//   crabtree_replacement_cooperated / _redirected      — crabtree_replacement_inspection
//   crabtree_distracted                                — danny_big_night (danny arc)

export const crabtreeEmails = [

  // ── Beat 1 — Inspection notice ───────────────────────────────────────────
  {
    id: 'crabtree_01',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'Scheduled Inspection — Action Required',
    body:
`Dear Licensee,

Please be advised that I will be conducting a routine premises inspection in approximately three (3) business days. The inspection will cover general cleanliness, machine safety, and compliance with relevant bylaws.

I ask only that machines are in reasonable working order. I do not require perfection. I simply need to inspect them without experiencing a pronounced sense of unease.

On an unrelated note: I have recently begun keeping a journal. I find it helpful for certain questions. For example — and I raise this purely in passing — if a pinball enters the drain, does it cease to exist from the machine's perspective, or does it transition to a context we cannot observe? I have written approximately four pages on this. I may write more.

I will see you in three business days. Please have the machines switched on.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 2)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 18 && !sentIds.has('crabtree_01'),
    choices: null,
    event: {
      label: 'Inspection Notice',
      severity: 'bad',
      message: 'An environmental health officer will be visiting in three days.',
    },
  },

  // ── Beat 2 — Missed inspection ───────────────────────────────────────────
  {
    id: 'crabtree_02',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'RE: Inspection — Apologies',
    body:
`Dear Licensee,

I owe you an apology. I was unable to attend the inspection on the scheduled date.

I became sidetracked on the way to your premises by a question I am not yet able to fully articulate, but which concerns the relationship between trajectory, inevitability, and the precise angle at which a ball strikes a rubber bumper. I sat in my car for some time. Then I drove home and wrote eleven pages in the journal.

Your premises has been given a provisional "Observed Adequate" rating on the basis that nothing specific has been reported against you. I will reschedule when I am in a better position to conduct the inspection without it raising further questions.

I did drive past. The lights from the machines were visible through the window. It looked warm.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 2)`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('crabtree_01') && !sentIds.has('crabtree_02') && lin(time) >= 25,
    choices: null,
  },

  // ── Beat 3 — Personal question ───────────────────────────────────────────
  {
    id: 'crabtree_03',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'A Question (Not Official)',
    body:
`Dear Licensee,

This is not an official communication. Please disregard the letterhead.

I wanted to ask — and I appreciate this may be an unusual question from a council officer — do your machines ever seem to you to be aware of being played? Not in a supernatural sense. More in the way that a very old building seems aware of being stood in.

I ask because I have been unable to stop thinking about it since March and my wife says I need to "ask someone who actually knows about pinball."

You can of course disregard this entirely. I will not be offended.

Bernard Crabtree
(Environmental Health, but writing this in a personal capacity)`,
    trigger: ({ sentIds, popularity }) =>
      sentIds.has('flipper_01') && sentIds.has('crabtree_02') && !sentIds.has('crabtree_03') && popularity >= 1000,
    choices: [
      { label: 'Invite him in — come and have a look for yourself.', effectId: null, decisionsFlag: 'crabtree_welcomed' },
      { label: 'Write back — happy to correspond about it.', effectId: null, decisionsFlag: 'crabtree_corresponded' },
    ],
  },

  // ── Beat 4a — Second contact (invited in) ────────────────────────────────
  {
    id: 'crabtree_04_welcomed',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'RE: Your Invitation',
    body:
`Dear Licensee,

Thank you for your invitation. I came in on Thursday.

I should clarify that this was not an official visit. I did not bring my official clipboard. I brought a personal notebook.

I sat at the table nearest the window. I ordered a lemonade. I stayed for approximately two hours and watched several people play. I played the machine near the door once myself. I scored 6,200 points. I am aware that this is low.

The inspection is, technically, still outstanding. I have put it in my diary a fourth time. I intend to approach it in the new year with fresh eyes and, I hope, fewer questions.

I wrote twenty-three pages in the notebook while I was there. I have reread them twice. I believe I am getting closer to the question, though I am still not certain what the question is.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 2)
(I used official paper by mistake)`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.crabtree_welcomed && sentIds.has('crabtree_03') &&
      time.year >= 1977 && time.week >= 8 && !sentIds.has('crabtree_04_welcomed'),
    choices: null,
  },

  // ── Beat 4b — Second contact (correspondence path) ───────────────────────
  {
    id: 'crabtree_04_corresponded',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'RE: Further Correspondence',
    body:
`Dear Licensee,

Thank you for your reply. I have been corresponding with several people about this matter and yours was the only response that did not recommend I see a professional.

I want to share something I have been drafting. It is not a formal report. It is more in the mode of the journal, but addressed outward rather than in.

"The ball does not make decisions. This is the most important thing to understand about the ball. It goes where physics sends it. And yet the player, watching it, assigns intention to it. They say it went 'straight for the drain.' They say it 'knew.' The ball is not capable of knowing. The player knows this. The player says it anyway.

I have been thinking about what this means for the player."

I do not have a conclusion yet. But I believe you may have useful data on this question, having watched people play for several years.

The inspection is rescheduled for the twenty-third. I will endeavour to attend.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 2)`,
    trigger: ({ time, sentIds, decisions }) =>
      decisions.crabtree_corresponded && sentIds.has('crabtree_03') &&
      time.year >= 1977 && time.week >= 8 && !sentIds.has('crabtree_04_corresponded'),
    choices: null,
  },

  // ── Beat 4.5 — Gary's note on the inspector's visit ──────────────────────
  // Only fires on the welcomed path, as Gary would only have seen him come in.
  {
    id: 'crabtree_gary_note',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'an observation (the man with the notebook)',
    body: ({ decisions = {} }) => {
      let body =
`Hi.

I want to note something I observed last Thursday and I'm not sure what category it belongs to.

There was a man at the table by the window. He had a notebook, not a phone. He ordered one lemonade and didn't finish it. He watched the machines for a long time without playing.

I recognised him eventually. He came in some months ago with an official clipboard. He seemed different this time — less official, but more focused, if that makes sense. He was thinking about something.`;

      if (decisions.crabtree_distracted) {
        body += `\n\nI also recognised him from Friday's run. He was the one who got drawn into the conversation at the bar while Daniel was playing. I noted this in the log. The two visits seem connected, though I haven't worked out how yet.`;
      }

      body +=
`

At one point he played the machine by the door. I noted his score: 6,200. I didn't say anything. He seemed to already know it was low.

I have put him in the log under "observers." I added a star to the entry. I haven't used that category before. I'm not sure I'll use it again.

Gary

--
Sent from my computer (it is new)`;
      return body;
    },
    trigger: ({ time, sentIds, decisions }) =>
      decisions.crabtree_welcomed && sentIds.has('crabtree_04_welcomed') &&
      time.year >= 1978 && time.week >= 2 && !sentIds.has('crabtree_gary_note'),
    choices: null,
  },

  // ── Beat 6a — Inspection formally completed ───────────────────────────────
  // Fires after the crabtree_third_attempt decision (decisions.js).
  {
    id: 'crabtree_06_formal',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'Official Inspection Report — Reference BC/0044',
    body:
`Dear Licensee,

Please find the summary of your premises inspection, conducted this week.

Overall assessment: Satisfactory.

Areas reviewed:
— General cleanliness: Adequate.
— Machine safety: All machines operational and within reasonable tolerance.
— Bar hygiene: Standard.
— Signage: Compliant.
— Emergency procedures: Visible.

No formal action required.

I want to add something that will not appear in the council's records.

When I examined the machines, I noticed that the wear pattern on the left flipper mechanism of the machine near the back wall was consistent with eighteen to twenty-four months of intensive, high-precision use. I noted this separately, in the journal. It seemed significant in a way that would not survive a council review.

You have run a good premises. This is my formal opinion and also my personal one.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 2)`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.crabtree_inspection_completed &&
      time.year >= 1980 && time.week >= 8 && !sentIds.has('crabtree_06_formal'),
    choices: null,
  },

  // ── Beat 6b — Inspection derailed (again) ────────────────────────────────
  {
    id: 'crabtree_06_informal',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'RE: Thursday',
    body:
`Dear Licensee,

Thank you for the coffee. I want to be transparent with you about what happened.

I did complete most of the inspection. Based on what I saw before our conversation, I am able to file a "Satisfactory" rating in good conscience. The machines are in order. The bar area was clean enough. I checked what I could.

The conversation was, if I'm honest, considerably more useful than the inspection would have been.

You were right about most of it. I still don't think the drain is final. But I've stopped being certain about it, which I understand is progress.

The formal inspection remains, technically, outstanding. I will add it to next year's schedule. I may not get to it.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 2)

P.S. The machine by the door says its own name. I looked it up. I've been thinking about that.`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.crabtree_inspection_derailed &&
      time.year >= 1980 && time.week >= 8 && !sentIds.has('crabtree_06_informal'),
    choices: null,
  },

  // ── Beat 7 — Promotion to Grade 1 ────────────────────────────────────────
  {
    id: 'crabtree_07',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'Change of Role — Notification',
    body:
`Dear Licensee,

I am writing to advise you that, as of the first of next month, I will be moving into a supervisory position: Environmental Health Officer Grade 1.

This is good news professionally. It also means, and I want to be honest with you about this because we have been corresponding for several years, that I will no longer be conducting field inspections.

Your premises will be reassigned to a colleague. Her name is Ms. Avril Fenchurch. She is thorough, professional, and has an excellent record. She has not, to my knowledge, kept a journal.

I wanted to let you know before the formal notification arrives. I am aware that we have not resolved the inspection to a satisfactory administrative conclusion — "outstanding" has been in my files for approximately nine years — and I want you to know I consider this a personal failure on the administrative level, though not on any other level.

The lemonade was the right choice, that first evening. I stand by it.

Yours sincerely,
Bernard Crabtree
Environmental Health Officer (Grade 1)
(effective from the first)`,
    trigger: ({ time, sentIds }) =>
      (sentIds.has('crabtree_06_formal') || sentIds.has('crabtree_06_informal')) &&
      time.year >= 1985 && time.week >= 3 && !sentIds.has('crabtree_07'),
    choices: null,
  },

  // ── Beat 8 — Fenchurch's formal report (cooperated path only) ────────────
  {
    id: 'crabtree_08_fenchurch',
    from: 'Ms. A. Fenchurch',
    address: 'a.fenchurch@citycouncil.gov',
    subject: 'Inspection Report — Premises Reference 0044-B',
    body:
`Dear Licensee,

Please find the summary of your premises inspection.

Overall assessment: Satisfactory with three minor recommendations.

Recommendations:
1. Flooring near rear exit — grip tape on step three is worn. Replace within 90 days.
2. Machine signage — one unit lacks a current age-restriction notice. Replace within 30 days.
3. Bar temperature log — three entries missing in Q3. Ensure consistent logging going forward.

No enforcement action required. A follow-up visit will be scheduled for compliance verification within 120 days.

Regards,
Avril Fenchurch
Environmental Health Officer (Grade 2)
City Council Environmental Services`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.crabtree_replacement_cooperated && time.year >= 1986 &&
      time.week >= 4 && !sentIds.has('crabtree_08_fenchurch'),
    choices: null,
  },

  // ── Beat 8b — Bernard's private note after Fenchurch ─────────────────────
  {
    id: 'crabtree_08b',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'I heard from Avril',
    body: ({ decisions = {} }) => {
      let body = `Dear Licensee,

I understand Avril came by.`;

      if (decisions.crabtree_replacement_cooperated) {
        body += ` She mentioned it at the department meeting.

I want to say: I am glad it was her. She is good at her job. Everything she flagged will be legitimate. She does not get distracted.

I've thought about this. I was a better inspector on the technical side. She is a better inspector on the administrative side. It probably evens out. The machines in your premises never really needed what I would formally call an inspection, in any case.`;
      } else if (decisions.crabtree_replacement_redirected) {
        body += ` She said the scheduling was more complicated than expected.

I'm not surprised. I should tell you: she is patient. She'll come back. She is persistent in a way I never quite managed, officially speaking.

I don't take this personally. I want you to know that.`;
      } else {
        body += ` Or she may be coming by soon. I wanted to check in regardless.`;
      }

      body += `

I'm on the fourth volume of the journal now. The question has changed three times since I began. Currently I'm writing about whether attention transforms the thing being watched — whether a machine observed closely becomes different from a machine in an empty room. I don't know if you've considered this. You've been watching your machines for a long time.

I still think about the drain sometimes.

Yours sincerely,
Bernard
(Grade 1 — though I rarely use the title now)`;
      return body;
    },
    trigger: ({ time, sentIds }) =>
      sentIds.has('crabtree_07') && time.year >= 1987 && time.week >= 4 &&
      !sentIds.has('crabtree_08b'),
    choices: null,
  },

  // ── Beat 9 — Margaret writes ──────────────────────────────────────────────
  {
    id: 'crabtree_09_margaret',
    from: 'M. Crabtree',
    address: 'm.crabtree@homemail.co.uk',
    subject: "Bernard's correspondence",
    body:
`Dear Licensee,

I hope you'll forgive the unusual nature of this email. My name is Margaret Crabtree. Bernard is my husband.

I found your address in his journal — which I am technically not supposed to read, though he has never explicitly told me not to, so I prefer to call it "finding."

I wanted to write because I know you've been corresponding with him for some years. He doesn't tell me much about it. He does tell me the conversations have been useful, which from Bernard is significant.

I want you to know that he is a good man. He has been distracted by pinball since 1975 in the way some people are distracted by religion, except it doesn't make him sanctimonious and it has given him better questions.

He'll be starting volume five shortly. I count this as progress.

I hope your machines are well.

Yours,
Margaret Crabtree

P.S. I have never played pinball. I understand it is something one either takes to immediately or does not. I haven't established which category applies to me.`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('crabtree_08b') && time.year >= 1990 && time.week >= 4 &&
      !sentIds.has('crabtree_09_margaret'),
    choices: [
      { label: 'Write back warmly — thank her for getting in touch.', effectId: null, decisionsFlag: 'crabtree_margaret_known' },
      { label: "Write to Bernard — let him know his wife wrote.", effectId: null, decisionsFlag: 'crabtree_margaret_told_bernard' },
    ],
  },

  // ── Beat 10a — Margaret's reply (if player wrote to her) ─────────────────
  {
    id: 'crabtree_10_margaret_reply',
    from: 'M. Crabtree',
    address: 'm.crabtree@homemail.co.uk',
    subject: 'RE: Thank you',
    body:
`Dear Licensee,

Thank you for writing back. I appreciate it.

Bernard will be embarrassed when he finds out I wrote to you, but I think he will be glad I did. I know how these things work with him.

He's just started volume six. He told me last week that he thinks he knows what the question is now. He hasn't told me what it is yet. I have learned not to ask.

Thank you for running the sort of place that keeps him curious. It matters more than you might think.

Yours,
Margaret`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.crabtree_margaret_known && sentIds.has('crabtree_09_margaret') &&
      time.year >= 1991 && !sentIds.has('crabtree_10_margaret_reply'),
    choices: null,
  },

  // ── Beat 10b — Bernard's note (if player told him Margaret wrote) ─────────
  {
    id: 'crabtree_10_bernard_reply',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'RE: Margaret',
    body:
`Dear Licensee,

Thank you for telling me.

I should have expected this. She has always been more direct than I am. I mean that as a genuine compliment — it is one of her best qualities and occasionally a challenge.

I am sorry if the email was unusual. She means well. So do I, for that matter, though I am aware that our correspondence has been somewhat one-sided in terms of professional usefulness. You have given me considerably more than I have given you, from an inspection standpoint.

I'm on volume six.

Yours,
Bernard`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.crabtree_margaret_told_bernard && sentIds.has('crabtree_09_margaret') &&
      time.year >= 1991 && !sentIds.has('crabtree_10_bernard_reply'),
    choices: null,
  },

  // ── Beat 11 — Retirement ──────────────────────────────────────────────────
  {
    id: 'crabtree_11_retirement',
    from: 'B. Crabtree',
    address: 'b.crabtree@citycouncil.gov',
    subject: 'A Change — Retirement',
    body: ({ decisions = {} }) => {
      let body =
`Dear Licensee,

I wanted to give you advance notice: I am retiring at the end of next month.

Forty-one years in Environmental Health. The journal is on volume seven. I have been asking the same question since 1975, which I consider good value for a question.

I want to say something while I still have the context. By my calculation, you have been running this premises for approximately twenty-four years. I have never successfully inspected it in a formal capacity. I have, however, sat in it, corresponded with you about it, been distracted by it, and thought about it at length on three separate stretches of motorway.

I believe this constitutes a form of inspection that would not survive a council audit. I also believe it has been more thorough than the alternative.`;

      if (decisions.crabtree_margaret_known) {
        body += `\n\nMargaret says to tell you she is glad she wrote to you. She has said this several times. I have noted it.`;
      }

      body += `

Margaret is well. She played a machine at a charity event two years ago. She scored 4,800 and described the experience as "clarifying."

I hope we can remain in correspondence.

Yours,
Bernard Crabtree
Environmental Health Officer (Grade 1, retiring effective next month)`;
      return body;
    },
    trigger: ({ time, sentIds }) =>
      sentIds.has('crabtree_08b') && time.year >= 1999 && time.week >= 5 &&
      !sentIds.has('crabtree_11_retirement'),
    choices: [
      { label: 'Invite them both — come for a final evening at the bar.', effectId: null, decisionsFlag: 'crabtree_retirement_visit' },
      { label: 'Write him a proper letter — mark the occasion.', effectId: null, decisionsFlag: 'crabtree_retirement_letter' },
    ],
  },

  // ── Beat 12a — The evening they came in ──────────────────────────────────
  {
    id: 'crabtree_12_visit',
    from: 'B. Crabtree',
    address: 'bernard.crabtree@gmail.com',
    subject: 'RE: Saturday',
    body:
`Dear Licensee,

We came in on Saturday. Margaret wore her good coat.

I want to tell you what happened, in something like the manner of the journal.

Margaret played machine three for forty minutes. Her first three games were poor — she said "I see" after each one, which is how she processes things. On her fourth game she found something and held it and scored 31,400 points. She didn't look surprised. She looked as though she had confirmed a hypothesis.

I played Gorgar once. I scored 11,800. I have been playing for twenty-three years and I have never broken fifteen thousand.

I did not bring the clipboard. I thought about it. I decided not to. I believe the decision was correct.

The machine by the window — the one you had when I first came in — is still there. Margaret played it. She got 9,000. She said "yes, I see" and came back to the table.

Thank you for having us. I intend to come back, as a customer, without notice.

Yours,
Bernard`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.crabtree_retirement_visit && sentIds.has('crabtree_11_retirement') &&
      time.year >= 2000 && time.week >= 2 && !sentIds.has('crabtree_12_visit'),
    choices: null,
  },

  // ── Beat 12b — Retirement letter response ────────────────────────────────
  {
    id: 'crabtree_12_letter',
    from: 'B. Crabtree',
    address: 'bernard.crabtree@gmail.com',
    subject: 'RE: Your letter',
    body:
`Dear Licensee,

Thank you for the letter. I read it three times, which is the number I consider significant.

I want to acknowledge the part about the machines — specifically where you described them as "still alive in the way that old things are." I have written about this question for seven volumes and have not found a better formulation. I've copied it into the journal at the start of volume eight.

Margaret says thank you for remembering to include her. She was surprised. She was pleased. Those two things are not always simultaneous.

I will write again. Retirement is a change of pace, not of direction.

Yours,
Bernard`,
    trigger: ({ time, decisions, sentIds }) =>
      decisions.crabtree_retirement_letter && sentIds.has('crabtree_11_retirement') &&
      time.year >= 2000 && time.week >= 2 && !sentIds.has('crabtree_12_letter'),
    choices: null,
  },

  // ── Beat 13 — The renaissance ─────────────────────────────────────────────
  {
    id: 'crabtree_13_final',
    from: 'B. Crabtree',
    address: 'bernard.crabtree@gmail.com',
    subject: 'Volume eight — a thought',
    body: ({ decisions = {} }) => {
      let body =
`Dear Licensee,

I've been reading about the pinball renaissance. It's been in several publications. People are calling it a revival, which is a word for something that never really went away.

I know you know this. You've been there throughout. I wanted to write because I was curious whether the machines feel different to you now — whether a room full of people who choose to be there, for reasons that have nothing to do with arcade economics, feels different from the rooms you remember.`;

      if (decisions.crabtree_retirement_visit) {
        body += `\n\nI think about Saturday sometimes. Margaret still talks about the fourth game.`;
      }

      body += `

The question in the journal — I found it. I wrote it down in volume eight and read it back and it turned out to be quite simple. I've been asked to explain it to Margaret. I'm choosing my words carefully.

I hope the machine by the window is still there.

Yours,
Bernard`;
      return body;
    },
    trigger: ({ time, sentIds }) =>
      sentIds.has('crabtree_11_retirement') && time.year >= 2012 &&
      !sentIds.has('crabtree_13_final'),
    choices: [
      { label: 'The machine by the window is still there.', effectId: null, decisionsFlag: 'crabtree_window_machine_confirmed' },
      { label: "The machines have changed — but it still feels right.", effectId: null, decisionsFlag: 'crabtree_times_changed' },
    ],
  },

  // ── Beat 14 — The final visit ─────────────────────────────────────────────
  {
    id: 'crabtree_14_last',
    from: 'B. Crabtree',
    address: 'bernard.crabtree@gmail.com',
    subject: '(no subject)',
    body: ({ decisions = {} }) => {
      let body =
`Dear Licensee,

I came in last week. I didn't tell you I was coming.

I sat at the same table. I had a lemonade.`;

      if (decisions.crabtree_window_machine_confirmed) {
        body += ` The machine by the window was there. I played it once. It remembered what it was doing.`;
      } else {
        body += ` The newer machines are very bright. One near the door I played once — I didn't recognise it, but it felt right.`;
      }

      body += `

I scored 14,200. I have never scored that on any machine before. I told Margaret when I got home and she said "finally."

I am on volume nine. The question has become a different question. I think this is correct progress.

Thank you for still being here. I know that is not a small thing.

Yours,
Bernard

P.S. I did not bring a clipboard.`;
      return body;
    },
    trigger: ({ time, sentIds }) =>
      sentIds.has('crabtree_13_final') && time.year >= 2018 &&
      !sentIds.has('crabtree_14_last'),
    choices: null,
  },

];
