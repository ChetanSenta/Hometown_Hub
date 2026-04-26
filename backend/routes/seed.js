const router = require('express').Router();
const { execSync } = require('child_process');
const path = require('path');

router.get('/:secret', async (req, res) => {
  const SEED_SECRET = process.env.SEED_SECRET || 'seed-my-database-now';
  if (req.params.secret !== SEED_SECRET) {
    return res.status(403).json({ success: false, message: 'Invalid seed secret' });
  }
  try {
    const seedPath = path.join(__dirname, '../scripts/seed.js');
    const output = execSync(`node ${seedPath}`, {
      env: process.env,
      timeout: 60000,
      encoding: 'utf8',
    });
    res.json({ success: true, message: 'Database seeded!', output });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, stderr: err.stderr });
  }
});

module.exports = router;