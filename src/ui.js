/**
 * IndoPress - UI Rendering Engine
 * Handles rendering article cards, stats metrics, skeletons, filter chips, and bookmarks.
 */

// Elegant SVG placeholder when an article image is missing or fails to load
export const DEFAULT_THUMBNAIL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="600" height="340" fill="%23f1f5f9"/><circle cx="300" cy="140" r="48" fill="%23cbd5e1"/><path d="M260 210 h80 v12 h-80 z M250 232 h100 v8 h-100 z M270 248 h60 v8 h-60 z" fill="%2394a3b8"/><text x="50%25" y="290" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="%2364748b">IndoPress Newsroom</text></svg>`;

const BOOKMARKS_STORAGE_KEY = 'indopress_bookmarks';

/**
 * Retrieves bookmarked articles from localStorage.
 * @returns {Array}
 */
export function getBookmarks() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Toggles bookmark status for an article.
 * @param {object} article
 * @returns {boolean} - True if newly bookmarked, false if removed
 */
export function toggleBookmark(article) {
  if (typeof window === 'undefined' || !window.localStorage || !article?.url) return false;
  try {
    const current = getBookmarks();
    const index = current.findIndex(a => a.url === article.url);
    let isNowBookmarked = false;

    if (index >= 0) {
      current.splice(index, 1);
      isNowBookmarked = false;
    } else {
      current.unshift(article);
      isNowBookmarked = true;
    }

    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(current));
    return isNowBookmarked;
  } catch {
    return false;
  }
}

/**
 * Formats an ISO date string into a clean, human-readable date.
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours >= 0 && diffHours < 1) {
      const diffMins = Math.max(1, Math.floor((now - date) / (1000 * 60)));
      return `${diffMins}m ago`;
    }
    if (diffHours >= 1 && diffHours < 24) {
      return `${diffHours}h ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

/**
 * Formats relative time from a given Date/timestamp for "Last Updated".
 * @param {Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return 'just now';
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now - date) / 1000));

  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1m ago';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

/**
 * Creates a single article card DOM element.
 * @param {object} article
 * @param {Function} [onBookmarkChange]
 * @returns {HTMLElement}
 */
export function createArticleCard(article, onBookmarkChange = null) {
  const card = document.createElement('article');
  card.className =
    'group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 relative';

  const category = article.category || {
    id: 'other',
    label: 'Other',
    icon: '📦',
    color: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  const bookmarks = getBookmarks();
  const isBookmarked = bookmarks.some(b => b.url === article.url);
  const formattedDate = formatDate(article.publishedAt);
  const imageUrl = article.urlToImage || DEFAULT_THUMBNAIL;

  card.innerHTML = `
    <!-- Thumbnail Image Container -->
    <div class="relative aspect-video bg-slate-100 overflow-hidden">
      <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="block w-full h-full">
        <img
          src="${imageUrl}"
          alt="${escapeHtml(article.title)}"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </a>

      <!-- Category Tag (Top-Left) -->
      <div class="absolute top-3 left-3 pointer-events-none">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${category.color} backdrop-blur-sm">
          <span>${category.icon}</span>
          <span>${category.label}</span>
        </span>
      </div>

      <!-- Bookmark Button (Top-Right) -->
      <button
        type="button"
        class="bookmark-btn absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${
          isBookmarked
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-slate-900/60 text-white hover:bg-slate-900 backdrop-blur-sm'
        }"
        title="${isBookmarked ? 'Remove from reading list' : 'Save to reading list'}"
      >
        <svg class="w-4 h-4 pointer-events-none" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
        </svg>
      </button>
    </div>

    <!-- Card Body -->
    <div class="p-5 flex flex-col flex-1">
      <!-- Source & Date Header -->
      <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5">
        <span class="text-slate-800 font-semibold uppercase tracking-wider text-[11px] truncate max-w-[65%]">
          ${escapeHtml(article.source)}
        </span>
        <time datetime="${article.publishedAt}">${formattedDate}</time>
      </div>

      <!-- Headline -->
      <h3 class="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
        <a href="${article.url}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(article.title)}
        </a>
      </h3>

      <!-- Excerpt Description -->
      <p class="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
        ${escapeHtml(article.description || 'Click to read the full report on the publisher\'s website.')}
      </p>

      <!-- Footer Action -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span class="text-slate-400 text-[11px] font-medium">
          ${article.author ? 'By ' + escapeHtml(article.author.slice(0, 24)) : 'International Desk'}
        </span>
        <a
          href="${article.url}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          <span>Read story</span>
          <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </div>
  `;

  // Safe image fallback
  const imgElem = card.querySelector('img');
  if (imgElem) {
    imgElem.onerror = () => {
      imgElem.src = DEFAULT_THUMBNAIL;
      imgElem.onerror = null;
    };
  }

  // Bookmark button click handler
  const bkmkBtn = card.querySelector('.bookmark-btn');
  if (bkmkBtn) {
    bkmkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const added = toggleBookmark(article);
      // Toggle button visual state
      if (added) {
        bkmkBtn.className = 'bookmark-btn absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm bg-red-600 text-white hover:bg-red-700';
        bkmkBtn.querySelector('svg').setAttribute('fill', 'currentColor');
        bkmkBtn.title = 'Remove from reading list';
      } else {
        bkmkBtn.className = 'bookmark-btn absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm bg-slate-900/60 text-white hover:bg-slate-900 backdrop-blur-sm';
        bkmkBtn.querySelector('svg').setAttribute('fill', 'none');
        bkmkBtn.title = 'Save to reading list';
      }
      if (onBookmarkChange) onBookmarkChange();
    });
  }

  return card;
}

/**
 * Helper to escape HTML characters in dynamic strings.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders quick stats metric cards.
 * @param {object} stats - { totalArticles, totalSources, dominantCategory, latestTimeFormatted }
 * @param {HTMLElement} container
 */
export function renderStatsRow(stats, container) {
  if (!container) return;
  const { totalArticles = 0, totalSources = 0, dominantCategory = null, latestTimeFormatted = 'Recent' } = stats;

  const topCategoryLabel = dominantCategory
    ? `${dominantCategory.icon} ${dominantCategory.label} (${dominantCategory.percentage}%)`
    : 'Varied Topics';

  container.innerHTML = `
    <!-- Card 1: Total Coverage -->
    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div class="w-11 h-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xl flex-shrink-0">
        📰
      </div>
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Coverage</p>
        <p class="text-2xl font-black text-slate-900 leading-tight mt-0.5">${totalArticles}</p>
        <p class="text-[11px] text-slate-500 mt-0.5">International stories</p>
      </div>
    </div>

    <!-- Card 2: Global Outlets -->
    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div class="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl flex-shrink-0">
        🌐
      </div>
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Global Outlets</p>
        <p class="text-2xl font-black text-slate-900 leading-tight mt-0.5">${totalSources}</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Unique news publishers</p>
      </div>
    </div>

    <!-- Card 3: Dominant Category -->
    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div class="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
        🔥
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dominant Topic</p>
        <p class="text-lg font-bold text-slate-900 leading-tight mt-0.5 truncate">${topCategoryLabel}</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Top coverage focus</p>
      </div>
    </div>

    <!-- Card 4: Latest Publication -->
    <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div class="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">
        ⏱️
      </div>
      <div>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Freshness</p>
        <p class="text-2xl font-black text-slate-900 leading-tight mt-0.5">${latestTimeFormatted}</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Newest report</p>
      </div>
    </div>
  `;
}

/**
 * Renders an array of articles into the specified container element.
 * @param {Array} articles
 * @param {HTMLElement} container
 * @param {Function} [onReset] - Optional callback for resetting filters when empty
 * @param {Function} [onBookmarkChange] - Optional callback on bookmark toggle
 */
export function renderCards(articles, container, onReset = null, onBookmarkChange = null) {
  if (!container) return;
  container.innerHTML = '';

  if (!articles || articles.length === 0) {
    renderEmptyState(container, onReset);
    return;
  }

  const fragment = document.createDocumentFragment();
  articles.forEach(article => {
    fragment.appendChild(createArticleCard(article, onBookmarkChange));
  });
  container.appendChild(fragment);
}

/**
 * Renders an empty state view with a reset action.
 * @param {HTMLElement} container
 * @param {Function} [onReset]
 */
export function renderEmptyState(container, onReset) {
  const emptyDiv = document.createElement('div');
  emptyDiv.className = 'col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm';
  emptyDiv.innerHTML = `
    <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 text-slate-500 mb-3 text-2xl">
      🔍
    </div>
    <h4 class="text-lg font-bold text-slate-900 mb-1">No matching articles found</h4>
    <p class="text-sm text-slate-500 max-w-sm mx-auto mb-5">
      We couldn't find any articles matching your active search keyword or category filters.
    </p>
    <button
      id="reset-filters-btn"
      type="button"
      class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm cursor-pointer"
    >
      <span>✕</span>
      <span>Clear all filters</span>
    </button>
  `;

  if (onReset) {
    const btn = emptyDiv.querySelector('#reset-filters-btn');
    if (btn) btn.addEventListener('click', onReset);
  }

  container.appendChild(emptyDiv);
}

/**
 * Renders category filter chips into the container including bookmarks.
 * @param {object} params
 * @param {HTMLElement} params.container
 * @param {object} params.categories
 * @param {string} params.activeCategory
 * @param {object} params.counts
 * @param {number} params.bookmarkCount
 * @param {Function} params.onSelect
 */
export function renderCategoryChips({ container, categories, activeCategory, counts, bookmarkCount = 0, onSelect }) {
  if (!container) return;
  container.innerHTML = '';

  const totalCount = counts.all || 0;
  const chipList = [
    { id: 'all', label: 'All', icon: '🌐', count: totalCount },
    { id: 'bookmarks', label: 'Saved', icon: '⭐', count: bookmarkCount },
    ...Object.values(categories).map(cat => ({
      id: cat.id,
      label: cat.label,
      icon: cat.icon,
      count: counts[cat.id] || 0
    }))
  ];

  const fragment = document.createDocumentFragment();

  chipList.forEach(item => {
    const isActive = item.id === activeCategory;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.category = item.id;

    if (isActive) {
      btn.className =
        'flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-sm transition cursor-pointer';
    } else {
      btn.className =
        'flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer';
    }

    const countClass = isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600';

    btn.innerHTML = `
      <span>${item.icon}</span>
      <span>${item.label}</span>
      <span class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${countClass}">${item.count}</span>
    `;

    btn.addEventListener('click', () => {
      if (onSelect) onSelect(item.id);
    });

    fragment.appendChild(btn);
  });

  container.appendChild(fragment);
}

/**
 * Populates source filter dropdown options.
 * @param {HTMLSelectElement} selectElem
 * @param {Array<{name: string, count: number}>} sources
 * @param {string} activeSource
 */
export function populateSourceFilter(selectElem, sources, activeSource = 'all') {
  if (!selectElem) return;

  const totalArticles = sources.reduce((acc, s) => acc + s.count, 0);
  let html = `<option value="all" ${activeSource === 'all' ? 'selected' : ''}>All Sources (${totalArticles})</option>`;

  sources.forEach(src => {
    const isSelected = src.name === activeSource ? 'selected' : '';
    html += `<option value="${escapeHtml(src.name)}" ${isSelected}>${escapeHtml(src.name)} (${src.count})</option>`;
  });

  selectElem.innerHTML = html;
}

/**
 * Renders pulsing skeleton loader cards while data is being retrieved.
 * @param {HTMLElement} container
 * @param {number} count
 */
export function renderSkeleton(container, count = 6) {
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className =
      'bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col';
    skeleton.innerHTML = `
      <div class="aspect-video bg-slate-200"></div>
      <div class="p-5 flex flex-col flex-1 space-y-3">
        <div class="flex justify-between items-center">
          <div class="h-3 bg-slate-200 rounded w-20"></div>
          <div class="h-3 bg-slate-200 rounded w-16"></div>
        </div>
        <div class="h-4 bg-slate-200 rounded w-5/6"></div>
        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
        <div class="space-y-2 pt-2">
          <div class="h-3 bg-slate-100 rounded w-full"></div>
          <div class="h-3 bg-slate-100 rounded w-4/5"></div>
        </div>
        <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
          <div class="h-3 bg-slate-100 rounded w-24"></div>
          <div class="h-3 bg-slate-200 rounded w-16"></div>
        </div>
      </div>
    `;
    fragment.appendChild(skeleton);
  }
  container.appendChild(fragment);
}

/**
 * Updates status badge indicator in navbar.
 * @param {HTMLElement} badgeElem
 * @param {boolean} isMock
 * @param {number} count
 */
export function updateStatusBadge(badgeElem, isMock, count) {
  if (!badgeElem) return;
  if (isMock) {
    badgeElem.className =
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200';
    badgeElem.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
      <span>Offline Archive (${count})</span>
    `;
  } else {
    badgeElem.className =
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    badgeElem.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>Live NewsAPI (${count})</span>
    `;
  }
}
