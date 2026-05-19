import { lin } from './utils';

// ── Dr. Elspeth Voss ──────────────────────────────────────────────────────────
// Academic researcher. Writing a thesis on analogue leisure spaces. Her arc
// ends in quiet triumph when the pinball renaissance validates her life's work.
// Subject G (Gary) appears in her thesis. He does not know this.

export const vossEmails = [

  {
    id: 'voss_01',
    from: 'Dr. E. Voss',
    address: 'e.voss@university.edu',
    subject: 'Research Inquiry — The Ludic Space of the Analogue Parlour',
    body:
`Dear Bar Operator,

My name is Dr. Elspeth Voss. I am a Senior Lecturer in Ludology and Applied Leisure Theory. I am completing my doctoral thesis, provisionally titled:

"The Tilt: Bodily Autonomy and Mechanical Resistance in the Analogue Gaming Parlour, 1970–1990"

I would like to visit your establishment to conduct observational research. I will be unobtrusive. I will be in the corner. I will have a clipboard. Everything about this will be entirely normal and fine.

I attach my research proposal and ethics clearance documentation.

(I have not attached these, as I am not yet certain how attachments function on this system. Please imagine that they are attached and that they are thorough.)

With academic regards,
Dr. Elspeth Voss, BA (Hons), MA, PhD (pending)`,
    trigger: ({ time, popularity, sentIds }) =>
      (time.year >= 1978 || popularity >= 750) && !sentIds.has('voss_01'),
    choices: null,
  },

  {
    id: 'voss_02',
    from: 'Dr. E. Voss',
    address: 'e.voss@university.edu',
    subject: 'Chapter 4 — Update',
    body:
`Dear Bar Operator,

A brief update on my research.

Chapter 3 — "The Multiball Event as Controlled Chaos: A Sartrean Reading" — is complete. My supervisor described it as "quite something." I am choosing to interpret this as positive.

Chapter 4 is titled "The Regular: Identity, Ritual, and the Weekly Pilgrimage to the Machine." I should inform you that one of your patrons appears in it as a case study under the designation "Subject G." Subject G was observed on nine separate visits. He keeps a log. He told me at some length about his neighbour Dave. Dave does not appear in the thesis, but I have included a footnote.

Subject G is unaware of the thesis. I would appreciate it if this remained the case.

Yours in scholarship,
Dr. Elspeth Voss`,
    trigger: ({ time, sentIds }) =>
      sentIds.has('voss_01') && !sentIds.has('voss_02') && lin(time) >= 40,
    choices: null,
  },

  {
    id: 'voss_03',
    from: 'Dr. E. Voss',
    address: 'e.voss@university.edu',
    subject: 'Chapter 5 — A Finding',
    body:
`Dear Bar Operator,

I am writing to share a preliminary finding from Chapter 5 of my thesis, which I have tentatively titled "The Cluster Effect: Competitive Proximity and the Mutually Reinforcing Logic of the Analogue Gaming Parlour."

In short: you and The Bumper Zone are good for each other.

My data — collected across forty-seven visits to both establishments over three years, which I note in the interests of full disclosure — indicates that the presence of two competing venues creates what I am calling a "ludic district." Customers who discover one bar frequently discover the other. Awareness compounds. Both venues benefit from the other's existence.

I appreciate this may be counterintuitive. I also appreciate it may be uncomfortable to owe something to Reg Nutter. Nevertheless, the data is clear.

I will be sending Mr. Nutter a copy of this finding as well. He responded to my last letter with a Post-It that said "OK but I was here first." I have included this in the appendix.

With warm academic regards,
Dr. Elspeth Voss`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1987 && sentIds.has('voss_02') && !sentIds.has('voss_03'),
    choices: null,
    event: {
      label: 'Research Breakthrough',
      severity: 'good',
      message: 'Dr. Voss has made a discovery about the two bars.',
    },
  },

  {
    id: 'voss_04',
    from: 'Dr. E. Voss',
    address: 'e.voss@university.edu',
    subject: 'something has happened',
    body:
`Dear Bar Operator,

I hope this finds you well. I am writing because something has happened that I thought you should know about.

My thesis — finally published last year, fifteen years after it was "almost done" — has been cited in an article in a major newspaper. The article is about the pinball renaissance. Apparently pinball is having what the article calls "a moment." I am choosing not to feel things about the timing.

The article mentions the clustering effect. My name is in a footnote. Subject G's log is paraphrased — anonymously, but I suspect he will recognise himself.

I wanted to tell you because you were part of it. The data came from your bar. The machines, the regulars, the particular quality of the light on Tuesday evenings. All of it went into the thesis, which went into the footnote, which is apparently now part of the cultural conversation about pinball.

I am going to come in again, if that's alright. This time without the clipboard.

With warm regards,
Dr. Elspeth Voss
(Formerly "pending" — now, somehow, official)`,
    trigger: ({ time, sentIds }) =>
      time.year >= 2016 && sentIds.has('voss_03') && !sentIds.has('voss_04'),
    choices: null,
    event: {
      label: 'Pinball Renaissance',
      severity: 'good',
      message: "Dr. Voss's research is being cited. Pinball is having a moment.",
      effect: 'popularity_delta',
      effectValue: 30,
    },
  },

];
