# 🤖 Instagram Meme Poster Bot

A fully automated meme-posting bot that scrapes copyright-safe memes from Pinterest and posts them to Instagram — built using **Node.js**, **Puppeteer**, and the **Instagram Private API**.

> 🛠️ My **first automation project** — built after 1 month of learning, exploring docs, and solving real-world coding problems.

---

## 🚀 Features

- 📌 Scrapes high-quality memes from Pinterest
- 🤖 Automatically uploads memes to Instagram with random captions
- 🧠 Random delay and stealth techniques to mimic human behavior
- 🔁 Alternates between **English** and **Hinglish** meme categories
- 🔐 Supports session management for persistent login

---

## 🧰 Tech Stack

- [Node.js](https://nodejs.org/)
- [Puppeteer-extra](https://github.com/berstend/puppeteer-extra)
- [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
- [instagram-private-api](https://github.com/dilame/instagram-private-api)
- Axios, fs, path, dotenv

---

## 📁 Project Structure

📦 instagram-meme-bot
├── meme-poster.js
├── .env
├── ig-session.json
├── bot.log
├── package.json
└── node_modules/


---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/instagram-meme-bot.git
cd instagram-meme-bot
```

2. Install Dependencies
```bash
npm install
```
3. Create a .env File
 ```bash
INSTA_USERNAME=your_instagram_username
INSTA_PASSWORD=your_instagram_password
PUPPETEER_EXECUTABLE_PATH=/path/to/your/chromium (optional)
```
🧪 Run the Bot

node meme-poster.js

The bot will:

Scrape a meme

Download the image

Post it to Instagram

Wait 40–120 mins and repeat

⚠️ Disclaimer

This project is intended for educational purposes only.
Use responsibly and avoid violating any platform’s terms of service.

🌟 Like This Project?

If this helped you or inspired you, feel free to give it a ⭐ and share!
🙌 Author

Built by Your Name — learning in public and building one project at a time.


---

Let me know if you want:
- A minimal logo/banner
- GitHub tags and topics
- A license file (MIT recommended for open sharing)


