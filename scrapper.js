import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUseragent from 'random-useragent';
import { Telnet } from 'telnet-client';

puppeteer.use(StealthPlugin());

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
    console.log('🔁 Tor IP rotated');
  } catch (err) {
    console.warn('⚠️ Tor Control Error:', err.message);
  } finally {
    connection.end();
  }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const testSearch = async (query, count = 100) => {
  for (let i = 1; i <= count; i++) {
    console.log(`\n🔍 Attempt ${i}/${count} — "${query}"`);

    await rotateTorIP(); // IP rotation

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--proxy-server=socks5://127.0.0.1:9050'],
    });

    const page = await browser.newPage();
    const ua = randomUseragent.getRandom();
    await page.setUserAgent(ua);
    console.log(`🧭 User-Agent: ${ua}`);

    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

      // CAPTCHA detection
      const isCaptcha = await page.$('form[action*="Sorry"], iframe[src*="recaptcha"]');
      if (isCaptcha) {
        console.log('🛑 CAPTCHA Detected');
      } else {
        console.log('✅ Search successful (no CAPTCHA)');

        // Get top 2 search result links
        const links = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('a'));
          return anchors
            .map(a => a.href)
            .filter(h => h.startsWith('http') && !h.includes('google.com'))
            .slice(0, 2);
        });

        console.log('🔗 Top 2 Links:\n', links.join('\n'));
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
    } finally {
      await browser.close();
    }

    await delay(3000 + Math.random() * 3000); // Wait 3–6 sec
  }
};

const query = 'laptop';
testSearch(query, 100);
