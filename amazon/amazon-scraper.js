import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUseragent from 'random-useragent';
import { Telnet } from 'telnet-client';

puppeteer.use(StealthPlugin());

// Configuration
const USE_PROXY = false; // Set to true to enable Tor proxy

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

const getDesktopUserAgent = () => {
  const desktopUserAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0'
  ];
  
  return desktopUserAgents[Math.floor(Math.random() * desktopUserAgents.length)];
};

const performRandomMouseMovements = async (page) => {
  console.log('🖱️ Performing random mouse movements...');
  
  const viewport = await page.viewport();
  const movements = 5 + Math.floor(Math.random() * 5); // 5-10 movements
  
  for (let i = 0; i < movements; i++) {
    const x = Math.floor(Math.random() * viewport.width);
    const y = Math.floor(Math.random() * viewport.height);
    
    // Random movement with easing
    await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
    
    // Random delay between movements
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
    
    // Occasionally do a click (10% chance)
    if (Math.random() < 0.1) {
      await page.mouse.click(x, y);
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
    }
  }
  
  console.log(`✅ Completed ${movements} random mouse movements`);
};

const waitForAllSelectors = async (page) => {
  console.log('⏳ Waiting for all selectors to load...');
  
  const selectors = [
    'span.a-price-whole',
    'img.a-dynamic-image',
    '#landingImage',
    '.a-color-secondary.a-size-base.prodDetSectionEntry',
    '.a-size-base.prodDetAttrValue'
  ];
  
  const selectorPromises = selectors.map(selector => 
    page.waitForSelector(selector, { timeout: 10000 }).catch(() => {
      console.log(`⚠️ Selector "${selector}" not found within timeout`);
      return null;
    })
  );
  
  await Promise.allSettled(selectorPromises);
  console.log('✅ Finished waiting for selectors');
};

const waitForProductAndLandingImages = async (page) => {
  console.log('🖼️ Checking for product and landing images...');
  
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`🔍 Attempt ${attempts} - Checking for images...`);
    
    const hasImages = await page.evaluate(() => {
      const landingImage = document.querySelector('#landingImage');
      const dynamicImages = document.querySelectorAll('img.a-dynamic-image');
      return {
        hasLanding: !!landingImage,
        hasDynamic: dynamicImages.length > 0,
        totalDynamic: dynamicImages.length
      };
    });
    
    console.log(`📊 Image status: Landing=${hasImages.hasLanding}, Dynamic=${hasImages.hasDynamic} (${hasImages.totalDynamic} found)`);
    
    if (hasImages.hasLanding || hasImages.hasDynamic) {
      console.log('✅ Images found, proceeding...');
      return true;
    }
    
    console.log('⚠️ No images found, trying to expand product specifications...');
    
    try {
      // Try to click the product specifications expander
      const expanderClicked = await page.evaluate(() => {
        const expander = document.querySelector('#productSpecifications-expander-link');
        if (expander && expander.offsetParent !== null) { // Check if element is visible
          expander.click();
          return true;
        }
        return false;
      });
      
      if (expanderClicked) {
        console.log('✅ Clicked productSpecifications-expander-link');
        
        // Wait for content to load after clicking
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Perform mouse movements after expansion
        await performRandomMouseMovements(page);
        
        // Wait a bit more for images to load
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('⚠️ productSpecifications-expander-link not found or not visible');
        
        // Try alternative expander selectors
        const alternativeExpanderClicked = await page.evaluate(() => {
          const selectors = [
            'a[data-action="a-expander-toggle"][aria-label*="specification"]',
            'a[data-action="a-expander-toggle"][aria-label*="Specification"]',
            'a[href*="specification"]',
            '.a-expander-header',
            '[data-csa-c-element-id*="expander"]'
          ];
          
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.offsetParent !== null) {
              element.click();
              return { clicked: true, selector };
            }
          }
          return { clicked: false, selector: null };
        });
        
        if (alternativeExpanderClicked.clicked) {
          console.log(`✅ Clicked alternative expander: ${alternativeExpanderClicked.selector}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await performRandomMouseMovements(page);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log('⚠️ No expander links found');
        }
      }
      
    } catch (expanderError) {
      console.log('❌ Error clicking expander:', expanderError.message);
    }
    
    // If this is not the last attempt, wait before trying again
    if (attempts < maxAttempts) {
      console.log(`⏳ Waiting 3 seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('⚠️ Max attempts reached, proceeding with scraping anyway...');
  return false;
};

const scrapeProductDetails = async (page) => {
  return await page.evaluate(() => {
    const detailEntries = document.querySelectorAll('.a-color-secondary.a-size-base.prodDetSectionEntry');
    const detailValues = document.querySelectorAll('.a-size-base.prodDetAttrValue');
    
    const details = [];
    
    // Method 1: Using raw HTML - sequential matching
    for (let i = 0; i < Math.max(detailEntries.length, detailValues.length); i++) {
      const entry = detailEntries[i];
      const value = detailValues[i];
      
      details.push({
        entry: entry ? {
          text: entry.textContent.trim(),
          rawHTML: entry.outerHTML
        } : null,
        value: value ? {
          text: value.textContent.trim(),
          rawHTML: value.outerHTML
        } : null
      });
    }
    
    // Method 2: Alternative approach - find pairs within common parent containers
    const detailRows = document.querySelectorAll('tr, .a-row, [class*="detail"]');
    const pairedDetails = [];
    
    detailRows.forEach((row, index) => {
      const entry = row.querySelector('.a-color-secondary.a-size-base.prodDetSectionEntry');
      const value = row.querySelector('.a-size-base.prodDetAttrValue');
      
      if (entry || value) {
        pairedDetails.push({
          rowIndex: index,
          entry: entry ? {
            text: entry.textContent.trim(),
            rawHTML: entry.outerHTML
          } : null,
          value: value ? {
            text: value.textContent.trim(),
            rawHTML: value.outerHTML
          } : null
        });
      }
    });
    
    return {
      method1_sequential: details,
      method2_paired: pairedDetails,
      totalEntries: detailEntries.length,
      totalValues: detailValues.length
    };
  });
};

(async () => {
  // Only rotate Tor IP if proxy is enabled
  if (USE_PROXY) {
    await rotateTorIP();
  }
  
  // Configure browser launch arguments based on proxy setting
  const launchArgs = USE_PROXY 
    ? ['--proxy-server=socks5://127.0.0.1:9050']
    : [];
  
  const browser = await puppeteer.launch({
    headless: true, // Changed to headless
    args: launchArgs,
  });
  
  const page = await browser.newPage();
  
  // Set viewport to 1920x1080
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Use only desktop user agents
  const ua = getDesktopUserAgent();
  await page.setUserAgent(ua);
  console.log(`User-Agent: ${ua}`);

  try {
    await page.goto('https://www.amazon.in/ASUS-Vivobook-Windows-Backlit-E1504FA-LK321WS/dp/B0BTWCYPGV?dib=eyJ2IjoiMSJ9.V17KBn8n9WX2PaKtK6AnfVy15iuOYpYt2GgsxDqM8nhMCn3HtERMdNtKtlzX8PidbxPRafcdrwwyQ-gPRx7qtdE&dib_tag=se&keywords=laptop%2Basus%2Boled&nsdOptOutParam=true&qid=1753717631&s=computers&sr=1-2&th=1', { 
      waitUntil: 'domcontentloaded' 
    });
    console.log('✅ Page navigation started');

    // Wait for all important selectors to load
    await waitForAllSelectors(page);
    
    // Wait for product and landing images, expand specifications if needed
    await waitForProductAndLandingImages(page);
    
    // Perform random mouse movements to simulate human behavior
    await performRandomMouseMovements(page);
    
    // Wait 0.2 seconds before scraping
    console.log('⏳ Waiting 0.2 seconds before scraping...');
    await new Promise(resolve => setTimeout(resolve, 200));

    // First scraping attempt
    console.log('📋 First attempt at scraping product details...');
    let productDetails = await scrapeProductDetails(page);
    
    // Check if we found product details, if not try clicking the expander
    if (productDetails.method1_sequential.length === 0 && productDetails.method2_paired.length === 0) {
      console.log('🔍 No product details found, looking for additional expanders...');
      
      try {
        // Look for any remaining expander links
        const expanderSelector = 'a[data-action="a-expander-toggle"], .a-expander-header, [data-csa-c-element-id*="expander"]';
        
        const expanderFound = await page.$(expanderSelector);
        if (expanderFound) {
          console.log('✅ Found additional expander, clicking...');
          
          await page.click(expanderSelector);
          
          // Wait for the expanded content to load
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Perform additional mouse movements after expansion
          await performRandomMouseMovements(page);
          
          // Wait 0.2 seconds before re-scraping
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Try scraping again after expanding
          console.log('📋 Re-attempting to scrape product details after expansion...');
          productDetails = await scrapeProductDetails(page);
        } else {
          console.log('⚠️ No additional expanders found');
        }
        
      } catch (expanderErr) {
        console.log('⚠️ Could not find or click additional expanders:', expanderErr.message);
      }
    }

    // Scrape price elements
    const prices = await page.evaluate(() => {
      const priceElements = document.querySelectorAll('span.a-price-whole');
      return Array.from(priceElements).map(el => ({
        text: el.textContent.trim(),
        innerHTML: el.innerHTML
      }));
    });

    // Scrape image elements
    const images = await page.evaluate(() => {
      const imageElements = document.querySelectorAll('img.a-dynamic-image');
      return Array.from(imageElements).map(el => ({
        src: el.src,
        alt: el.alt,
        width: el.width,
        height: el.height
      }));
    });

    // Scrape landing image specifically
    const landingImage = await page.evaluate(() => {
      const landingImg = document.querySelector('#landingImage');
      if (landingImg) {
        return {
          src: landingImg.src,
          alt: landingImg.alt,
          width: landingImg.width,
          height: landingImg.height,
          id: landingImg.id,
          className: landingImg.className,
          rawHTML: landingImg.outerHTML
        };
      }
      return null;
    });

    // Print results
    console.log('\n=== SCRAPED DATA ===');
    console.log('\n📊 PRICES:');
    if (prices.length > 0) {
      prices.forEach((price, index) => {
        console.log(`Price ${index + 1}: ${price.text}`);
      });
    } else {
      console.log('No price elements found');
    }

    console.log('\n🖼️ IMAGES:');
    if (images.length > 0) {
      images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`);
        console.log(`  - Alt: ${img.alt}`);
        console.log(`  - Src: ${img.src}`);
        console.log(`  - Dimensions: ${img.width}x${img.height}`);
        console.log('');
      });
    } else {
      console.log('No dynamic images found');
    }

    console.log('\n🎯 LANDING IMAGE:');
    if (landingImage) {
      console.log(`Landing Image Details:`);
      console.log(`  - ID: ${landingImage.id}`);
      console.log(`  - Alt: ${landingImage.alt}`);
      console.log(`  - Src: ${landingImage.src}`);
      console.log(`  - Dimensions: ${landingImage.width}x${landingImage.height}`);
      console.log(`  - Class: ${landingImage.className}`);
      console.log(`  - Raw HTML: ${landingImage.rawHTML}`);
    } else {
      console.log('Landing image with ID "landingImage" not found');
    }

    console.log('\n📋 PRODUCT DETAILS:');
    if (productDetails.method1_sequential.length > 0) {
      console.log('\n--- Method 1: Sequential Matching (with Raw HTML) ---');
      productDetails.method1_sequential.forEach((detail, index) => {
        console.log(`\nDetail ${index + 1}:`);
        if (detail.entry) {
          console.log(`  Entry: ${detail.entry.text}`);
          console.log(`  Entry Raw HTML: ${detail.entry.rawHTML}`);
        }
        if (detail.value) {
          console.log(`  Value: ${detail.value.text}`);
          console.log(`  Value Raw HTML: ${detail.value.rawHTML}`);
        }
      });
    }

    if (productDetails.method2_paired.length > 0) {
      console.log('\n--- Method 2: Parent-Child Matching (with Raw HTML) ---');
      productDetails.method2_paired.forEach((detail, index) => {
        console.log(`\nPaired Detail ${index + 1}:`);
        if (detail.entry) {
          console.log(`  Entry: ${detail.entry.text}`);
          console.log(`  Entry Raw HTML: ${detail.entry.rawHTML}`);
        }
        if (detail.value) {
          console.log(`  Value: ${detail.value.text}`);
          console.log(`  Value Raw HTML: ${detail.value.rawHTML}`);
        }
      });
    }

    console.log(`\nFound ${productDetails.totalEntries} section entries and ${productDetails.totalValues} attribute values`);

    if (productDetails.method1_sequential.length === 0 && productDetails.method2_paired.length === 0) {
      console.log('No product detail entries or values found');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    
    const isCaptcha = await page.$('form[action*="Sorry"], iframe[src*="recaptcha"]');
    if (isCaptcha) {
      console.log('CAPTCHA Detected');
    }
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
  }
})();