const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('node:crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
function connectDB() {
    mongoose.connect('mongodb://0.0.0.0:27017/fileshare').then(() => {
        console.log('Connected to MongoDB');
    }).catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });
}
connectDB();

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

app.get('/verify/:link', async (req, res) => {
    const file = await File.findOne({ downloadLink: req.params.link });
    if (!file) {
        res.send('Invalid download link');
    } else {

        res.send(`
        <html>
            <head>
            <style>
                body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
                }
                #passwordForm {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                input[type="password"] {
                padding: 10px;
                margin-right: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                }
                button {
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                }
                button:hover {
                background-color: #0056b3;
                }
            </style>
            </head>
            <body>
            <form id="passwordForm">
                <input type="password" id="password" placeholder="Enter password">
                <button type="submit">Download</button>
            </form>
            <script>
                document.getElementById('passwordForm').onsubmit = async (e) => {
                e.preventDefault();
                const password = document.getElementById('password').value;
                const response = await fetch('/verify/${req.params.link}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await response.json();
                if (data.error) {
                    alert(data.error);
                } else {
                    window.location.href = '/download/${req.params.link}/';
                }
                };
            </script>
            </body>
        </html>
        `);
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

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Download endpoint
app.get('/download/:link', async (req, res) => {
    try {
        const file = await File.findOne({ downloadLink: req.params.link });

        if (!file || Date.now() > file.expiryDate) {
            return res.status(404).json({ error: 'Invalid download link or expired' });
        }

        res.download(file.path, file.originalName);
    } catch (error) {
        res.status(500).json({ error: 'Download failed' });
    }
});
console.log({ $lt: new Date() });


// Delete expired files periodically
setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
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
    }
}, 1000 * 20); // 20 seconds

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});