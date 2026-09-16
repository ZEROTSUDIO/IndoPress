/**
 * IndoPress - Main Orchestrator
 * Connects the data layer (api.js) with the presentation layer (ui.js).
 */

import { fetchArticles } from './api.js';
import { renderCards, renderSkeleton, updateStatusBadge } from './ui.js';

let appState = {
  articles: [],
  isMock: false,
  totalResults: 0
};

/**
 * Initializes the dashboard application.
 */
async function initApp() {
  const gridElem = document.getElementById('article-grid');
  const countElem = document.getElementById('article-count');
  const badgeElem = document.getElementById('data-status-badge');

  // 1. Display skeleton loaders while retrieving data
  if (gridElem) {
    renderSkeleton(gridElem, 6);
  }

  try {
    // 2. Fetch categorized articles (via proxy / live API / mock fallback)
    const result = await fetchArticles();

    appState.articles = result.articles || [];
    appState.isMock = result.isMock;
    appState.totalResults = result.totalResults || appState.articles.length;

    // 3. Update status indicators
    if (badgeElem) {
      updateStatusBadge(badgeElem, appState.isMock, appState.articles.length);
    }
    if (countElem) {
      countElem.textContent = String(appState.articles.length);
    }

    // 4. Render interactive article cards
    if (gridElem) {
      renderCards(appState.articles, gridElem);
    }

    console.log(`[IndoPress] Successfully rendered ${appState.articles.length} articles (Mock: ${appState.isMock})`);
  } catch (err) {
    console.error('[IndoPress] Initialization failed:', err);
    if (gridElem) {
      gridElem.innerHTML = `
        <div class="col-span-full p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold">Failed to load articles.</p>
          <p class="text-sm mt-1">${err.message}</p>
        </div>
      `;
    }
  }
}

// Bootstrap when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}

export { initApp, appState };
