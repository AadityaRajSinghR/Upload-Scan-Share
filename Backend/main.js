const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('node:crypto');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://user1:1234@cluster0.9wj6q.mongodb.net/file-sharing', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// File Schema
const File = mongoose.model('File', {
    filename: String,
    path: String,
    password: String,
    downloadLink: String,
    expiryDate: Date,
    originalName: String
});

// Multer configuration
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { password, expiryMinutes, expiryHours } = req.body;
        if (!req.file || !password || !expiryMinutes) {
            return res.status(400).json({ error: 'File, password and expiry time are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const minutes = parseInt(req.body.expiryMinutes) || 0;
        const hours = parseInt(req.body.expiryHours) || 0;
        const expiryDate = new Date(Date.now() + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000));
        const downloadLink = crypto.randomBytes(16).toString('hex');

        const file = new File({
            filename: req.file.filename,
            path: req.file.path,
            password: hashedPassword,
            downloadLink,
            expiryDate,
            originalName: req.file.originalname
        });

        await file.save();

        res.json({
            message: 'File uploaded successfully',
            downloadLink: `${req.protocol}://${req.get('host')}/verify/${downloadLink}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Verify password endpoint
app.post('/verify/:link', async (req, res) => {
    try {
        const file = await File.findOne({ downloadLink: req.params.link });
        if (!file || Date.now() > file.expiryDate) {
            return res.status(404).json({ error: 'File not found or link expired' });
        }

        if (!req.body.password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, file.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate a temporary download token
        const downloadToken = crypto.randomBytes(16).toString('hex');
        file.downloadToken = downloadToken;
        await file.save();

        res.json({ downloadToken });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Download endpoint
app.get('/download/:link/:token', async (req, res) => {
    try {
        const file = await File.findOne({ 
            downloadLink: req.params.link,
            downloadToken: req.params.token 
        });

        if (!file || Date.now() > file.expiryDate) {
            return res.status(404).json({ error: 'Invalid download link or expired' });
        }

        // Clear the download token after use
        file.downloadToken = null;
        await file.save();

        res.download(file.path, file.originalName);
    } catch (error) {
        res.status(500).json({ error: 'Download failed' });
    }
});

// Delete expired files periodically
setInterval(async () => {
    try {
        const expiredFiles = await File.find({ expiryDate: { $lt: new Date() } });
        for (const file of expiredFiles) {
            require('fs').unlink(file.path, async (err) => {
                if (!err) {
                    await File.deleteOne({ _id: file._id });
                }
            });
        }

    } catch (error) {
        console.error('Error cleaning expired files:', error);
    }
}, 1000 * 20); // 20 seconds

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});