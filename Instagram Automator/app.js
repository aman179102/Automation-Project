require('dotenv').config();
const { IgApiClient } = require('instagram-private-api');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ======================
// UTILITY FUNCTIONS
// ======================
const utilities = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  randomDelay: () => utilities.delay(3000 + Math.random() * 5000),
  logToFile: (message) => {
    const logEntry = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync('bot.log', logEntry);
    console.log(message);
  }
};

// ======================
// CONSTANTS
// ======================
const HINGLISH_KEYWORDS = [
  'desi%20memes',
  'indian%20memes',
  'hinglish%20memes',
  'hindi%20memes',
  'aaj%20ka%20trending%20meme'
];

// ======================
// PINTEREST SCRAPER
// ======================
async function getSafeMeme(keyword = 'funny%20memes') {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--remote-debugging-address=0.0.0.0'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
  });

  let retries = 3;
  let page;
  
  while (retries > 0) {
    try {
      page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });

      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      utilities.logToFile(`Loading Pinterest for keyword: ${keyword}`);
      await page.goto(`https://www.pinterest.com/search/pins/?q=${keyword}&rs=typed`, {
        waitUntil: 'networkidle2',
        timeout: 120000
      });

      utilities.logToFile('Page loaded, scrolling...');
      await utilities.randomDelay();

      // Scroll multiple times to load more content
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 1500));
        await utilities.delay(2000);
      }

      const memeUrls = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .map(img => {
            let src = img.src;
            // Improve image quality by getting original size
            if (src.includes('/236x/')) src = src.replace('/236x/', '/originals/');
            else if (src.includes('/474x/')) src = src.replace('/474x/', '/originals/');
            else if (src.includes('/736x/')) src = src.replace('/736x/', '/originals/');
            return src;
          })
          .filter(src =>
            src.startsWith('https://i.pinimg.com/originals/') &&
            /\.(jpg|jpeg|png)$/i.test(src)
          );
      });

      if (!memeUrls.length) throw new Error('No copyright-safe memes found');
      
      const selectedUrl = memeUrls[Math.floor(Math.random() * memeUrls.length)];
      utilities.logToFile(`Selected meme URL: ${selectedUrl}`);
      return selectedUrl;

    } catch (error) {
      utilities.logToFile(`Attempt ${4-retries} failed: ${error.message}`);
      retries--;
      if (retries === 0) throw error;
      await utilities.delay(10000);
    } finally {
      if (page) await page.close();
      await browser.close();
    }
  }
}

// ======================
// INSTAGRAM POSTER
// ======================
async function safeInstagramPost(imagePath) {
  const ig = new IgApiClient();
  ig.state.generateDevice(process.env.INSTA_USERNAME);

  const sessionPath = path.join(__dirname, 'ig-session.json');

  try {
    // Session management
    if (fs.existsSync(sessionPath)) {
      const savedSession = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      await ig.state.deserialize(savedSession);
      utilities.logToFile('✅ Restored previous Instagram session');
    } else {
      utilities.logToFile('🔐 Logging in...');
      await ig.account.login(process.env.INSTA_USERNAME, process.env.INSTA_PASSWORD);
      const session = await ig.state.serialize();
      delete session.constants;
      fs.writeFileSync(sessionPath, JSON.stringify(session));
      utilities.logToFile('✅ Logged in and saved session');
    }

    // Generate random caption
    const captions = [
      `😂 Daily dose of laughter for you! ${Math.random() > 0.5 ? 'Hope this makes your day better!' : 'Enjoy!'}\n\n` +
      `Credits to original creator 🙏\n` +
      `#memes #funny #viral #trending #comedy #lol #memesdaily #indianmemes #desimemes #fun`,
      
      `🤣 Just found this gem! ${Math.random() > 0.5 ? 'Couldn\'t stop laughing!' : 'Too relatable!'}\n\n` +
      `Credit to the creator 👍\n` +
      `#funny #memes #viral #trending #laugh #comedy #indianmemes #desimemes #dankmemes`
    ];

    const caption = captions[Math.floor(Math.random() * captions.length)];

    utilities.logToFile('📤 Uploading post...');
    await utilities.randomDelay();
    
    // Upload the photo
    await ig.publish.photo({
      file: await fs.promises.readFile(imagePath),
      caption: caption,
    });

    utilities.logToFile('✅ Post successful!');
    await utilities.delay(10000);

  } catch (error) {
    utilities.logToFile(`❌ Instagram error: ${error.message}`);
    
    // Handle checkpoint required
    if (error.message.includes('checkpoint')) {
      utilities.logToFile('❌ Instagram requires checkpoint verification!');
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
      }
    }
    throw error;
  }
}

// ======================
// MAIN FUNCTION
// ======================
async function main() {
  let tempFile;
  try {
    // Alternate between English and Hinglish memes
    const useHinglish = Math.random() > 0.5;
    const keyword = useHinglish 
      ? HINGLISH_KEYWORDS[Math.floor(Math.random() * HINGLISH_KEYWORDS.length)]
      : 'funny%20memes';

    utilities.logToFile(`🔍 Finding a ${useHinglish ? 'Hinglish' : 'English'} meme...`);
    utilities.logToFile(`🔍 Searching Pinterest for: ${decodeURIComponent(keyword)}`);
    
    const memeUrl = await getSafeMeme(keyword);
    utilities.logToFile(`📌 Selected meme: ${memeUrl}`);

    // Download the image
    tempFile = path.join(__dirname, `meme_${Date.now()}.jpg`);
    const response = await axios({
      url: memeUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000
    });

    await new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(tempFile))
        .on('finish', resolve)
        .on('error', reject);
    });

    utilities.logToFile('📤 Posting to Instagram...');
    await safeInstagramPost(tempFile);

  } catch (error) {
    utilities.logToFile(`❌ Main function error: ${error.message}`);
    
    // Handle rate limits
    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      const waitHours = 1 + Math.random() * 2; // 1-3 hours
      utilities.logToFile(`⏳ Rate limited, waiting ${waitHours.toFixed(1)} hours...`);
      await utilities.delay(waitHours * 60 * 60 * 1000);
    }
    // Handle Puppeteer connection errors
    else if (error.message.includes('Protocol error') || error.message.includes('Connection closed')) {
      const waitHours = 3 + Math.random() * 2; // 3-5 hours
      utilities.logToFile(`⚠️ Cloud environment error, waiting ${waitHours.toFixed(1)} hours...`);
      await utilities.delay(waitHours * 60 * 60 * 1000);
    }
  } finally {
    // Clean up downloaded file
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlink(tempFile, () => {});
    }
  }
}

// ======================
// EXECUTION BLOCK
// ======================
(async () => {
  utilities.logToFile('🚀 Starting Instagram Meme Bot');
  
  while (true) {
    try {
      await main();
      
      // Random delay between posts (40-120 minutes)
      const delayInMinutes = Math.floor(Math.random() * 81) + 40;
      utilities.logToFile(`🕒 Waiting ${delayInMinutes} minutes before next post...`);
      await utilities.delay(delayInMinutes * 60 * 1000);
      
    } catch (error) {
      utilities.logToFile(`💥 Fatal error: ${error.message}`);
      // Wait 3 hours if fatal error occurs
      await utilities.delay(3 * 60 * 60 * 1000);
    }
  }
})();
