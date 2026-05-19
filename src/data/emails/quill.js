import { lin } from './utils';

// ── Dr. Horatio Quill (Temporal Continuity Office) ───────────────────────────
// Quill is the framing device — he explains the premise, tracks the player's
// progress, and delivers the emotional gut-punch in 2019.

export const quillEmails = [

  {
    id: 'quill_01',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'An Explanation (Please Read)',
    body:
`I should begin with an apology.

You are reading this on a Windows 95 personal computer. It is 1975. I understand this is unusual.

My name is Dr. Horatio Quill. I am a Senior Analyst at the Temporal Continuity Office, which is a government department from your future that I am not officially permitted to tell you about. I have bent several regulations by sending you this device. The machine was sourced from a heritage computing archive. In your era it represents technology approximately twenty years ahead of its time. I want to be transparent that in my era it is considered a museum piece and was stored next to a fax machine and something called a Tamagotchi.

The point: I need you to succeed.

I cannot explain the full reason without triggering a disclosure violation that would result in significant paperwork for me and possibly some timeline instability for you. What I can say is that a thriving pinball bar — your pinball bar — matters to the future in ways I am not currently authorised to describe.

Practically speaking: the computer will allow you to buy machines, manage upgrades, and read correspondence. When you are ready to open for the day, press the sun button in the top right corner. You will know when the day is done because the bar will close and you will receive a report.

Others will find ways to contact you through this machine. This is a side effect I did not fully anticipate. Please do not be alarmed.

I am rooting for you more than I am allowed to say.

Dr. H. Quill
Senior Analyst, Temporal Continuity Office
Dept. 7 — Leisure & Culture`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 1 && !sentIds.has('quill_01'),
    choices: null,
  },

  {
    id: 'quill_02',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Good — A Few Things',
    body:
`Good. You have placed a machine.

I have been monitoring your location through the temporal feed — the equipment is quite sophisticated, you would find it remarkable — and I can confirm you are on the right track.

A few things I should have mentioned earlier:

Machines degrade with use. This is unavoidable. You can repair them during the build phase, before you open for the day. You have a limited number of repair points each day, so focus on machines in the worst condition. A machine at zero durability will not accept customers. It becomes, in effect, expensive furniture with lights.

Machine popularity also matters. Some machines draw more customers than others based on how widely they appear in the real world. A machine found in hundreds of locations is one people already know and want to play. This information is reflected in the star rating on each listing in the market.

You can also pick up and rearrange placed machines at any time during the build phase — just click on one. I mention this only because in the timeline I observed before intervening, the person in your situation spent two weeks with everything in the wrong configuration and became quite despondent. I am not implying anything.

Dr. Quill`,
    trigger: ({ machines, sentIds }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.x !== null) &&
      sentIds.has('quill_01') && !sentIds.has('quill_02'),
    choices: null,
  },

  {
    id: 'quill_03',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'On the Daily Report',
    body:
`You have now run at least one full day of business. Well done.

The end-of-day report is worth reading carefully. It shows how many customers were satisfied, how many gave up and left without playing, and what damage your machines took during the day. Unsatisfied customers affect your reputation — tracked in this game as "popularity." Over time, popularity shapes how busy your bar becomes.

This is also, broadly, how businesses work in real life. I mention it because the documentation I was given suggested I should explain things thoroughly.

One more thing: the computer on your desk connects to an online marketplace where you can buy new and used machines, bar supplies, and enrol in university courses that improve your operation. I want to be honest with you: the internet does not actually exist yet in 1975. What you are connecting to is something I set up. Please do not look into this too closely. The technical explanation would take longer than you have and involves a word I am not sure has been coined yet.

You are doing well. Keep going.

Dr. Quill

P.S. I am required by office policy to note that this correspondence does not constitute official endorsement of any commercial activity by the Temporal Continuity Office. This is a legal formality. I am absolutely endorsing your commercial activity.`,
    trigger: ({ time, sentIds }) =>
      lin(time) >= 4 && sentIds.has('quill_02') && !sentIds.has('quill_03'),
    choices: null,
  },

  {
    id: 'quill_04',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Machine Maintenance — Important',
    body:
`A quick note on maintenance.

I can see from the feed that at least one of your machines has taken some wear. This is expected — machines degrade with use, and older machines degrade faster. I want to make sure you are not ignoring this, because the version of events I am trying to avoid involves a point where every machine in the bar is broken simultaneously and the resulting situation is not good for anyone, including me from a reporting standpoint.

To repair: during the build phase, before you open for the day, select a machine from your inventory panel. A repair option will appear. You spend a number of your daily repair points equal to the damage you want to fix, at a cost of $10 per point.

There is also an upgrade called Electronics available through the Open University on your computer. It increases your daily repair capacity. I recommend it when funds allow. I am aware that advising on specific upgrades may fall outside my remit, but the form required to report a remit violation is four pages long and I do not believe anyone will complete it.

Dr. Quill`,
    trigger: ({ machines, sentIds }) =>
      machines.some(m => (m.type === 'pinball' || !m.type) && m.durability < 60) &&
      sentIds.has('quill_02') && !sentIds.has('quill_04'),
    choices: null,
  },

  {
    id: 'quill_05',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Progress Note',
    body:
`I wanted to write and say: you are doing well.

Your popularity has crossed a threshold that my models identified as an early indicator of viability. The people at the Office who monitor these things — and there are several of them, though they rotate, and at least one finds the whole pinball angle quite confusing — are cautiously pleased. This is high praise from an organisation that is professionally required to be cautious about everything.

I should also mention: a local resident has begun sending you emails. He goes by Gary. He is not from the future. He is simply a very committed customer who has apparently started keeping a log of his visits. I noticed his correspondence in the feed and briefly assumed there had been a breach. There was no breach. He is just like that.

Keep going. There is more to come and most of it is good.

Dr. Quill

P.S. I looked up Gary in the historical record. He keeps the log for another thirty-one years. I am not going to tell you what it says at the end, but I will say it is quite something.`,
    trigger: ({ popularity, sentIds }) =>
      popularity >= 100 && sentIds.has('quill_03') && !sentIds.has('quill_05'),
    choices: null,
  },

  {
    id: 'quill_bathroom',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Advance Notice — Facilities',
    body:
`I am writing ahead of a change that will affect your operations beginning in 1976.

This may seem like an unusual thing to warn you about. But I have observed enough timelines to know that the things which seem mundane are often the ones that cause the most trouble when overlooked.

Customers will begin expecting bathroom facilities.

I know how that sounds. I want to be clear that I am not being dramatic. From 1976 onward, your patrons will occasionally need to use a bathroom during their visit. If one is not available, they will leave unsatisfied. This affects your popularity in the usual ways, but more importantly, it affects something further along in the timeline that I am not currently cleared to describe.

You can purchase bathroom facilities through the Bar Supplies section of your computer. I recommend doing so before the new year. A single bathroom handles a reasonable volume of patrons, and customers who use it contribute to your satisfied count for the day.

I want to acknowledge that sending someone a message through time to warn them about plumbing is not the most dignified use of temporal communication technology. I am aware of this. I stand by the decision.

Dr. Quill

P.S. On the subject of dignity: I once filed a report about a fish and chip shop in 1987 that also required this intervention. I cannot discuss the details. But you are not alone.`,
    trigger: ({ time, sentIds }) =>
      (time.year === 1975 && time.week >= 7 || time.year >= 1976) &&
      sentIds.has('quill_03') && !sentIds.has('quill_bathroom'),
    choices: null,
  },

  {
    id: 'quill_06',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Fifteen Years',
    body:
`You are still here.

I want to say something I have been composing for some time, which is: you have done remarkably well. It is now fifteen years since you started. The bar exists. It has a reputation and a regular clientele and at least one academic writing a thesis about it. The timeline, from where I am sitting, is holding.

I should also prepare you for something. The years ahead are going to be harder. I cannot say more than that without running into disclosure territory that would trigger an automatic review, but I want you to know that what is coming is not a result of anything you did wrong. It is a broader shift — in technology, in leisure, in how people spend their evenings — that I have studied at length and find genuinely sad.

The important thing, and I am being as direct as I am permitted to be, is that you do not close. Keeping the bar open through what is coming matters. The reasons will eventually become clear.

Also: please repair your machines more consistently. I notice you let some of them run quite low before addressing them. The temporal stakes are real, but also just — it is a good habit.

Still watching. Still with you.

Dr. Quill
Senior Analyst (Acting) — there have been some departmental restructures
Temporal Continuity Office, Dept. 7`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1990 && sentIds.has('quill_05') && !sentIds.has('quill_06'),
    choices: null,
  },

  {
    id: 'quill_illness',
    from: 'Dr. H. Quill',
    address: 'horatio.quill@temporalcontinuity.gov',
    subject: 'Something I Need to Tell You',
    body:
`I have been composing this email for some time.

In 2020, you are going to become unwell. I am not able to tell you what the illness is. This is partly a disclosure restriction and partly because I am not certain the medical terminology would mean anything to you in 1975, or 2019, or whenever you are reading this.

What I can tell you is that the treatment will be expensive. Increasingly so. The billing escalates in a way I find genuinely difficult to describe without resorting to language that might cause alarm. So I will simply say: the final years are hard.

I want to be honest with you: I have watched many versions of this timeline. Most of them do not make it to 2026. The ones that do are the ones who built something that could sustain the cost. That kept the machines running. That did not, under any circumstances, give up.

What happens if you make it to 2026 is something I cannot tell you. Office policy prevents me from disclosing outcomes. But I will say — and I am choosing my words carefully here — that what is waiting for you on the other side of it is worth more than I am authorised to describe.

Keep the bar open. Whatever it costs.

I mean that in more ways than one.

Dr. Quill

P.S. I know this is a lot to absorb. Please do not let it affect your machine maintenance schedule. The machines still matter. This is not a metaphor.`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2019 && time.week >= 8 && sentIds.has('quill_06') && !sentIds.has('quill_illness'),
    choices: null,
    event: {
      label: 'Message from Dr. Quill',
      severity: 'bad',
      message: 'Dr. Quill has sent an urgent message. Check your inbox.',
    },
  },

];
