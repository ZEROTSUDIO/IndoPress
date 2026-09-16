/**
 * IndoPress - Main Orchestrator
 * Connects data layer, categorizer, presentation layer, charts, word cloud, stats, and bookmarks.
 */

import { fetchArticles } from './api.js';
import { CATEGORIES } from './categorizer.js';
import {
  renderCards,
  renderSkeleton,
  updateStatusBadge,
  renderCategoryChips,
  populateSourceFilter,
  renderStatsRow,
  getBookmarks,
  formatRelativeTime
} from './ui.js';
import { renderDashboardCharts } from './charts.js';
import { extractKeywords, renderWordCloud } from './wordcloud.js';

// Application Data State
export const appState = {
  articles: [],
  isMock: false,
  totalResults: 0
};

// Application Filter State
export const filterState = {
  selectedCategory: 'all', // 'all' | 'bookmarks' | categoryId
  searchQuery: '',
  selectedSource: 'all',
  sortBy: 'latest' // 'latest' | 'oldest' | 'title'
};

// Timestamp tracking for relative "Updated X ago"
let lastFetchedAt = null;

// DOM References
let dom = {};

/**
 * Calculates article counts per category.
 * @param {Array} articles
 * @returns {object}
 */
export function computeCategoryCounts(articles) {
  const counts = { all: articles.length };
  Object.values(CATEGORIES).forEach(cat => {
    counts[cat.id] = 0;
  });

  articles.forEach(article => {
    const catId = article.category?.id || 'other';
    counts[catId] = (counts[catId] || 0) + 1;
  });

  return counts;
}

/**
 * Calculates unique news sources with their frequency.
 * @param {Array} articles
 * @returns {Array<{name: string, count: number}>}
 */
export function computeSources(articles) {
  const map = {};
  articles.forEach(a => {
    const src = a.source || 'Unknown Source';
    map[src] = (map[src] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Computes high-level overview metrics for the stats row.
 * @param {Array} articles
 * @param {Array} sources
 * @param {object} categoryCounts
 * @returns {object}
 */
export function computeStats(articles, sources, categoryCounts) {
  const totalArticles = articles.length;
  const totalSources = sources.length;

  // Find dominant topic (excluding 'all' and preferring non-other if tied)
  const validCategories = Object.entries(categoryCounts)
    .filter(([id]) => id !== 'all' && id !== 'other');

  let dominantCategory = null;
  if (validCategories.length > 0) {
    validCategories.sort((a, b) => b[1] - a[1]);
    const [topId, topCount] = validCategories[0];
    const categoryObj = Object.values(CATEGORIES).find(c => c.id === topId);
    if (categoryObj && topCount > 0) {
      dominantCategory = {
        ...categoryObj,
        count: topCount,
        percentage: Math.round((topCount / (totalArticles || 1)) * 100)
      };
    }
  }

  // Determine freshness
  let latestTimeFormatted = 'Recent';
  if (articles.length > 0) {
    const sorted = [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const newest = new Date(sorted[0].publishedAt);
    if (!isNaN(newest.getTime())) {
      latestTimeFormatted = formatRelativeTime(newest);
    }
  }

  return {
    totalArticles,
    totalSources,
    dominantCategory,
    latestTimeFormatted
  };
}

/**
 * Filters and sorts articles according to active filterState.
 * @returns {Array}
 */
export function getFilteredArticles() {
  const query = filterState.searchQuery.trim().toLowerCase();
  let baseArticles = appState.articles;

  // If "bookmarks" chip selected, filter from saved bookmarks
  if (filterState.selectedCategory === 'bookmarks') {
    const bookmarks = getBookmarks();
    baseArticles = bookmarks;
  }

  return baseArticles
    .filter(article => {
      // 1. Category filter (if not 'all' and not 'bookmarks')
      if (filterState.selectedCategory !== 'all' && filterState.selectedCategory !== 'bookmarks') {
        const catId = article.category?.id || 'other';
        if (catId !== filterState.selectedCategory) return false;
      }

      // 2. Source filter
      if (filterState.selectedSource !== 'all') {
        if (article.source !== filterState.selectedSource) return false;
      }

      // 3. Search query filter (matches title, description, or source)
      if (query) {
        const matchTitle = (article.title || '').toLowerCase().includes(query);
        const matchDesc = (article.description || '').toLowerCase().includes(query);
        const matchSource = (article.source || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchSource) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filterState.sortBy === 'latest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (filterState.sortBy === 'oldest') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      }
      if (filterState.sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
}

/**
 * Applies active filters, re-renders article cards, and updates UI indicators.
 */
export function applyFilters() {
  const filtered = getFilteredArticles();

  // Render cards with reset & bookmark change callbacks
  if (dom.grid) {
    renderCards(filtered, dom.grid, resetAllFilters, () => {
      // On bookmark toggle, refresh bookmark chip count
      refreshCategoryChips();
      if (filterState.selectedCategory === 'bookmarks') {
        applyFilters();
      }
    });
  }

  // Update item count pill
  if (dom.count) {
    dom.count.textContent = String(filtered.length);
  }

  // Toggle search clear button
  if (dom.searchClearBtn) {
    if (filterState.searchQuery) {
      dom.searchClearBtn.classList.remove('hidden');
    } else {
      dom.searchClearBtn.classList.add('hidden');
    }
  }
}

/**
 * Resets all search and filter controls to default.
 */
export function resetAllFilters() {
  filterState.selectedCategory = 'all';
  filterState.searchQuery = '';
  filterState.selectedSource = 'all';
  filterState.sortBy = 'latest';

  if (dom.searchInput) dom.searchInput.value = '';
  if (dom.sourceFilter) dom.sourceFilter.value = 'all';
  if (dom.sortSelect) dom.sortSelect.value = 'latest';

  refreshCategoryChips();
  applyFilters();
}

/**
 * Re-renders the category filter chips bar including bookmarks count.
 */
function refreshCategoryChips() {
  if (!dom.chipsContainer) return;
  const counts = computeCategoryCounts(appState.articles);
  const bookmarks = getBookmarks();

  renderCategoryChips({
    container: dom.chipsContainer,
    categories: CATEGORIES,
    activeCategory: filterState.selectedCategory,
    counts,
    bookmarkCount: bookmarks.length,
    onSelect: (catId) => {
      filterState.selectedCategory = catId;
      refreshCategoryChips();
      applyFilters();
    }
  });
}

/**
 * Renders data visualizations (bar chart, donut chart, word cloud).
 */
function setupAnalytics() {
  const sources = computeSources(appState.articles);
  const categoryCounts = computeCategoryCounts(appState.articles);

  // 1. Render Chart.js charts
  renderDashboardCharts({
    sourceCanvas: dom.sourceChart,
    topicCanvas: dom.topicChart,
    sources,
    categoryCounts,
    categories: CATEGORIES
  });

  // 2. Extract and render keyword cloud
  const keywords = extractKeywords(appState.articles, 20);
  renderWordCloud(dom.wordCloudContainer, keywords, (clickedWord) => {
    filterState.searchQuery = clickedWord;
    if (dom.searchInput) {
      dom.searchInput.value = clickedWord;
      dom.searchInput.focus();
    }
    applyFilters();
  });
}

/**
 * Fetches data and updates all UI sections (stats, charts, chips, feed).
 */
async function loadData(isRefresh = false) {
  if (!isRefresh && dom.grid) {
    renderSkeleton(dom.grid, 6);
  }

  try {
    const result = await fetchArticles();
    appState.articles = result.articles || [];
    appState.isMock = result.isMock;
    appState.totalResults = result.totalResults || appState.articles.length;
    lastFetchedAt = new Date();

    const sources = computeSources(appState.articles);
    const categoryCounts = computeCategoryCounts(appState.articles);

    // 1. Update Connection Badge
    if (dom.badge) {
      updateStatusBadge(dom.badge, appState.isMock, appState.articles.length);
    }

    // 2. Update Stats Row
    if (dom.statsRow) {
      const stats = computeStats(appState.articles, sources, categoryCounts);
      renderStatsRow(stats, dom.statsRow);
    }

    // 3. Populate Category Chips & Source Filter
    refreshCategoryChips();
    if (dom.sourceFilter) {
      populateSourceFilter(dom.sourceFilter, sources, filterState.selectedSource);
    }

    // 4. Initialize or update charts & word cloud
    setupAnalytics();

    // 5. Render cards
    applyFilters();

    // 6. Update last updated text
    if (dom.lastUpdatedText) {
      dom.lastUpdatedText.textContent = 'Updated just now';
    }

    console.log(`[IndoPress] Loaded ${appState.articles.length} articles (Mock: ${appState.isMock})`);
  } catch (err) {
    console.error('[IndoPress] Data retrieval failed:', err);
    if (dom.grid) {
      dom.grid.innerHTML = `
        <div class="col-span-full p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p class="font-bold">Failed to load articles.</p>
          <p class="text-sm mt-1">${err.message}</p>
        </div>
      `;
    }
  }
}

/**
 * Triggers a manual refresh with visual button animation.
 */
async function triggerRefresh() {
  if (dom.refreshIcon) {
    dom.refreshIcon.classList.add('animate-spin');
  }
  if (dom.refreshBtn) {
    dom.refreshBtn.disabled = true;
  }

  await loadData(true);

  setTimeout(() => {
    if (dom.refreshIcon) {
      dom.refreshIcon.classList.remove('animate-spin');
    }
    if (dom.refreshBtn) {
      dom.refreshBtn.disabled = false;
    }
  }, 400);
}

/**
 * Sets up interactive event listeners for search, filter, and refresh controls.
 */
function setupEventListeners() {
  // Live search input
  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', (e) => {
      filterState.searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Clear search button
  if (dom.searchClearBtn) {
    dom.searchClearBtn.addEventListener('click', () => {
      filterState.searchQuery = '';
      if (dom.searchInput) {
        dom.searchInput.value = '';
        dom.searchInput.focus();
      }
      applyFilters();
    });
  }

  // Source dropdown filter
  if (dom.sourceFilter) {
    dom.sourceFilter.addEventListener('change', (e) => {
      filterState.selectedSource = e.target.value;
      applyFilters();
    });
  }

  // Sort dropdown
  if (dom.sortSelect) {
    dom.sortSelect.addEventListener('change', (e) => {
      filterState.sortBy = e.target.value;
      applyFilters();
    });
  }

  // Manual refresh button
  if (dom.refreshBtn) {
    dom.refreshBtn.addEventListener('click', triggerRefresh);
  }

  // Live timer tick every 30 seconds for "Updated X ago"
  setInterval(() => {
    if (dom.lastUpdatedText && lastFetchedAt) {
      dom.lastUpdatedText.textContent = `Updated ${formatRelativeTime(lastFetchedAt)}`;
    }
  }, 30000);

  // Auto-refresh feed every 15 minutes
  setInterval(() => {
    console.log('[IndoPress] Auto-refreshing feed (15m interval)...');
    loadData(true);
  }, 15 * 60 * 1000);
}

/**
 * Initializes the application.
 */
async function initApp() {
  dom = {
    grid: document.getElementById('article-grid'),
    count: document.getElementById('article-count'),
    badge: document.getElementById('data-status-badge'),
    statsRow: document.getElementById('stats-row'),
    chipsContainer: document.getElementById('category-chips-container'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    sourceFilter: document.getElementById('source-filter'),
    sortSelect: document.getElementById('sort-select'),
    sourceChart: document.getElementById('source-chart'),
    topicChart: document.getElementById('topic-chart'),
    wordCloudContainer: document.getElementById('wordcloud-container'),
    refreshBtn: document.getElementById('refresh-btn'),
    refreshIcon: document.getElementById('refresh-icon'),
    lastUpdatedText: document.getElementById('last-updated-text')
  };

  setupEventListeners();
  await loadData();
}

// Bootstrap on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}

export { initApp };
