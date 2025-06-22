const fs = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, '../keys');
const ONE_DAY = 24 * 60 * 60 * 1000;

function cleanupOldKeys() {
  if (!fs.existsSync(keysDir)) return;

  const files = fs.readdirSync(keysDir);
  const now = Date.now();

  files.forEach((file) => {
    const filePath = path.join(keysDir, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;

    if (age > ONE_DAY) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Deleted expired key: ${file}`);
    }
  });
}

module.exports = cleanupOldKeys;
