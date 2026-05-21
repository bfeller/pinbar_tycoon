// ── Terry Baines — Tri-State Coin-Op ─────────────────────────────────────────
// Relentlessly optimistic distributor. Sells the future of the industry with
// equal enthusiasm every time. Slightly nervous you'll ask about the price.

export const terryEmails = [

  {
    id: 'terry_01',
    from: 'Terry Baines',
    address: 't.baines@tristatecoinop.com',
    subject: 'The Future Has Arrived (And I Have One In The Van)',
    body:
`Hello there.

Terry Baines here, Tri-State Coin-Op. I don't know if we've spoken before but I've got something I think you should see.

It's called the Spirit of '76. Brand new from Micro Games. Solid-state electronics — no relays, no chimes, no mechanical switching gear. Just circuit boards. I don't fully understand the circuit boards but I've been told by someone who does that they are Very Reliable.

Now here's the thing: I can do you one at nine hundred dollars. Yes, nine hundred. A machine like this should be three times that. I know a fellow at the warehouse — I won't say more than that, and honestly you shouldn't ask. Point is the number is nine hundred and the machine is real.

It is the future of this industry. You have my word on that.

Let me know either way. I'll keep it in the van until Friday.

Terry Baines
Tri-State Coin-Op
"We Move Machines"`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1975 && time.week >= 3 && !sentIds.has('terry_01'),
    choices: [
      { label: 'Buy it ($900)', effectId: 'terry_machine' },
      { label: 'Not for me',    effectId: null },
    ],
    expiresAfterDays: 3,
    event: {
      label: 'Sales Pitch',
      severity: 'neutral',
      message: 'A distributor has an interesting offer. Check your inbox.',
    },
  },

  {
    id: 'terry_02',
    from: 'Terry Baines',
    address: 't.baines@tristatecoinop.com',
    subject: 'BIG NEWS — INDUSTRY UPDATE',
    body:
`Hello —

I don't normally write in capitals but I feel the situation warrants it.

PINBALL IS LEGAL IN NEW YORK.

A young fellow called Roger Sharpe went in front of the city council with a machine and called his shots. Stood right there and said "watch this" and then DID it. They had to agree it was skill. Thirty years of bans — thirty years! — and one man with steady hands changed everything.

They're going to have to let the machines out of the back rooms now. Into the windows. Into the light. I told my wife and she said "that's nice, Terry." It is not "nice." It is HISTORIC.

I'm going to do something to celebrate. I'm not sure what yet. Probably a cake.

Anyway. Happy days.

Terry Baines
Tri-State Coin-Op
"We Move Machines"`,
    trigger: ({ time, sentIds }) =>
      time.year >= 1976 && sentIds.has('terry_01') && !sentIds.has('terry_02'),
    choices: null,
  },

];
