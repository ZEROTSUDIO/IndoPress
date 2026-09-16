/**
 * IndoPress - Main Orchestrator
 * Connects data layer, categorizer, presentation layer, charts, and keyword cloud.
 */

import { fetchArticles } from './api.js';
import { CATEGORIES } from './categorizer.js';
import {
  renderCards,
  renderSkeleton,
  updateStatusBadge,
  renderCategoryChips,
  populateSourceFilter
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
  selectedCategory: 'all',
  searchQuery: '',
  selectedSource: 'all',
  sortBy: 'latest' // 'latest' | 'oldest' | 'title'
};

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
 * Filters and sorts articles according to active filterState.
 * @returns {Array}
 */
export function getFilteredArticles() {
  const query = filterState.searchQuery.trim().toLowerCase();

  return appState.articles
    .filter(article => {
      // 1. Category filter
      if (filterState.selectedCategory !== 'all') {
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

  // Render cards with reset callback
  if (dom.grid) {
    renderCards(filtered, dom.grid, resetAllFilters);
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

  // Re-render chips to reflect 'all' selected
  refreshCategoryChips();
  applyFilters();
}

/**
 * Re-renders the category filter chips bar.
 */
function refreshCategoryChips() {
  if (!dom.chipsContainer) return;
  const counts = computeCategoryCounts(appState.articles);

  renderCategoryChips({
    container: dom.chipsContainer,
    categories: CATEGORIES,
    activeCategory: filterState.selectedCategory,
    counts,
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
 * Sets up interactive event listeners for search and filter controls.
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
}

/**
 * Initializes the application.
 */
async function initApp() {
  dom = {
    grid: document.getElementById('article-grid'),
    count: document.getElementById('article-count'),
    badge: document.getElementById('data-status-badge'),
    chipsContainer: document.getElementById('category-chips-container'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    sourceFilter: document.getElementById('source-filter'),
    sortSelect: document.getElementById('sort-select'),
    sourceChart: document.getElementById('source-chart'),
    topicChart: document.getElementById('topic-chart'),
    wordCloudContainer: document.getElementById('wordcloud-container')
  };

  // Show skeleton loading state
  if (dom.grid) {
    renderSkeleton(dom.grid, 6);
  }

  try {
    // Fetch data
    const result = await fetchArticles();
    appState.articles = result.articles || [];
    appState.isMock = result.isMock;
    appState.totalResults = result.totalResults || appState.articles.length;

    // Update status badge
    if (dom.badge) {
      updateStatusBadge(dom.badge, appState.isMock, appState.articles.length);
    }

    // Populate category chips & source filter options
    refreshCategoryChips();
    if (dom.sourceFilter) {
      populateSourceFilter(dom.sourceFilter, computeSources(appState.articles), filterState.selectedSource);
    }

    // Initialize charts and keyword cloud
    setupAnalytics();

    // Setup interactive listeners
    setupEventListeners();

    // Render filtered cards
    applyFilters();

    console.log(`[IndoPress] Initialized with ${appState.articles.length} articles (Mock: ${appState.isMock})`);
  } catch (err) {
    console.error('[IndoPress] Initialization failed:', err);
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

// Bootstrap on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}

export { initApp };
