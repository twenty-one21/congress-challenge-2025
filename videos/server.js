const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const {GridFsStorage} = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const path = require("path");
const env = require("dotenv");
env.config();

const app = express();
const PORT = 1234;
const mongoURI = "mongodb+srv://mikeychen09:EOVfemZKScnHmUwP@mindmate-video.yd4xwzt.mongodb.net/?retryWrites=true&w=majority&appName=mindmate-video";

const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("videos");
});

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        const filename = Date.now() + '-' + file.originalname;
        return {
            filename: filename,
            bucketName: "videos"
        };
    }
});

const upload = multer({storage});

//POST /upload
app.post("/upload", upload.single("video"), (req, res) => {
    //contains a file?
    if (!req.file) return res.status(400).json({ error: "Error 400: not file" });
    res.json({ fileId: req.file.id, filename: req.file.filename });
})

//GET /download
app.get("/download/:filename", (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        //no file found
        if (!file || file.length === 0) {
            return res.status(404).json({error: "Error 404: not found"});
        }
        //not a video
        if (!file.contentType.startsWith('video/')) {
            return res.status(400).json({error: "Error 400: not video"});
        }
        //stream
        const readstream = gfs.createReadStream(file.filename);
        res.set('Content-Type', file.contentType);
        readstream.pipe(res);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});