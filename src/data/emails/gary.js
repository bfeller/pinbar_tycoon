import { lin } from './utils';

// ── Gary Kowalski ─────────────────────────────────────────────────────────────
// Gary is the loyal regular. He keeps a log. He emails from the same computer
// for thirty years. His arc runs from cheerful newcomer to quiet witness.

export const garyEmails = [

  {
    id: 'gary_01',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'hello',
    body:
`Hi there.

I just wanted to say I came in last week and thought it was very good. I got 43,000 on the machine near the window. I don't know what it's called but it has a lot of lights, which I think is a positive sign in a machine.

My wife says hi. She has not been in. She says it sounds nice though.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 2 && !sentIds.has('gary_01'),
    choices: null,
  },

  {
    id: 'gary_02',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'update',
    body:
`Hi again.

I came in on Tuesday but you were busy so I didn't interrupt. I got 61,000 on the silver one near the back. I think this might be a record. My neighbour Dave says it isn't, but Dave has never been to your bar so I'm not sure why he has opinions about it.

I have now been 6 times. I am not keeping a log.

(I am keeping a log.)

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 10 && sentIds.has('gary_01') && !sentIds.has('gary_02'),
    choices: null,
  },

  {
    id: 'gary_03',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'RE:',
    body:
`Sorry, I think I replied to myself by mistake. Please ignore the previous email if there was one.

I just wanted to say I have now been 11 times. My wife asked why I have a spreadsheet about a pinball bar and I told her it was for "personal records," which is technically true.

Also — do you do a loyalty card? Please let me know either way.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 22 && sentIds.has('gary_02') && !sentIds.has('gary_03'),
    choices: null,
  },

  {
    id: 'gary_04',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'a small concern (not a complaint)',
    body:
`Hi.

I don't want to cause any trouble and this is definitely not a complaint. It is more of an observation, which is:

The machine with the rocket on it is making a sound. Not a bad sound exactly. Just A Sound. The best way I can describe it in my log is "like a very confident clunk." I looked it up and it might be a solenoid. Or I may have spelled that wrong and it means something else entirely.

Anyway. It is probably fine. I just thought you should know. I'm coming in Thursday.

Gary

P.S. I asked Dave about the sound and he said it's "just how machines are." Dave has never been.

--
Sent from my computer (it is new)`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 36 && sentIds.has('gary_03') && !sentIds.has('gary_04'),
    choices: null,
  },

  {
    id: 'gary_05',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'I walked past that new place',
    body:
`Hi.

I walked past the new bar on Elm Street. The Bumper Zone. I went in for a look because I thought I should know what we're dealing with.

I want you to know I did not play any of their machines. I stood near them. I read the names. I looked at the general situation and then I left. Their carpet is worse than yours. Also the machines were making sounds I can only describe as "medium to concerning."

Anyway. I thought you should know. I am on your side.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ sentIds }) =>
      sentIds.has('reg_01') && sentIds.has('gary_04') && !sentIds.has('gary_05'),
    choices: null,
  },

  {
    id: 'gary_06',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'something strange',
    body:
`Hi.

This is going to sound odd and I want to preface it by saying I am a rational person and Dave agrees with me on this even though Dave has never been.

I was playing the machine near the back — the one I think of as "mine," though I know I don't own it — and for a moment I had the very strong feeling that it was aware of me. Not in a bad way. More like how a dog knows you've had a hard day.

I got 94,000 after that. My best ever.

I don't know what to make of it. Probably nothing. The log entry is quite long.

Gary

--
Sent from my computer (it is new)`,
    trigger: ({ sentIds }) =>
      sentIds.has('flipper_01') && sentIds.has('gary_05') && !sentIds.has('gary_06'),
    choices: null,
  },

  {
    id: 'gary_08',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'a general observation',
    body:
`Hi.

I'm going to be honest with you, which I hope is alright.

I am worried about things. Not the machines specifically. The machines are fine, as far as I can tell. The silver one near the back is making a new sound but I've noted it in the log as "probably intentional."

I mean more generally. There are fewer people in on weeknights. I've noticed this because I come on Tuesdays and I can now get the machine near the window without waiting, which I should be pleased about but am not, because it means fewer people are coming on Tuesdays.

Also The Bumper Zone looked a bit quiet when I walked past. I didn't go in. But I noticed.

I think I just wanted to say that. It seemed important to tell someone.

Gary

--
Sent from my computer (it is the same one)`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2004 && sentIds.has('gary_06') && !sentIds.has('gary_08'),
    choices: null,
  },

  {
    id: 'gary_09',
    from: 'Gary Kowalski',
    address: 'garykowalski77@aol.com',
    subject: 'I heard',
    body:
`Hi.

I heard about The Bumper Zone.

I walked past on Wednesday. The lights were off. There was a sign. I stood there for longer than I needed to, which I think was a form of acknowledgement.

I want you to know that I have never wavered. My attendance record is complete. The log says so.

I still think the machine near the back is aware of me. This has been consistent. If anything, it seems more aware lately. I don't know what to make of that. The log entry is quite long.

Gary

--
Sent from my computer (it is the same one, but slower now)`,
    trigger: ({ sentIds }) =>
      sentIds.has('reg_08') && !sentIds.has('gary_09'),
    choices: null,
  },

];
