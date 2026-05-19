# Pinbar Tycoon

A web-based tycoon game where you manage a pinball bar. 

Built with claude code for testing capabilities. Very few lines of code hand-written. I don't know react very well but I let Claude make decisions about the architecture.

## Features
- Progresses through time starting from 1975
- Dynamic pricing for pinball machines based on their release year and age
- Durability mechanics where machines degrade and need repairs
- Uses OPDB for actual pinball machine data

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Fetch pinball machine data
The game uses a static snapshot of the [OPDB](https://opdb.org) pinball database (`src/data/pinball_machines.json`) so there are zero API calls at runtime. A pre-built copy is included in the repo, but you can refresh it at any time:

```bash
npm run fetch-opdb
```

This script fetches all machines (names, manufacturers, years, images) and overwrites the local JSON. Re-run it periodically to pick up newly added machines.

**OPDB API key (optional but recommended)**

Without a key the script falls back to a limited typeahead search (~400 machines). With a key it pulls the full export (~2,300+ machines with backglass images).

Add your key to a `.env` file in the project root:

```
VITE_OPDB_KEY=your_key_here
```

API keys are free at [opdb.org](https://opdb.org). The export endpoint has a rate limit — if you see `OPDB rate limit hit`, wait a few minutes and run the script again.

### 3. Start the game
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run fetch-opdb` | Refresh `src/data/pinball_machines.json` from OPDB |

## Adding emails

Emails are defined in `src/data/emails.js` as entries in the `EMAIL_DEFS` array. Each entry is an object:

```js
{
  id: 'sender_01',               // unique string — used for deduplication and sequencing
  from: 'Display Name',
  address: 'sender@example.com',
  subject: 'Subject line',
  body: `Email body text.`,      // use a template literal for multi-line bodies
  trigger: ({ time, popularity, cash, machines, sentIds }) => boolean,
  choices: null,                 // or an array of { label, effectId } (see below)
}
```

### Trigger function

The trigger is called each game tick and receives:

| Parameter | Type | Description |
|---|---|---|
| `time` | `{ year, week, day }` | Current in-game date |
| `popularity` | number | Current bar popularity score |
| `cash` | number | Player's current cash |
| `machines` | array | All machines currently owned |
| `sentIds` | Set\<string\> | IDs of emails already in the player's inbox |

The email is delivered the first time the trigger returns `true`. Always guard with `!sentIds.has('your_id')` to prevent re-delivery.

### The `lin()` time helper

A local helper converts a date to a linear tick count, useful for time-based triggers:

```js
function lin({ year, week, day }) {
  return (year - 1975) * 30 + (week - 1) * 3 + day;
}
```

Use it to fire an email after a certain amount of in-game time:

```js
// Fire at least 6 ticks after game start
trigger: ({ time, sentIds }) => lin(time) >= 6 && !sentIds.has('sender_01'),

// Fire on or after week 4 of 1977
trigger: ({ time, sentIds }) =>
  lin(time) >= lin({ year: 1977, week: 4, day: 1 }) && !sentIds.has('sender_01'),
```

### Sequencing emails

Use `sentIds.has()` to require an earlier email before sending a follow-up:

```js
// sender_02 only fires after sender_01 has been delivered
trigger: ({ time, sentIds }) =>
  sentIds.has('sender_01') && !sentIds.has('sender_02') && lin(time) >= 20,
```

Triggers can also combine multiple senders — for example, firing an email only after events from two different threads have occurred.

### Interactive emails (choices)

Set `choices` to an array of `{ label, effectId }` objects to show buttons the player must click:

```js
choices: [
  { label: "Accept the offer", effectId: 'my_effect' },
  { label: "Decline",          effectId: null },
]
```

`effectId: null` means no game effect — the choice is just acknowledged. For a non-null `effectId`, add a handler in the `if (effectId === '…')` block inside `handleEmailChoice` in `src/App.jsx`. See the existing `'reg_machine'` case there as a reference.


## TODO

- kegerator currently lets multiple bartender/servers use at a time, needs to use queue system to encourage the player to add more as needs increase, kegerator should also get used from in front of and not on top of and not be traversable by the server/bartenders
- the rent/costs reporting is strange because the money decreases before the end of day report, maybe the end of day report with expenses should happen the day before so if the player doesn't have enough money to cover expenses the button can say "Go Bankrupt" and the player can see what has happened before it happens.
- add an email from the university upon finishing an upgrade (make them silly, think if Greendale from Community had online courses, should suggest strange follow up courses that the player can never take)
- events are sometimes unclear about the effect that they have in the toast, they should have small text in the top right of them with the affect (ie: -$50)
- too many people using the bathroom need to reduce it, instead of randomly adding to patron list add a chance that it gets added to the patron list of things to do after they have a drink. so if a patron has multiple drinks its an almost certainty that they will generate a need to use the bathroom, but if they only play pinball they wont need to use the bathroom.
- add wear and tear on bar supplies as well. much slower than pinball machines. maybe not percentage either instead bar supplies can have a durability factor and after a certain amount of time they just wear out and need to be replaced. broken bar equipment should also fail an inspection from the inspector. maybe make it so that some bar equipment can be repaired like pinball machines like bathrooms, but we would need to make sure that they can be moved to the back room to be repaired.
- add dirty tiles that randomly ger generated by customers, have waitstaff clean it if they dont have a customer, or the player can clean a dirty tile manually at the end of the day by clicking on the tile? have certain equipment have an increased change of spawning a dirty tile on top (like the bathroom). dirty tiles show add a negative experience to the customer if they occupy a dirty space. So its easy for the player to start the day with a clean bar but managing the dirt during the day is difficult. add appropriate university upgrades as well.
- add banking and loan systems, so the player can invest their money but only in something like GICs or Bonds or something where it has to be in for a fixed amount of time and if they go bankrupt before that time is up then it can't help them. 
- in the machine actions add a link to the opdb page that the player can click to open a new window to see information about the machine. also add a credits section on the computer that we can use to give credit and thanks to the opdb.
- email offers should expire after a week, like when reg offers a pinball for sale.
- if the player buys the $800 pinball machine from reg it should start a storyline where reg is spying on the bar through the machine.