export const STAFF_DEFS = [
  {
    id: 'server',
    name: 'Server',
    icon: '🍺',
    weeklySalary: 200,
    maxCount: 3,
    description: 'Active floor staff who fetch drinks from the keg and serve waiting customers. Each one adds a dedicated drink-runner to your bar.',
    effects: [
      'Walks the floor fetching and delivering drinks (active entity on the grid)',
      'Customers wait twice as long before giving up on a drink (any server)',
      'Drink revenue $15 → $20 per customer (any server)',
    ],
  },
  {
    id: 'repairman',
    name: 'Repairman',
    icon: '🔧',
    weeklySalary: 250,
    description: 'An on-call technician who performs overnight maintenance on your machines.',
    effects: [
      'Auto-repairs +3 durability per placed machine each day (main floor only)',
      'Reduces damage chance by 40% on up to 10 machines',
      'Cost-effective for normal wear — not for overhauling heavily-damaged machines',
    ],
  },
];
