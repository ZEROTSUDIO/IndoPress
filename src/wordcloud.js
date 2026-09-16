/**
 * IndoPress - Headline Keyword Cloud Engine
 * Extracts high-frequency buzzwords from headlines with stopwords stripping.
 */

// Common stopwords + search keywords that appear in every article
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Domain stopwords (since every query is about Indonesia)
  'indonesia', 'indonesia\'s', 'indonesian', 'indonesians', 'say', 'says', 'said', 'amid', 'new', 'first', 'two',
  'one', 'three', 'years', 'month', 'will', 'also', 'over', 'now', 'back', 'take', 'takes', 'set', 'sets'
]);

/**
 * Extracts top frequent keywords from article titles.
 * @param {Array} articles
 * @param {number} topN
 * @returns {Array<{word: string, count: number, label: string}>}
 */
export function extractKeywords(articles = [], topN = 20) {
  const frequencyMap = new Map();

  articles.forEach(article => {
    const title = article.title || '';
    // Normalize: strip special characters and split on whitespace
    const tokens = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/);

    tokens.forEach(token => {
      const clean = token.replace(/^-+|-+$/g, '').trim();
      // Keep only words with 3+ letters that aren't numeric and not in stopwords
      if (clean.length > 2 && !STOPWORDS.has(clean) && !/^\d+$/.test(clean)) {
        frequencyMap.set(clean, (frequencyMap.get(clean) || 0) + 1);
      }
    });
  });

  return Array.from(frequencyMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      label: word.charAt(0).toUpperCase() + word.slice(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Renders interactive keyword pill badges.
 * @param {HTMLElement} container
 * @param {Array<{word: string, count: number, label: string}>} keywords
 * @param {Function} onKeywordClick
 */
export function renderWordCloud(container, keywords = [], onKeywordClick = null) {
  if (!container) return;
  container.innerHTML = '';

  if (keywords.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-400 italic">No keyword frequency data available.</p>';
    return;
  }

  const maxCount = keywords[0]?.count || 1;
  const fragment = document.createDocumentFragment();

  keywords.forEach(item => {
    const ratio = item.count / maxCount;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = `Filter articles by "${item.label}"`;

    // Dynamic styling tiers based on frequency
    let tierClasses = '';
    if (ratio >= 0.75) {
      tierClasses = 'bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800';
    } else if (ratio >= 0.45) {
      tierClasses = 'bg-slate-100 text-slate-900 font-semibold text-xs border border-slate-200 hover:bg-slate-200';
    } else {
      tierClasses = 'bg-white text-slate-600 font-medium text-[11px] border border-slate-200 hover:bg-slate-100';
    }

    btn.className = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-150 transform hover:-translate-y-0.5 ${tierClasses}`;
    btn.innerHTML = `
      <span>#${item.label}</span>
      <span class="opacity-75 text-[10px] px-1 py-0.2 rounded-full ${ratio >= 0.75 ? 'bg-slate-800' : 'bg-slate-200 text-slate-800'}">${item.count}</span>
    `;

    if (onKeywordClick) {
      btn.addEventListener('click', () => {
        onKeywordClick(item.word);
      });
    }

    fragment.appendChild(btn);
  });

  container.appendChild(fragment);
}
