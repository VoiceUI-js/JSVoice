const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch'); // Needs node-fetch v2 or v3
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = 3000;

// Need OPENAI_API_KEY in .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/api/whisper', upload.single('file'), async (req, res) => {
    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'Server missing OpenAI API Key' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    try {
        // Forward to OpenAI
        const formData = new FormData();
        // Append buffer with filename options so OpenAI knows it's a file
        formData.append('file', req.file.buffer, {
            filename: 'audio.webm',
            contentType: req.file.mimetype || 'audio/webm',
        });
        formData.append('model', 'whisper-1');

        // Optional: Language
        // formData.append('language', 'en'); 

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI API Error: ${err}`);
        }

        const data = await response.json();
        res.json(data); // Returns { text: "..." }

    } catch (error) {
        console.error('Whisper Proxy Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Whisper proxy running at http://localhost:${port}`);
});
