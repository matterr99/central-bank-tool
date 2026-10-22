const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and serve static files from the 'public' folder
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Secure Proxy Endpoint for FRED API
app.get('/api/fred', async (req, res) => {
    try {
        const seriesId = req.query.series_id;
        const apiKey = process.env.FRED_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'FRED_API_KEY environment variable is missing on Render.' });
        }

        if (!seriesId) {
            return res.status(400).json({ error: 'Missing series_id parameter.' });
        }

        // Construct the FRED URL securely on the server
        const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=10&sort_order=desc`;
        
        const response = await fetch(fredUrl);
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to fetch data from FRED proxy' });
    }
});

app.listen(PORT, () => {
    console.log(`Kairos Tool Server running on port ${PORT}`);
});
