const express = require('express');
const router = express.Router();
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { generateKeyPair } = require('../utils/keygen');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const multer = require('multer');

const keysDir = path.join(__dirname, '../keys');
if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });

// Multer setup for optional PEM file

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, keysDir);
  },
  filename: function (req, file, cb) {
    const name = `${Date.now()}_${file.originalname}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('pemKey'), async (req, res) => {
  const { username, sshAddress, password } = req.body;
  const pemKeyFile = req.file; // ✅ FIXED LINE

  const safeId = `${username}@${sshAddress}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const pemPath = path.join(keysDir, `${safeId}_id_rsa.pem`);
  const keyName = `${safeId}_id_rsa`;
  const privateKeyPath = path.join(keysDir, keyName);

  // Save PEM key if uploaded
  if (pemKeyFile) {
    try {
      fs.renameSync(pemKeyFile.path, pemPath);
      console.log('✅ Saved PEM key at:', pemPath);
    } catch (err) {
      console.error('❌ Failed to save PEM key:', err);
      return res.status(500).json({ success: false, message: 'Failed to save PEM key' });
    }

    const conn = new Client();
    conn.on('ready', () => {
      console.log('✅ SSH with PEM succeeded');
      const token = jwt.sign({ username, sshAddress }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1d' });
      conn.end();
      return res.json({ success: true, message: 'Connected using PEM key', token });
    });
    conn.on('error', (err) => {
      console.error('❌ PEM key login failed:', err.message);
      return res.status(401).json({ success: false, message: 'PEM authentication failed' });
    });
    conn.connect({
      host: sshAddress,
      port: 22,
      username,
      privateKey: fs.readFileSync(pemPath),
    });
    return;
  }

  // If local key exists
  if (fs.existsSync(privateKeyPath)) {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('✅ Login with saved key succeeded');
      const token = jwt.sign({ username, sshAddress }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1d' });
      conn.end();
      return res.json({ success: true, message: 'Connected using cached key', token });
    });
    conn.on('error', (err) => {
      console.error('❌ Login with saved key failed:', err.message);
      return res.status(401).json({ success: false, message: 'Key authentication failed' });
    });
    conn.connect({
      host: sshAddress,
      port: 22,
      username,
      privateKey: fs.readFileSync(privateKeyPath),
    });
    return;
  }

  // Else use password
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password or PEM key required' });
  }

  try {
    const { publicKey } = generateKeyPair(keyName);
    const pubKeyContent = fs.readFileSync(publicKey, 'utf8');
    const conn = new Client();

    conn.on('ready', () => {
      console.log('✅ SSH with password succeeded');
      const command = `
        mkdir -p ~/.ssh && \
        echo "${pubKeyContent}" >> ~/.ssh/authorized_keys && \
        chmod 700 ~/.ssh && \
        chmod 600 ~/.ssh/authorized_keys
      `;
      conn.exec(command, (err, stream) => {
        if (err) {
          console.error('❌ Command error:', err);
          conn.end();
          return res.status(500).json({ success: false, message: 'SSH command failed' });
        }

        let stderr = '';
        stream.stderr.on('data', (data) => stderr += data.toString());

        stream.on('close', (code) => {
          conn.end();
          if (code === 0) {
            console.log('✅ Public key installed');
            return res.json({ success: true, message: 'Public key installed and saved' });
          } else {
            console.error('🔴 Key install failed:', stderr);
            return res.status(500).json({ success: false, message: 'Key installation failed', stderr });
          }
        });
      });
    });

    conn.on('error', (err) => {
      console.error('❌ SSH login with password failed:', err.message);
      return res.status(401).json({ success: false, message: 'SSH password login failed' });
    });

    conn.connect({
      host: sshAddress,
      port: 22,
      username,
      password,
    });
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error occurred' });
  }
});

module.exports = router;
