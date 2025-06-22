const express = require('express');
const multer = require('multer');
const uploadRoute = require('./routes/upload');
const cors = require('cors');
const app = express();
const connectRoute = require('./routes/connect');
const cleanupOldKeys = require("./utils/cleanup")
const checkKeyRoute = require('./routes/check-key');
require('dotenv').config();

app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(express.json());
cleanupOldKeys()
console.log("started the cleanup timer");
app.use('/check-key', checkKeyRoute);
app.use('/connect', connectRoute);
app.use('/upload', uploadRoute);

app.listen(5000,'0.0.0.0', () => console.log('Server running on http://0.0.0.0:5000'));
