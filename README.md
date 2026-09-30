![](banner.png)

# Lapick

Laptop picker from a hackathon by Gunit, Aadi, JCKawin, and Keerthik Ram.

The site in `frontend/` asks what you play or what you work on, then asks Groq for a CPU, RAM, storage, GPU, and a price range. The brands the project was aimed at are ASUS, Dell, MSI, Acer, HP, and Lenovo.

## Run the site

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_OPENAI_API_KEY` to a Groq key. The page calls `https://api.groq.com/openai/v1` from the browser.

Questions: [Instagram @jckawin](https://www.instagram.com/jckawin/).

## Other folders

| Path | What it is |
| --- | --- |
| `amazon/` | Express server. Scrapes one Amazon product page, and drives Amazon search filters in a Puppeteer browser. `npm install`, then `node index.js` on port 3001. Endpoints are in `amazon/README.md`. |
| `dev/` | Earlier scraper scripts and `laptop.db` |
| `searxng-docker/` | Upstream SearXNG Docker setup, left as published |
