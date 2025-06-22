// routes/checkKey.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/', (req, res) => {
  const { username, sshAddress } = req.body;

  if (!username || !sshAddress) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const keyPath = path.join(__dirname, `../keys/${username}@${sshAddress}_id_rsa`);
  const keyExists = fs.existsSync(keyPath);

  return res.json({ success: true, keyExists });
});

module.exports = router;
