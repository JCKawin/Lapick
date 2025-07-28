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
    headless: false,
    args: launchArgs,
  });
  
  const page = await browser.newPage();
  const ua = randomUseragent.getRandom();
  await page.setUserAgent(ua);
  console.log(`User-Agent: ${ua}`);

  try {
    await page.goto('https://www.amazon.in/ASUS-Vivobook-Windows-Backlit-E1504FA-LK321WS/dp/B0BTWCYPGV?dib=eyJ2IjoiMSJ9.V17KBn8n9WX2PaKtK6AnfVy15iuOYpYt2GgsxDqM8nhMCn3HtERMdNtKtlzX8PidbxPFjVNs1F0RfULAk2bz3uC_eabBb_gx6O9LEJ6bY2FOeHezijIRrLGVWZBDx4fvuYfnxfxRSXkUdERLWdyWeqKI09T4AL1Dh7PesjROWjmWLKeOHA39kc_SlNlpsj2tBN5FPI6fJMWTd-Ia0XiyGjUmvONN5qtoX919x9sAWkh4faaQzdIbt0QcJu1GpNna0-GEU1DVOfXGKJAfSVHVZ_iyJP1iOagYP2mkTItPpOM.gHROp71325bidLK-skww8RQrafcdrwwyQ-gPRx7qtdE&dib_tag=se&keywords=laptop%2Basus%2Boled&nsdOptOutParam=true&qid=1753717631&s=computers&sr=1-2&th=1', { 
      waitUntil: 'domcontentloaded' 
    });
    console.log('✅ Page navigation started');

    // Wait specifically for the elements we need instead of arbitrary delay
    console.log('⏳ Waiting for price and image elements...');
    
    try {
      // Wait for either price or image elements (whichever loads first)
      await Promise.race([
        page.waitForSelector('span.a-price-whole', { timeout: 15000 }),
        page.waitForSelector('img.a-dynamic-image', { timeout: 15000 })
      ]);
      console.log('✅ Target elements found');
    } catch (err) {
      console.log('⚠️ Elements not found within timeout, proceeding anyway...');
    }

    // Scroll down to scan the whole page for all elements
    console.log('📜 Scrolling through page to load all content...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    
    // Wait a moment for any lazy-loaded content after scrolling
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Page scroll completed');

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

    // Scrape product detail section entries and their corresponding values
    const productDetails = await page.evaluate(() => {
      const detailEntries = document.querySelectorAll('.a-color-secondary.a-size-base.prodDetSectionEntry');
      const detailValues = document.querySelectorAll('.a-size-base.prodDetAttrValue');
      
      const details = [];
      
      // Method 1: If entries and values are in the same order/structure
      for (let i = 0; i < Math.max(detailEntries.length, detailValues.length); i++) {
        const entry = detailEntries[i];
        const value = detailValues[i];
        
        details.push({
          entry: entry ? {
            text: entry.textContent.trim(),
            innerHTML: entry.innerHTML.trim()
          } : null,
          value: value ? {
            text: value.textContent.trim(),
            innerHTML: value.innerHTML.trim()
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
              innerHTML: entry.innerHTML.trim()
            } : null,
            value: value ? {
              text: value.textContent.trim(),
              innerHTML: value.innerHTML.trim()
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

    console.log('\n📋 PRODUCT DETAILS:');
    if (productDetails.method1_sequential.length > 0) {
      console.log('\n--- Method 1: Sequential Matching ---');
      productDetails.method1_sequential.forEach((detail, index) => {
        console.log(`\nDetail ${index + 1}:`);
        if (detail.entry) {
          console.log(`  Entry: ${detail.entry.text}`);
        }
        if (detail.value) {
          console.log(`  Value: ${detail.value.text}`);
        }
      });
    }

    if (productDetails.method2_paired.length > 0) {
      console.log('\n--- Method 2: Parent-Child Matching ---');
      productDetails.method2_paired.forEach((detail, index) => {
        console.log(`\nPaired Detail ${index + 1}:`);
        if (detail.entry) {
          console.log(`  Entry: ${detail.entry.text}`);
        }
        if (detail.value) {
          console.log(`  Value: ${detail.value.text}`);
        }
      });
    }

    console.log(`\nFound ${productDetails.totalEntries} section entries and ${productDetails.totalValues} attribute values`);

    if (productDetails.method1_sequential.length === 0 && productDetails.method2_paired.length === 0) {
      console.log('No product detail entries or values found');
    }

    // Keep browser open for viewing (optional - remove if not needed)
    console.log('\n⏳ Keeping browser open for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (err) {
    console.error('❌ Error:', err.message);
    
    const isCaptcha = await page.$('form[action*="Sorry"], iframe[src*="recaptcha"]');
    if (isCaptcha) {
      console.log('CAPTCHA Detected');
    }
  } finally {
    console.log('🔒 Closing browser...');
    // await browser.close();
  }
})();