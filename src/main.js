/**
 * IndoPress - Main Entry Point
 * Orchestrates data retrieval, categorization, and UI setup.
 */

import { fetchArticles } from './api.js';

async function init() {
  console.log('IndoPress Initializing...');
  const result = await fetchArticles();

  console.log(`Loaded ${result.articles.length} articles (Mock: ${result.isMock}):`);
  console.table(
    result.articles.map(a => ({
      Source: a.source,
      Category: `${a.category.icon} ${a.category.label}`,
      MatchedKeyword: a.category.matchedKeyword || '-',
      Headline: a.title.slice(0, 50) + '...'
    }))
  );

  const logElem = document.getElementById('output-log');
  if (logElem) {
    const summary = {
      total: result.articles.length,
      isMock: result.isMock,
      categoriesCount: result.articles.reduce((acc, a) => {
        acc[a.category.label] = (acc[a.category.label] || 0) + 1;
        return acc;
      }, {}),
      sampleArticles: result.articles.slice(0, 3)
    };
    logElem.textContent = JSON.stringify(summary, null, 2);
  }
}

// Run on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

export { init };
