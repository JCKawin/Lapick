
import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUseragent from 'random-useragent';
import pkg from 'telnet-client';
const { Telnet } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// --- General Configuration & Helpers ---

const USE_PROXY = false; // Set to true to enable Tor proxy for all operations

// Tor IP rotation function
const rotateTorIP = async (password = 'gunit') => {
  const connection = new Telnet();
  const params = {
    host: '127.0.0.1',
    port: 9051,
    negotiationMandatory: false,
    timeout: 1500,
  };

  try {
    await connection.connect(params);
    await connection.send(`AUTHENTICATE "${password}"`);
    await connection.send('SIGNAL NEWNYM');
    console.log('Tor IP rotated');
  } catch (err) {
    console.warn('⚠️ Tor Control Error:', err.message);
  } finally {
    await connection.end();
  }
};

// Desktop user agent rotation
const getDesktopUserAgent = () => {
  const desktopUserAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  return desktopUserAgents[Math.floor(Math.random() * desktopUserAgents.length)];
};

// --- Amazon Search & Filter Functionality ---

let searchBrowser = null;
let searchPage = null;
let availableFilters = [];

const initializeSearchBrowser = async (searchQuery = 'laptop') => {
  try {
    if (USE_PROXY) {
      await rotateTorIP();
    }

    const launchArgs = USE_PROXY ? ['--proxy-server=socks5://127.0.0.1:9050'] : [];
    
    searchBrowser = await puppeteer.launch({
      headless: true, // Set to false so you can see the browser
      args: launchArgs,
    });

    searchPage = await searchBrowser.newPage();
    await searchPage.setViewport({ width: 1920, height: 1080 });
    
    const ua = getDesktopUserAgent();
    await searchPage.setUserAgent(ua);
    console.log(`User-Agent: ${ua}`);

    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`;
    console.log(`🔍 Navigating to: ${searchUrl}`);
    
    await searchPage.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    console.log('✅ Search page navigation completed');

    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  } catch (error) {
    console.error('❌ Browser initialization error:', error);
    if (searchBrowser) {
        await searchBrowser.close();
        searchBrowser = null;
    }
    return false;
  }
};

const scrapeFilters = async () => {
  if (!searchPage) throw new Error('Browser not initialized');

  console.log('🔍 Scraping available filters...');
  const filters = await searchPage.evaluate(() => {
    const allDivs = document.querySelectorAll('div[id]');
    const filterDivs = [];
    allDivs.forEach((div) => {
      const divId = div.id;
      if (divId && divId.includes('p_n_feature_') && divId.includes('browse-bin/')) {
        try {
          const categoryName = div.querySelector('span.a-size-base.a-color-base.puis-bold-weight-text')?.textContent?.trim() || 'Unknown Category';
          const listElements = div.querySelectorAll('li');
          const filterOptions = [];
          listElements.forEach((li, index) => {
            const text = li.textContent?.trim();
            const link = li.querySelector('a.s-navigation-item');
            const input = li.querySelector('input[type="checkbox"]');
            const span = li.querySelector('span.a-size-base.a-color-base');
            if (text && link && span) {
              const selectors = [];
              if (li.id) selectors.push(`#${li.id} a`);
              if (link.href) selectors.push(`a[href="${link.getAttribute('href')}"]`);
              const cleanText = span.textContent?.trim();
              if (cleanText) selectors.push(`span.a-size-base.a-color-base:contains("${cleanText}")`);
              
              filterOptions.push({
                index,
                text: cleanText || text,
                liId: li.id || null,
                linkHref: link.href || null,
                isChecked: input ? input.checked : false,
                primarySelector: selectors[0] || null,
              });
            }
          });
          if (filterOptions.length > 0) {
            filterDivs.push({ divId, categoryName, optionCount: filterOptions.length, options: filterOptions });
          }
        } catch (error) {
          console.error(`Error processing div ${divId}:`, error);
        }
      }
    });
    return filterDivs;
  });

  availableFilters = filters;
  console.log(`✅ Found ${filters.length} filter categories.`);
  return filters;
};

const clickFilter = async (filterId, optionIndex) => {
    if (!searchPage) throw new Error('Browser not initialized');

    const filter = availableFilters.find(f => f.divId === filterId);
    if (!filter) throw new Error(`Filter with ID ${filterId} not found`);
    
    const option = filter.options[optionIndex];
    if (!option) throw new Error(`Filter option at index ${optionIndex} not found`);

    console.log(`🖱️ Clicking filter: ${filter.categoryName} - ${option.text}`);
    
    if (!option.primarySelector) throw new Error('No selector available for this option.');

    await searchPage.click(option.primarySelector);
    await searchPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
    
    console.log(`✅ Successfully clicked filter option`);
    return true;
};


// --- Amazon Product Scraper Functionality ---

const scrapeAmazonProduct = async (productUrl) => {
    if (USE_PROXY) {
        await rotateTorIP();
    }

    const launchArgs = USE_PROXY ? ['--proxy-server=socks5://127.0.0.1:9050'] : [];
    const browser = await puppeteer.launch({ headless: true, args: launchArgs });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    const ua = getDesktopUserAgent();
    await page.setUserAgent(ua);
    console.log(`Scraping with User-Agent: ${ua}`);

    try {
        await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
        console.log('✅ Scraper page navigation started');

        // Simplified scraping logic from amazon-scraper.js
        await page.waitForSelector('body', { timeout: 10000 });

        const price = await page.evaluate(() => {
            const priceElement = document.querySelector('span.a-price-whole');
            return priceElement ? priceElement.textContent.trim() : null;
        });

        const images = await page.evaluate(() => {
            const imageElements = document.querySelectorAll('img.a-dynamic-image, #landingImage');
            return Array.from(imageElements).map(el => ({
                src: el.src,
                alt: el.alt,
            }));
        });

        const details = await page.evaluate(() => {
            const detailRows = document.querySelectorAll('tr, .a-row, [class*="detail"]');
            const pairedDetails = [];
            detailRows.forEach(row => {
                const entry = row.querySelector('.a-color-secondary.a-size-base.prodDetSectionEntry, th');
                const value = row.querySelector('.a-size-base.prodDetAttrValue, td');
                if (entry && value) {
                    pairedDetails.push({
                        key: entry.textContent.trim(),
                        value: value.textContent.trim(),
                    });
                }
            });
            return pairedDetails;
        });

        return { price, images, details };

    } catch (err) {
        console.error('❌ Scraper Error:', err.message);
        const isCaptcha = await page.$('form[action*="Sorry"], iframe[src*="recaptcha"]');
        if (isCaptcha) {
          console.log('CAPTCHA Detected on scraper.');
        }
        throw err; // Re-throw to be caught by the route handler
    } finally {
        await browser.close();
    }
};


// --- API Routes ---

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize browser session for search
app.post('/api/search/initialize', async (req, res) => {
  const { searchQuery } = req.body;
  try {
    const success = await initializeSearchBrowser(searchQuery);
    if (success) {
      res.json({ success: true, message: 'Search browser initialized successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to initialize search browser' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available filters for search
app.get('/api/search/filters', async (req, res) => {
  try {
    const filters = await scrapeFilters();
    res.json({ success: true, filters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Click a filter option for search
app.post('/api/search/click-filter', async (req, res) => {
  const { filterId, optionIndex } = req.body;
  try {
    const success = await clickFilter(filterId, parseInt(optionIndex, 10));
    if (success) {
      const updatedFilters = await scrapeFilters();
      res.json({ success: true, message: 'Filter clicked successfully', filters: updatedFilters });
    } else {
      res.status(500).json({ success: false, message: 'Failed to click filter' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Close browser session for search
app.post('/api/search/close', async (req, res) => {
  try {
    if (searchBrowser) {
      await searchBrowser.close();
      searchBrowser = null;
      searchPage = null;
      availableFilters = [];
      console.log('🔒 Search browser closed');
    }
    res.json({ success: true, message: 'Search browser closed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Scrape a single product page
app.post('/api/scrape/product', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ success: false, message: 'Product URL is required.' });
    }

    try {
        const data = await scrapeAmazonProduct(url);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: `Failed to scrape product: ${error.message}` });
    }
});


// --- Server Start ---

app.listen(PORT, () => {
  console.log(`🚀 Amazon API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (searchBrowser) {
    await searchBrowser.close();
  }
  process.exit(0);
});
