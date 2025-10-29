const webpush = require('web-push');
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const mongoose = require("mongoose");
const multer = require("multer");
const { MongoClient, GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const cron = require('node-cron');
require('dotenv').config();

const Grid = require("gridfs-stream");

const app = express();
app.use(express.static('videos'));
const PORT = 1234;
const mongoURI = process.env.MONGO_URI;

app.use(express.static(path.join(__dirname, "..", "public")));
app.use('/styles', express.static(path.join(__dirname, 'styles')));

app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use('/firebase.js', express.static(path.join(__dirname, 'firebase.js')));

// vapid keys
const VAPID_PUBLIC_KEY = "BLHnva4GDqBqCDdkiNcZUajoqr6YSTLlvPXPenw9DYeb7plO22I5iwrn40JFp26eMf_oNmI9TI26Bx4-dka--9E";
const VAPID_PRIVATE_KEY = "F9jx_l5XKDzbBneZzgCw6GQj4aA98ScVhXq_24oLFR4";

webpush.setVapidDetails(
  "mailto:aklee808@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

/* mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}); */

/* const db = mongoose.connection;
let gfsBucket; */

/* db.once('open', () => {
    console.log('MongoDB connected');
    gfsBucket = new GridFSBucket(db.db, { bucketName: 'videos' });
}); */

// This is a simple in-memory array to store subscriptions for testing
let subscriptions = [];

/*
// Schema for the Push Subscription
const subscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, unique: true }, // 'endpoint' should be unique
  expirationTime: { type: mongoose.Schema.Types.Mixed }, // Can be null
  keys: {
    p256dh: String,
    auth: String
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
// --- END OF BLOCK --- */

const storage = multer.memoryStorage();

const upload = multer({storage});

// This is needed to parse the JSON body of the /api/subscribe request
app.use(bodyParser.json());

// ===================================
// --- PUSH NOTIFICATION ROUTES ---
// ===================================


// uses subscriptions[]
app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription); // Add to the array
  console.log("[Server] Subscription saved (in-memory).");
  res.status(201).json({ message: "Subscription saved." });
});

app.get("/api/send-push", (req, res) => {
  console.log("[Server] Sending push notification...");

  const notificationPayload = JSON.stringify({
    title: "New Push Notification!",
    body: "This is a test message from your server.",
    icon: "/images/icon-192x192.png",
    data: {
      url: "/"
    }
  });

  // Loop over all saved subscriptions and send the notification
  const sendPromises = subscriptions.map((subscription) =>
    webpush.sendNotification(subscription, notificationPayload)
      .catch(err => {
        console.error("Error sending notification:", err);
      })
  );

  Promise.all(sendPromises)
    .then(() => res.status(200).json({ message: "Notifications sent." }))
    .catch((err) => {
      console.error("Error sending notifications:", err);
      res.sendStatus(500);
    });
});

//POST /upload
app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Error 400 no file uploaded' });
    }

    const readableVideoStream = new Readable();
    readableVideoStream.push(req.file.buffer);
    readableVideoStream.push(null);

    const filename = Date.now() + '-' + req.file.originalname;

    const uploadStream = gfsBucket.openUploadStream(filename, {
        contentType: req.file.mimetype
    });

    readableVideoStream.pipe(uploadStream)
        .on('error', (error) => {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Upload failed' });
        })
        .on('finish', () => {
            res.json({ message: 'Video uploaded', filename: uploadStream.id });
        });
});

//GET /download
app.get('/download/:filename', (req, res) => {
    gfsBucket.openDownloadStreamByName(req.params.filename)
        .on('error', () => {
            res.status(404).json({ error: 'File not found' });
        })
        .pipe(res);
});

//GET /videos
app.get('/videos', async (req, res) => {
    const files = await db.db.collection('videos.files').find().toArray();
    res.json(files);
});

// daily push notification
const dailyMessages = [
  "Don't forget to take a break and breathe today.",
  "Remember: Progress, not perfection.",
  "A quick reminder to check in with your emotions.",
  "New day, new opportunity. You've got this!",
  "How are you feeling? Take a moment to reflect.",
  "Be kind to yourself today.",
  "Small steps lead to big changes."
];

function getDailyMessage() {
  // Get a random index from 0 to 6
  const randomIndex = Math.floor(Math.random() * dailyMessages.length);
  return dailyMessages[randomIndex]; //Picks a random message
}

// --- 2. The Scheduled Job ---
// This cron syntax means "run at 9:00 AM, every day"
cron.schedule('* * * * *', async () => {
  console.log('[Cron Job] Running daily push notification job...');

  try {
    // 1. Get all subscriptions from MongoDB
    const allSubscriptions = subscriptions;

    if (allSubscriptions.length === 0) {
      console.log("[Cron Job] No subscriptions to send to.");
      return;
    }

    // 2. Get the custom message
    const messageBody = getDailyMessage();
    const notificationPayload = JSON.stringify({
      title: "🔔 Your Daily Mindmate Reminder 🔔",
      body: messageBody,
      icon: "/images/icon-192x192.png",
      data: { url: "/journal.html" } // e.g., send them to the journal
    });

    // 3. Send to all subscribers
    const sendPromises = allSubscriptions.map((subscription) =>
      webpush.sendNotification(subscription, notificationPayload)
        .catch(err => {
            console.error("Error sending notification:", err);
        })
    );
    
    await Promise.all(sendPromises);
    console.log("[Cron Job] Daily notifications sent successfully.");

  } catch (err) {
    console.error("[Cron Job] Error running daily job:", err);
  }
}, {
  timezone: "America/Los_Angeles"
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});