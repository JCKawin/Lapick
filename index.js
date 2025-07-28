import express from 'express';
import { scrapeUrl, initBrowser, closeBrowser } from './puppeteer.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/scrape-url', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).send({ error: 'URL is required' });
    }
    try {
        const content = await scrapeUrl(url, '');
        res.send({ markdown: content });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initBrowser().then(() => {
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
});

process.on('exit', closeBrowser);
process.on('SIGINT', closeBrowser);
process.on('uncaughtException', (err, origin) => {
    console.error(err, origin)
    closeBrowser();
    process.exit(1)
});