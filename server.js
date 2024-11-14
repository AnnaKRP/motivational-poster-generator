import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/random-content', async (req, res) => {
  try {
    const clientID = process.env.NEXT_PUBLIC_MY_API_KEY;
    const quoteApiKey = process.env.QUOTE_API_KEY;

    if (!clientID || !quoteApiKey) {
      return res.status(500).json({ message: 'API keys are missing' });
    }

    // Fetch a random image from Unsplash
    const unsplashResponse = await fetch(`https://api.unsplash.com/photos/random/?client_id=${clientID}`);
    if (!unsplashResponse.ok) {
      const errorText = await unsplashResponse.text();
      console.error('Unsplash API Error:', errorText);
      return res.status(500).json({ message: 'Failed to fetch image from Unsplash' });
    }
    const unsplashData = await unsplashResponse.json();

    // Fetch a random quote from the Quotes API
    const quoteResponse = await fetch('https://api.api-ninjas.com/v1/quotes', {
      headers: { 'X-Api-Key': quoteApiKey },
    });
    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      console.error('Quote API Error:', errorText);
      return res.status(500).json({ message: 'Failed to fetch quote' });
    }
    const quoteData = await quoteResponse.json();
    console.log('Quote Data:', quoteData);

    // Combine image and quote data
    const imageData = {
      url: unsplashData.urls.regular,
      link: unsplashData.links.html,
      quote: quoteData[0]?.quote,
    };

    res.json(imageData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
