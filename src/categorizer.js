/**
 * IndoPress - Keyword-Based Auto-Categorizer
 * Classifies news articles based on keywords found in the headline.
 */

export const CATEGORIES = {
  POLITICS: {
    id: 'politics',
    label: 'Politics',
    icon: '🏛️',
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
    keywords: ['president', 'minister', 'parliament', 'election', 'prabowo', 'dprd', 'government']
  },
  ECONOMY: {
    id: 'economy',
    label: 'Economy',
    icon: '💰',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
    keywords: ['gdp', 'investment', 'trade', 'budget', 'rupiah', 'finance', 'economic', 'economy']
  },
  SPORTS: {
    id: 'sports',
    label: 'Sports',
    icon: '⚽',
    color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
    keywords: ['asian games', 'sea games', 'football', 'badminton', 'athlete', 'gold medal', 'olympic', 'soccer']
  },
  ENVIRONMENT: {
    id: 'environment',
    label: 'Environment',
    icon: '🌿',
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
    keywords: ['forest', 'rainforest', 'flood', 'earthquake', 'climate', 'carbon', 'pollution', 'tsunami', 'volcano']
  },
  HEALTH: {
    id: 'health',
    label: 'Health',
    icon: '🏥',
    color: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700',
    keywords: ['minister of health', 'health', 'hospital', 'vaccine', 'disease', 'pandemic', 'medical']
  },
  DIPLOMACY: {
    id: 'diplomacy',
    label: 'Diplomacy',
    icon: '🌏',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700',
    keywords: ['bilateral', 'summit', 'asean', 'treaty', 'relations', 'ambassador', 'envoy', 'diplomatic']
  },
  OTHER: {
    id: 'other',
    label: 'Other',
    icon: '📦',
    color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    keywords: []
  }
};

// Flatten and order keyword rules: longer phrases take precedence over shorter/single words
const COMPILED_RULES = Object.values(CATEGORIES)
  .flatMap(category =>
    category.keywords.map(keyword => ({
      category,
      keyword,
      length: keyword.length,
      isPhrase: keyword.includes(' ')
    }))
  )
  .sort((a, b) => b.length - a.length);

/**
 * Categorize a headline by scanning for defined keywords.
 * Prioritizes more specific multi-word phrases over generic single words.
 * 
 * @param {string} title - Headline text
 * @returns {object} - Matched category object with matched keyword if any
 */
export function categorizeArticle(title = '') {
  if (!title || typeof title !== 'string') {
    return { ...CATEGORIES.OTHER, matchedKeyword: null };
  }

  const normalizedTitle = title.toLowerCase();

  for (const rule of COMPILED_RULES) {
    if (rule.isPhrase) {
      if (normalizedTitle.includes(rule.keyword)) {
        return { ...rule.category, matchedKeyword: rule.keyword };
      }
    } else {
      const regex = new RegExp(`\\b${rule.keyword}\\b`, 'i');
      if (regex.test(normalizedTitle)) {
        return { ...rule.category, matchedKeyword: rule.keyword };
      }
    }
  }

  return { ...CATEGORIES.OTHER, matchedKeyword: null };
}
