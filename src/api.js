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
  const category = categorizeArticle(article.title || '', article.description || '');
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
  // If explicitly forced mock, return mock data directly
  if (forceMock) {
    const enriched = mockArticles.map(normalizeArticle);
    return {
      articles: enriched,
      isMock: true,
      totalResults: enriched.length,
      message: 'Using offline mock dataset (forced mock mode).'
    };
  }

  // 1. In browser environments, try local or serverless proxy (/api/news) first
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    try {
      const proxyUrl = `/api/news?query=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=40`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && Array.isArray(data.articles)) {
          const enriched = data.articles.map(normalizeArticle);
          return {
            articles: enriched,
            isMock: false,
            totalResults: data.totalResults || enriched.length
          };
        }
      }
    } catch (err) {
      console.warn('Proxy /api/news request failed or unavailable:', err.message);
    }
  }

  // 2. Direct API call if apiKey is explicitly provided
  if (apiKey) {
    try {
      const url = `${NEWS_API_ENDPOINT}?qInTitle=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${apiKey}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const rawArticles = Array.isArray(data.articles) ? data.articles : [];
        const enriched = rawArticles.map(normalizeArticle);
        return {
          articles: enriched,
          isMock: false,
          totalResults: data.totalResults || enriched.length
        };
      }
    } catch (err) {
      console.warn('Direct NewsAPI fetch failed:', err.message);
    }
  }

  // 3. Fallback to mock dataset
  const enriched = mockArticles.map(normalizeArticle);
  return {
    articles: enriched,
    isMock: true,
    totalResults: enriched.length,
    message: 'Using offline mock dataset.'
  };
}
