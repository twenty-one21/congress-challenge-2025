const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { MongoClient, GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
require('dotenv').config();

const Grid = require("gridfs-stream");

const app = express();
app.use(express.static('videos'));
const PORT = 1234;
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
let gfsBucket;

db.once('open', () => {
    console.log('MongoDB connected');
    gfsBucket = new GridFSBucket(db.db, { bucketName: 'videos' });
});


const storage = multer.memoryStorage();

const upload = multer({storage});

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});