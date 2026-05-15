const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'db.seed.json');
const dbPath = path.join(__dirname, '..', 'db.json');
const force = process.argv.includes('--force');

if (!fs.existsSync(dbPath) || force) {
  fs.copyFileSync(seedPath, dbPath);
  console.log(
    force
      ? 'db.json reset to seed data'
      : 'db.json initialized from db.seed.json'
  );
} else {
  console.log('db.json already exists — skipping initialization');
}