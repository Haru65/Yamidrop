const express = require('express');

const uploadRoute = require('./routes/upload');
const cors = require('cors');
const app = express();
const connectRoute = require('./routes/connect');
const cleanupOldKeys = require("./utils/cleanup")
const checkKeyRoute = require('./routes/check-key');
require('dotenv').config();
//These endpoints are for demo and open-source usage only. Please deploy your own instances if building in production.
const allowedOrigins = [
  'http://localhost:5173',
  'https://yamidrop-uzrq.vercel.app',
  "https://yamidrop-nm4l.vercel.app"
];



app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS origin:', origin); 
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());
cleanupOldKeys()
console.log("started the cleanup timer");
app.use('/check-key', checkKeyRoute);
app.use('/connect', connectRoute);
app.use('/upload', uploadRoute);

app.listen(process.env.PORT||5000,'0.0.0.0', () => console.log('Server running on http://0.0.0.0:5000'));
