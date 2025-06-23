const express = require('express');

const uploadRoute = require('./routes/upload');
const cors = require('cors');
const app = express();
const connectRoute = require('./routes/connect');
const cleanupOldKeys = require("./utils/cleanup")
const checkKeyRoute = require('./routes/check-key');
require('dotenv').config();


// Parse comma-separated origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const corsOptions = {
  origin: (origin, callback) => {
    console.log('CORS origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Required for legacy browsers (IE11, etc.)
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());
cleanupOldKeys()
console.log("started the cleanup timer");
app.use('/check-key', checkKeyRoute);
app.use('/connect', connectRoute);
app.use('/upload', uploadRoute);

app.listen(process.env.PORT||5000,'0.0.0.0', () => console.log('Server running on http://0.0.0.0:5000'));
