# IndoPress 🇮🇩 — Global News Intelligence Dashboard

> An API-driven data visualization dashboard that tracks and analyzes how the international press covers Indonesia in real time.

Built with **Vanilla JavaScript (ES6+)**, **Tailwind CSS**, **Chart.js**, and the **NewsAPI**.

---

## 🌟 Overview

**IndoPress** queries global, English-language news outlets for headlines specifically mentioning Indonesia. It parses, standardizes, and feeds them into a client-side analytics pipeline that features:

- **Automated Multi-Topic Classification** (97%+ accuracy across 7 news beats)
- **Publisher Analytics** (Tracking the most active foreign outlets covering Indonesia)
- **Topical Breakdown & Share** (Donut distribution chart)
- **Buzzword Extraction** (Stopword-filtered keyword pills)
- **Live Search & Multi-Criteria Filtering** (Instant search, source filter, sorting, and reading list)

---

## 🚀 Live Preview & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  NAVBAR — IndoPress Brand | Status Badge | Relative Timer | [Refresh]  │
├────────────────────────────────────────────────────────────────────────┤
│  STATS ROW — Total Stories | Global Outlets | Dominant Topic | Freshness│
├────────────────────────────────────┬───────────────────────────────────┤
│  📊 SOURCE TRACKER (Bar Chart)     │  🍩 TOPIC BREAKDOWN (Donut Chart) │
├────────────────────────────────────┴───────────────────────────────────┤
│  🏷️ TRENDING KEYWORD CLOUD (Clickable frequency buzzword pills)         │
├────────────────────────────────────────────────────────────────────────┤
│  CONTROLS — [Search...] | [All Sources ▼] | [Sort By ▼]                │
│  CHIPS    — [All] [Saved] [Politics] [Economy] [Environment] ...       │
├────────────────────────────────────────────────────────────────────────┤
│  RESPONSIVE ARTICLE CARDS GRID (1 col mobile, 2 tablet, 3 desktop)     │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │ 📷 Thumbnail │   │ 📷 Thumbnail │   │ 📷 Thumbnail │                │
│  │ 🏷️ Category  │   │ 🏷️ Category  │   │ 🏷️ Category  │                │
│  │ Headline     │   │ Headline     │   │ Headline     │                │
│  │ Source·Date  │   │ Source·Date  │   │ Source·Date  │                │
│  │ Read Story ↗ │   │ Read Story ↗ │   │ Read Story ↗ │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### 1. Automated Keyword-Based Categorizer
A rule-based classifier that categorizes headlines and descriptions into 7 distinct beats with multi-word phrase priority:
- 🏛️ **Politics**: Presidential actions, cabinet reshuffles, parliament, elections, governance.
- 💰 **Economy**: GDP, investments, trade, currency, tariffs, energy, oil, inflation, tech fines.
- 🌿 **Environment**: Severe weather, maritime disasters, climate policy, deforestation, conservation.
- 🌏 **Diplomacy**: Bilateral summits, treaties, ASEAN, BRICS, international partnerships.
- ⚽ **Sports**: Asian Games, SEA Games, football, badminton, gold medals, championships.
- 🏥 **Health**: Public healthcare, hospital facilities, screening, pandemic control.
- 📦 **Other**: General cultural, gastronomic, and miscellaneous coverage.

### 2. Data Visualizations (Chart.js)
- **Source Tracker Bar Chart**: Horizontal bar chart identifying which foreign outlets (e.g. *Reuters, CNA, Antara, Bloomberg, Associated Press*) publish the highest volume of Indonesian stories.
- **Topic Breakdown Donut Chart**: Proportional category distribution showing the prevailing themes in international coverage.

### 3. Headline Keyword Cloud
- A pure JavaScript text-analysis engine that tokenizes headlines, eliminates English stopwords (`the`, `and`, `for`) as well as search query redundancy (`indonesia`, `said`), and renders the top 20 buzzwords as frequency-sized badges.
- **Clickable**: Clicking any buzzword pill instantly filters the feed by that keyword.

### 4. Interactive Search & Filtering
- **Live Search**: Instant keyword filtering across headlines, excerpts, and news outlets.
- **Source Filter**: Dynamic dropdown auto-populated with active news publishers.
- **Sorting**: Latest First, Oldest First, and Alphabetical (A–Z).
- **Empty State**: Friendly zero-match alert with a single-click "Clear all filters" button.

### 5. Quick Stats Metric Row
- Real-time count of total stories, unique global outlets, the dominant category with percentage share, and the freshness of the latest dispatch.

### 6. Reading List / Bookmarks (`localStorage`)
- Bookmark any article using the card's bookmark icon (`🔖`).
- View saved articles anytime via the **"⭐ Saved"** filter chip, persisted locally across browser sessions.

### 7. Freshness & Background Refresh
- Real-time relative timer (*"Updated 2m ago"*).
- Manual **`[ 🔄 Refresh ]`** button with animated spin re-fetching latest dispatches.
- Automated background sync every 15 minutes.

---

## 📂 Project Structure

```
IndoPress/
├── index.html              # Main HTML entry point & responsive Tailwind shell
├── server.mjs              # Zero-dependency local Node.js static server & API proxy
├── api/
│   └── news.js             # Vercel serverless function (secure NewsAPI proxy)
├── src/
│   ├── main.js             # Application orchestrator, state management & listeners
│   ├── api.js              # NewsAPI fetcher, data normalizer & fallback pipeline
│   ├── categorizer.js      # Keyword classification engine (7 categories)
│   ├── charts.js           # Chart.js integration (Source Bar & Topic Donut)
│   ├── wordcloud.js        # Buzzword frequency extractor & pill renderer
│   ├── ui.js               # Dynamic DOM card rendering, skeletons, & metrics
│   └── mockData.js         # Realistic fallback dataset for offline/dev resilience
├── .env                    # Environment variables (NEWS_API_KEY) — Git-ignored
├── .gitignore              # Protects keys, node_modules, and cache files
├── README.md               # Project documentation
└── package.json
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- A free API key from [NewsAPI.org](https://newsapi.org/)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/indopress.git
   cd indopress
   ```

2. **Configure your API Key:**
   Create a `.env` file in the project root:
   ```env
   NEWS_API_KEY=your_news_api_key_here
   PORT=3000
   ```

3. **Start the local server:**
   ```bash
   node server.mjs
   ```

4. **Open in browser:**
   Navigate to: **`http://localhost:3000`**

*(If no API key is provided or if network limits are hit, IndoPress automatically falls back to its offline mock archive so you can develop uninterrupted).*

---

## ☁️ Deployment to Vercel

IndoPress is structured for instant zero-config deployment on Vercel:

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. In Vercel Project Settings, add an Environment Variable:
   - **Key**: `NEWS_API_KEY`
   - **Value**: `your_news_api_key_here`
4. Deploy! The serverless function in `api/news.js` will automatically handle requests from `/api/news` while keeping your API key protected from client inspection.

---

## ⚖️ License
MIT License. Free for portfolio, educational, and non-commercial use.
