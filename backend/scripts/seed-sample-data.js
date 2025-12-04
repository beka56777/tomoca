// backend/scripts/seed-sample-data.js
const storage = require('../lib/storage-json');

async function seed() {
  const sample = [
    {
      id: 'TOM-TEST-1',
      name: 'Alice',
      department: 'HR',
      urgency: 'Low',
      issue: 'Printer not working on 3rd floor',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: []
    },
    {
      id: 'TOM-TEST-2',
      name: 'Bob',
      department: 'Finance',
      urgency: 'High',
      issue: 'Cannot access accounting app',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: []
    }
  ];
  await storage.replaceAll(sample);
  console.log('Seeded sample data.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
