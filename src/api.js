/**
 * IndoPress - NewsAPI Client & Data Normalizer
 * Handles live fetching from NewsAPI with automatic fallback to mock dataset.
 */

import { categorizeArticle } from './categorizer.js';
import { mockArticles } from './mockData.js';

const NEWS_API_ENDPOINT = 'https://newsapi.org/v2/everything';

/**
 * Normalizes and categorizes an article object.
 * @param {object} article - Raw article from NewsAPI or mock data
 * @returns {object} - Article with categorized metadata and safe defaults
 */
export function normalizeArticle(article) {
  const category = categorizeArticle(article.title || '');
  return {
    title: article.title || 'Untitled Article',
    description: article.description || 'No description available.',
    source: article.source?.name || 'Unknown Source',
    sourceId: article.source?.id || null,
    author: article.author || 'Staff',
    url: article.url || '#',
    urlToImage: article.urlToImage || null,
    publishedAt: article.publishedAt || new Date().toISOString(),
    content: article.content || '',
    category: category
  };
}

/**
 * Fetches latest headlines mentioning Indonesia.
 * Falls back to mock data if API key is missing or request fails.
 * 
 * @param {object} options
 * @param {string} [options.apiKey] - NewsAPI key (optional)
 * @param {string} [options.query='indonesia'] - Search keyword in title
 * @param {boolean} [options.forceMock=false] - Force using mock data
 * @returns {Promise<{articles: Array, isMock: boolean, totalResults: number}>}
 */
export async function fetchArticles({ apiKey = '', query = 'indonesia', forceMock = false } = {}) {
  // If explicitly forced or no key provided, return mock data directly
  if (forceMock || !apiKey) {
    const enriched = mockArticles.map(normalizeArticle);
    return {
      articles: enriched,
      isMock: true,
      totalResults: enriched.length,
      message: 'Using offline mock dataset (no API key provided).'
    };
  }

  const url = `${NEWS_API_ENDPOINT}?qInTitle=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`NewsAPI error [${response.status}]: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const rawArticles = Array.isArray(data.articles) ? data.articles : [];
    const enriched = rawArticles.map(normalizeArticle);

    return {
      articles: enriched,
      isMock: false,
      totalResults: data.totalResults || enriched.length
    };
  } catch (err) {
    console.warn('NewsAPI fetch failed (likely CORS or rate limit). Falling back to mock data.', err.message);
    const enriched = mockArticles.map(normalizeArticle);
    return {
      articles: enriched,
      isMock: true,
      totalResults: enriched.length,
      fallbackReason: err.message
    };
  }
}
