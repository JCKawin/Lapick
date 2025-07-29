// Amazon Filter Selection Express Server
import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Telnet } from 'telnet-client';
import path from 'path';

puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configuration
const USE_PROXY = false;
let SEARCH_QUERY = 'laptop';
let currentPage = null;
let browser = null;
let availableFilters = [];

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

// Initialize browser and navigate to Amazon
const initializeBrowser = async (searchQuery = 'laptop') => {
  try {
    if (USE_PROXY) {
      await rotateTorIP();
    }

    const launchArgs = USE_PROXY ? ['--proxy-server=socks5://127.0.0.1:9050'] : [];
    
    browser = await puppeteer.launch({
      headless: false, // Set to false so you can see the browser
      args: launchArgs,
    });

    currentPage = await browser.newPage();
    await currentPage.setViewport({ width: 1920, height: 1080 });
    
    const ua = getDesktopUserAgent();
    await currentPage.setUserAgent(ua);
    console.log(`User-Agent: ${ua}`);

    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`;
    console.log(`🔍 Navigating to: ${searchUrl}`);
    
    await currentPage.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    console.log('✅ Search page navigation completed');

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    return true;
  } catch (error) {
    console.error('❌ Browser initialization error:', error);
    return false;
  }
};

// Scrape available filters
const scrapeFilters = async () => {
  if (!currentPage) {
    throw new Error('Browser not initialized');
  }

  console.log('🔍 Scraping available filters...');
  
  const filters = await currentPage.evaluate(() => {
    const allDivs = document.querySelectorAll('div[id]');
    const filterDivs = [];
    
    allDivs.forEach((div) => {
      const divId = div.id;
      
      if (divId && divId.includes('p_n_feature_') && divId.includes('browse-bin/')) {
        try {
          // Find spans with filter category names
          const targetSpans = div.querySelectorAll('span.a-size-base.a-color-base.puis-bold-weight-text');
          const categoryName = targetSpans.length > 0 ? targetSpans[0].textContent?.trim() : 'Unknown Category';
          
          // Find all list elements (filter options)
          const listElements = div.querySelectorAll('li');
          const filterOptions = [];
          
          listElements.forEach((li, index) => {
            const text = li.textContent?.trim();
            const input = li.querySelector('input[type="checkbox"]');
            const label = li.querySelector('label');
            
            if (text && input) {
              filterOptions.push({
                index: index + 1,
                text: text,
                inputId: input.id,
                inputName: input.name,
                inputValue: input.value,
                isChecked: input.checked,
                labelFor: label ? label.getAttribute('for') : null,
                // Store selector info for clicking
                selector: `#${input.id}`,
                parentLiHTML: li.outerHTML.substring(0, 200) + '...'
              });
            }
          });
          
          if (filterOptions.length > 0) {
            filterDivs.push({
              divId: divId,
              categoryName: categoryName,
              optionCount: filterOptions.length,
              options: filterOptions
            });
          }
        } catch (error) {
          console.error(`Error processing div ${divId}:`, error);
        }
      }
    });
    
    return filterDivs;
  });

  availableFilters = filters;
  console.log(`✅ Found ${filters.length} filter categories with ${filters.reduce((sum, f) => sum + f.optionCount, 0)} total options`);
  return filters;
};

// Click on a specific filter
const clickFilter = async (filterId, optionIndex) => {
  if (!currentPage) {
    throw new Error('Browser not initialized');
  }

  try {
    const filter = availableFilters.find(f => f.divId === filterId);
    if (!filter || !filter.options[optionIndex]) {
      throw new Error('Filter or option not found');
    }

    const option = filter.options[optionIndex];
    console.log(`🖱️ Clicking filter: ${filter.categoryName} - ${option.text}`);
    console.log(`Selector: ${option.selector}`);

    // Wait for the element and click it
    await currentPage.waitForSelector(option.selector, { timeout: 5000 });
    await currentPage.click(option.selector);
    
    // Wait for page to update after filter click
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✅ Successfully clicked filter option`);
    return true;
  } catch (error) {
    console.error('❌ Error clicking filter:', error.message);
    return false;
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize browser session
app.post('/api/initialize', async (req, res) => {
  const { searchQuery } = req.body;
  SEARCH_QUERY = searchQuery || 'laptop';
  
  try {
    const success = await initializeBrowser(SEARCH_QUERY);
    if (success) {
      res.json({ success: true, message: 'Browser initialized successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to initialize browser' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available filters
app.get('/api/filters', async (req, res) => {
  try {
    const filters = await scrapeFilters();
    res.json({ success: true, filters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Click a filter option
app.post('/api/click-filter', async (req, res) => {
  const { filterId, optionIndex } = req.body;
  
  try {
    const success = await clickFilter(filterId, optionIndex);
    if (success) {
      // Re-scrape filters to get updated state
      const updatedFilters = await scrapeFilters();
      res.json({ success: true, message: 'Filter clicked successfully', filters: updatedFilters });
    } else {
      res.status(500).json({ success: false, message: 'Failed to click filter' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Close browser session
app.post('/api/close', async (req, res) => {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      currentPage = null;
      availableFilters = [];
      console.log('🔒 Browser closed');
    }
    res.json({ success: true, message: 'Browser closed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Amazon Filter Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});