/**
 * IndoPress - UI Rendering Engine
 * Handles rendering article cards, skeletons, badges, and empty states.
 */

// Elegant SVG placeholder when an article image is missing or fails to load
export const DEFAULT_THUMBNAIL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="600" height="340" fill="%23f1f5f9"/><circle cx="300" cy="140" r="48" fill="%23cbd5e1"/><path d="M260 210 h80 v12 h-80 z M250 232 h100 v8 h-100 z M270 248 h60 v8 h-60 z" fill="%2394a3b8"/><text x="50%25" y="290" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="%2364748b">IndoPress Newsroom</text></svg>`;

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
 * Creates a single article card DOM element.
 * @param {object} article
 * @returns {HTMLElement}
 */
export function createArticleCard(article) {
  const card = document.createElement('article');
  card.className =
    'group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200';

  const category = article.category || {
    id: 'other',
    label: 'Other',
    icon: '📦',
    color: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  const formattedDate = formatDate(article.publishedAt);
  const imageUrl = article.urlToImage || DEFAULT_THUMBNAIL;

  card.innerHTML = `
    <!-- Thumbnail Image Container -->
    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="block relative aspect-video bg-slate-100 overflow-hidden">
      <img
        src="${imageUrl}"
        alt="${escapeHtml(article.title)}"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div class="absolute top-3 left-3">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${category.color} backdrop-blur-sm">
          <span>${category.icon}</span>
          <span>${category.label}</span>
        </span>
      </div>
    </a>

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

  // Attach safe image fallback listener on image error
  const imgElem = card.querySelector('img');
  if (imgElem) {
    imgElem.onerror = () => {
      imgElem.src = DEFAULT_THUMBNAIL;
      imgElem.onerror = null;
    };
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
 * Renders an array of articles into the specified container element.
 * @param {Array} articles
 * @param {HTMLElement} container
 */
export function renderCards(articles, container) {
  if (!container) return;
  container.innerHTML = '';

  if (!articles || articles.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-3 text-2xl">
          🔍
        </div>
        <h4 class="text-base font-semibold text-slate-800 mb-1">No articles found</h4>
        <p class="text-sm text-slate-500 max-w-sm mx-auto">There are currently no articles matching the criteria.</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  articles.forEach(article => {
    fragment.appendChild(createArticleCard(article));
  });
  container.appendChild(fragment);
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
      <span>Offline Archive (${count} items)</span>
    `;
  } else {
    badgeElem.className =
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    badgeElem.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>Live NewsAPI (${count} items)</span>
    `;
  }
}
