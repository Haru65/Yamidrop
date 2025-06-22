const { Client } = require('ssh2');
const fs = require('fs');

function uploadToRemote(localPath, remoteFilename, sshInfo) {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) return reject(err);

        const readStream = fs.createReadStream(localPath);
        const writeStream = sftp.createWriteStream(`/home/${sshInfo.username}/${remoteFilename}`);

        writeStream.on('close', () => {
          conn.end();
          resolve();
        });

        writeStream.on('error', reject);

        readStream.pipe(writeStream);
      });
    });

    conn.on('error', reject);

    conn.connect({
      host: sshInfo.host,
      port: sshInfo.port,
      username: sshInfo.username,
      password: sshInfo.password,
      // OR: privateKey: fs.readFileSync('keys/user_id_rsa')
    });
  });
}

module.exports = { uploadToRemote };
