const { execSync } = require('child_process');
const path = require('path');

function generateKeyPair(name) {
  const privateKey = path.join(__dirname, '../keys', name);
  const publicKey = `${privateKey}.pub`;

  execSync(`ssh-keygen -t rsa -b 2048 -f ${privateKey} -q -N ""`);

  return { privateKey, publicKey };
}

module.exports = { generateKeyPair };
