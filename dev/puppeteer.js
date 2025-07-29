import { Cluster } from 'puppeteer-cluster';
import fetch from 'node-fetch';
import { logger } from './utils/logger.js';
import fs from "node:fs";
import path from "node:path";
import { SCRIPT_TO_INJECT_INTO_FRAME } from "./inject-script.js";
import { JSDOM, VirtualConsole } from "jsdom";
import TurndownService from 'turndown';
import natural from 'natural';

let cluster;
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

export async function initBrowser() {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const tmpUserDir = path.join(__dirname, 'tmpusr');
    if (fs.existsSync(tmpUserDir)) {
        fs.rmSync(tmpUserDir, { recursive: true, force: true });
        logger.info('Deleted tmpusr directory');
    }
    logger.info('Initializing browser cluster...');
    cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 32,
        puppeteerOptions: {
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
                "--user-data-dir=./tmpusr",
                "--js-flags=--expose-gc",
                "--disable-extensions",
                "--disable-component-extensions-with-background-pages",
                "--disable-default-apps",
                "--mute-audio",
                "--no-default-browser-check",
                "--no-first-run",
            ],
            defaultViewport: { width: 1920, height: 1080 },
        },
    });

    await cluster.task(async ({ page, data: url }) => {
        const blockedDomains = [
            'googlesyndication.com',
            'doubleclick.net',
            'facebook.com',
            'google-analytics.com',
        ];
        
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const url = request.url();
            if (
                ['image', 'media', 'font', 'stylesheet'].includes(request.resourceType()) ||
                blockedDomains.some(domain => url.includes(domain))
            ) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(url, {
            waitUntil: ["domcontentloaded"],
            timeout: 10000,
        });

        await page.evaluate(SCRIPT_TO_INJECT_INTO_FRAME.toString());
        return await page.evaluate("giveSnapshot(true)");
    });
}

export async function closeBrowser() {
    if (cluster) {
        await cluster.close();
        logger.info('Browser cluster closed');
    }
}

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", () => void 0);

// Add this function to score text relevance
function scoreContent(text, query) {
    if (!text.trim()) return 0;
    
    const words = tokenizer.tokenize(text.toLowerCase()) || [];
    const queryWords = tokenizer.tokenize(query.toLowerCase()) || [];
    
    // Calculate TF-IDF score
    tfidf.addDocument(text);
    let score = 0;
    
    queryWords.forEach((word) => {
        score += tfidf.tfidf(word, 0);
    });
    
    // Add bonus for text length and density
    score += Math.log(words.length) * 0.1;
    
    return score;
}

// Add this function to extract top content blocks
function extractTopContent(dom, query) {
    const contentBlocks = [];
    
    // Select all potential content containers
    const containers = dom.window.document.querySelectorAll('p');
    
    containers.forEach((container) => {
        const text = container.textContent || '';
        if (text.length < 50) return; // Skip very short blocks
        
        const score = scoreContent(text, query);
        contentBlocks.push({ element: container, score });
    });
    
    // Sort by score and take top 5
    const topBlocks = contentBlocks
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(block => block.element.outerHTML)
        .join('\n');
        
    return topBlocks;
}

export async function scrapeUrl(url, query) {
    if (!cluster) {
        throw new Error("Browser cluster not initialized. Please call initBrowser() first.");
    }
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.content;
    }

    if (url.includes('gist.github.com')) {
        const gistUrlPattern = /https:\/\/gist\.github\.com\/([^\/]+)\/([a-f0-9]+)(?:\/([a-f0-9]+))?/;
        const match = url.match(gistUrlPattern);
        if (match) {
            const [, user, gistId, revisionId] = match;
            let rawUrl = `https://gist.githubusercontent.com/${user}/${gistId}/raw`;
            if (revisionId) rawUrl += `/${revisionId}`;
            
            const response = await fetch(rawUrl);
            if (!response.ok) throw new Error(`Failed to fetch Gist: ${response.statusText}`);
            const content = await response.text();
            cache.set(url, { content, timestamp: Date.now() });
            return content;
        }
        throw new Error('Invalid GitHub Gist URL');
    }

    const snapshot = await cluster.execute(url);
    
    const parsed = new JSDOM(snapshot.parsed?.content || "", {
        url: snapshot.href || url,
        virtualConsole,
    });
    
    // Extract relevant content before markdown conversion
    const relevantContent = extractTopContent(parsed, query); // Use the global query variable
    const contentDom = new JSDOM(relevantContent, {
        url: snapshot.href || url,
        virtualConsole,
    });

    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        linkStyle: 'referenced',
    });

    // Common turndown rules
    turndownService.addRule('removeEmptyParagraphs', {
        filter: ['p'],
        replacement: function (content) {
            return content.trim() ? '\n\n' + content + '\n\n' : '';
        }
    });



    const markdown = turndownService.turndown(contentDom.serialize());
    cache.set(url, { content: markdown, timestamp: Date.now() });
    return markdown;
}