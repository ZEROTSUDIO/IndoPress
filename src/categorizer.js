/**
 * IndoPress - Keyword-Based Auto-Categorizer
 * Classifies news articles using comprehensive keyword dictionaries
 * with plural handling and headline + description fallback scanning.
 */

export const CATEGORIES = {
  POLITICS: {
    id: 'politics',
    label: 'Politics',
    icon: '🏛️',
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
    keywords: [
      'president', 'presidential', 'minister', 'ministers', 'parliament', 'election', 'elections',
      'prabowo', 'subianto', 'dprd', 'government', 'cabinet', 'policy', 'policies', 'state',
      'court', 'police', 'regulation', 'regulations', 'lawmaker', 'lawmakers', 'governor',
      'political', 'corruption', 'kpk'
    ]
  },
  ECONOMY: {
    id: 'economy',
    label: 'Economy',
    icon: '💰',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
    keywords: [
      'supply chain', 'foreign exchange', 'gdp', 'investment', 'investments', 'investor', 'investors',
      'trade', 'budget', 'rupiah', 'finance', 'financial', 'economic', 'economy', 'oil', 'energy',
      'fuel', 'market', 'markets', 'export', 'exports', 'import', 'imports', 'tariff', 'tariffs',
      'duty', 'duties', 'bank', 'banking', 'business', 'businesses', 'revenue', 'firm', 'firms',
      'mineral', 'minerals', 'nickel', 'pertamina', 'currency', 'inflation', 'commerce', 'cooperative', 'cooperatives'
    ]
  },
  SPORTS: {
    id: 'sports',
    label: 'Sports',
    icon: '⚽',
    color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
    keywords: [
      'asian games', 'sea games', 'gold medal', 'world cup', 'football', 'badminton',
      'athlete', 'athletes', 'olympic', 'olympics', 'soccer', 'championship', 'tournament',
      'coach', 'fifa', 'match'
    ]
  },
  ENVIRONMENT: {
    id: 'environment',
    label: 'Environment',
    icon: '🌿',
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700',
    keywords: [
      'rainforest', 'deforestation', 'forest', 'forests', 'flood', 'floods', 'earthquake',
      'earthquakes', 'climate', 'carbon', 'pollution', 'tsunami', 'volcano', 'eruption',
      'disaster', 'disasters', 'rescue', 'rescuers', 'storm', 'stormy', 'weather', 'ferry',
      'capsize', 'capsizes', 'capsized', 'sink', 'sinks', 'sinking', 'fire', 'fires',
      'conservation', 'marine', 'renewable', 'biomass', 'wildlife', 'biodiversity'
    ]
  },
  HEALTH: {
    id: 'health',
    label: 'Health',
    icon: '🏥',
    color: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700',
    keywords: [
      'minister of health', 'health', 'hospital', 'hospitals', 'vaccine', 'vaccines',
      'disease', 'diseases', 'pandemic', 'medical', 'patient', 'patients', 'doctor',
      'doctors', 'clinic', 'screening'
    ]
  },
  DIPLOMACY: {
    id: 'diplomacy',
    label: 'Diplomacy',
    icon: '🌏',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700',
    keywords: [
      'foreign affairs', 'bilateral', 'summit', 'asean', 'treaty', 'relations', 'ambassador',
      'ambassadors', 'envoy', 'envoys', 'diplomatic', 'diplomacy', 'brics', 'ties',
      'partnership', 'partnerships', 'accord', 'cooperation'
    ]
  },
  OTHER: {
    id: 'other',
    label: 'Other',
    icon: '📦',
    color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    keywords: []
  }
};

// Flatten and order keyword rules: longer multi-word phrases take precedence over single words
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
 * Scans a given text string against the compiled keyword rules.
 * @param {string} text
 * @returns {object|null}
 */
function scanText(text = '') {
  if (!text || typeof text !== 'string') return null;
  const normalized = text.toLowerCase();

  for (const rule of COMPILED_RULES) {
    if (rule.isPhrase) {
      if (normalized.includes(rule.keyword)) {
        return { ...rule.category, matchedKeyword: rule.keyword };
      }
    } else {
      const regex = new RegExp(`\\b${rule.keyword}\\b`, 'i');
      if (regex.test(normalized)) {
        return { ...rule.category, matchedKeyword: rule.keyword };
      }
    }
  }

  return null;
}

/**
 * Categorizes an article by scanning its title first, with description fallback.
 * @param {string} title - Headline text
 * @param {string} [description=''] - Article description snippet
 * @returns {object} - Matched category metadata
 */
export function categorizeArticle(title = '', description = '') {
  // 1. Primary: Scan the headline
  const titleMatch = scanText(title);
  if (titleMatch) {
    return { ...titleMatch, matchedIn: 'title' };
  }

  // 2. Secondary Fallback: Scan the description if headline had no match
  if (description) {
    const descMatch = scanText(description);
    if (descMatch) {
      return { ...descMatch, matchedIn: 'description' };
    }
  }

  return { ...CATEGORIES.OTHER, matchedKeyword: null, matchedIn: null };
}
