const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const verifyTokens = require('../middleware/verifyTokens');

const upload = multer({ dest: 'uploads/' });
console.log('📦 Upload route loaded');

router.post('/', verifyTokens, upload.single('file'), async (req, res) => {
  const { username, sshAddress } = req.body;
  const file = req.file;

  if (!file || !username || !sshAddress) {
    return res.status(400).json({ success: false, message: 'Missing fields or file' });
  }

  const safeId = `${username}@${sshAddress}`.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const pemPath = path.join(__dirname, `../keys/${safeId}_id_rsa.pem`);
  const rsaPath = path.join(__dirname, `../keys/${safeId}_id_rsa`);

  let privateKeyPath = null;
  if (fs.existsSync(pemPath)) {
    privateKeyPath = pemPath;
    console.log('🔑 Using PEM key');
  } else if (fs.existsSync(rsaPath)) {
    privateKeyPath = rsaPath;
    console.log('🔐 Using cached RSA key');
  } else {
    return res.status(404).json({ success: false, message: 'No private key found. Please login first.' });
  }

  const conn = new Client();

  conn.on('ready', () => {
    console.log('✅ SSH connected. Starting SFTP upload.');

    conn.sftp((err, sftp) => {
      if (err) {
        console.error('❌ SFTP error:', err);
        conn.end();
        return res.status(500).json({ success: false, message: 'SFTP initialization failed' });
      }

      const remotePath = `/home/${username}/uploads/${file.originalname}`;
      const readStream = fs.createReadStream(file.path);
      const writeStream = sftp.createWriteStream(remotePath);

      writeStream.on('close', () => {
        console.log(`✅ File uploaded to: ${remotePath}`);
        try {
          fs.unlinkSync(file.path);
          console.log('🧹 Temp file cleaned up');
        } catch (err) {
          console.warn('⚠️ Temp file cleanup failed:', err.message);
        }
        conn.end();
        return res.json({ success: true, message: 'File uploaded successfully' });
      });

      writeStream.on('error', (err) => {
        console.error('❌ Upload error:', err.message);
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupErr) {
          console.warn('⚠️ Cleanup error:', cleanupErr.message);
        }
        conn.end();
        return res.status(500).json({ success: false, message: `File upload failed: ${err.message}` });
      });

      readStream.pipe(writeStream);
    });
  });

  conn.on('error', (err) => {
    console.error('❌ SSH connection error:', err.message);
    return res.status(500).json({ success: false, message: 'SSH connection failed' });
  });

  conn.connect({
    host: sshAddress,
    port: 22,
    username,
    privateKey: fs.readFileSync(privateKeyPath),
  });
});

module.exports = router;
