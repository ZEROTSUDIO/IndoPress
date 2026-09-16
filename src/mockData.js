/**
 * IndoPress - Mock Articles Dataset
 * Realistic sample data structured exactly like NewsAPI /v2/everything response.
 * Used for development, offline usage, and fallback to preserve API request limits.
 */

export const mockArticles = [
  {
    source: { id: 'reuters', name: 'Reuters' },
    author: 'Reuters Staff',
    title: "Indonesia president Prabowo names cabinet ministers with focus on continuity",
    description: "Indonesia's President Prabowo Subianto unveiled his new cabinet ministers on Sunday, retaining key economic figures to maintain fiscal discipline.",
    url: "https://www.reuters.com/world/asia-pacific/indonesia-prabowo-cabinet-ministers",
    urlToImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-15T08:30:00Z",
    content: "JAKARTA (Reuters) - Indonesia's President Prabowo Subianto unveiled his cabinet ministers..."
  },
  {
    source: { id: 'channel-news-asia', name: 'CNA' },
    author: 'Kiki Siregar',
    title: "Indonesia GDP growth accelerates to 5.1% driven by foreign direct investment",
    description: "Indonesia's GDP expanded 5.1 percent year-on-year in the latest quarter, beating forecasts on strong manufacturing and infrastructure investment.",
    url: "https://www.channelnewsasia.com/asia/indonesia-gdp-economy-investment-growth",
    urlToImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-14T11:15:00Z",
    content: "JAKARTA: Indonesia recorded faster-than-expected economic growth in the recent quarter..."
  },
  {
    source: { id: 'al-jazeera-english', name: 'Al Jazeera' },
    author: 'Al Jazeera',
    title: "Indonesia and Australia hold bilateral summit to deepen regional maritime security",
    description: "The leaders of Indonesia and Australia met for a high-level bilateral summit in Canberra to sign new defense and maritime cooperation agreements.",
    url: "https://www.aljazeera.com/news/indonesia-australia-bilateral-summit",
    urlToImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-14T05:40:00Z",
    content: "Leaders of Indonesia and Australia emphasized regional peace and mutual economic stability..."
  },
  {
    source: { id: 'associated-press', name: 'Associated Press' },
    author: 'Niniek Karmini',
    title: "Flash flood hits western Indonesia after torrential monsoon rains, hundreds evacuated",
    description: "Rescue teams in Sumatra, Indonesia rushed to evacuate displaced residents following severe flash flood waters and landslides.",
    url: "https://apnews.com/article/indonesia-flood-evacuations-sumatra",
    urlToImage: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-13T14:20:00Z",
    content: "JAKARTA, Indonesia (AP) — Severe monsoon rain caused a sudden flash flood in western Indonesia..."
  },
  {
    source: { id: 'bbc-news', name: 'BBC News' },
    author: 'BBC Sport',
    title: "Indonesia badminton duo captures gold medal in thrilling world tour finale",
    description: "Indonesia's premier badminton pair celebrated a sensational gold medal victory after edging out their rivals in a dramatic three-set showdown.",
    url: "https://www.bbc.com/sport/badminton/indonesia-gold-medal-triumph",
    urlToImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-13T09:00:00Z",
    content: "The Indonesian badminton squad delivered another world-class performance on Sunday..."
  },
  {
    source: { id: 'the-jakarta-post', name: 'The Jakarta Post' },
    author: 'Jakarta Post Desk',
    title: "Indonesia minister of health rolls out nationwide screening for preventable disease",
    description: "The Indonesian government launched a comprehensive public health screening initiative targeting early detection of cardiovascular disease.",
    url: "https://www.thejakartapost.com/news/indonesia-minister-health-screening-program",
    urlToImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-12T16:45:00Z",
    content: "Indonesia's health ministry initiated free routine medical checks for citizens across 38 provinces..."
  },
  {
    source: { id: 'bloomberg', name: 'Bloomberg' },
    author: 'Grace Sihombing',
    title: "Indonesia rupiah firms as central bank defends currency amid global trade shifts",
    description: "Bank Indonesia intervened in foreign exchange markets to stabilize the rupiah amid broader shifts in Asian trade flows.",
    url: "https://www.bloomberg.com/news/indonesia-rupiah-currency-central-bank",
    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-12T04:10:00Z",
    content: "The Indonesian rupiah gained ground against the greenback after monetary authorities bolstered reserves..."
  },
  {
    source: { id: 'nikkei-asia', name: 'Nikkei Asia' },
    author: 'Shotaro Tani',
    title: "Indonesia pledges stricter carbon emission rules ahead of global climate negotiations",
    description: "Indonesia's environment ministry unveiled revised carbon reduction quotas for heavy industry and coal-fired plants.",
    url: "https://asia.nikkei.com/Spotlight/Environment/Indonesia-carbon-climate-rules",
    urlToImage: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-11T13:00:00Z",
    content: "JAKARTA — Indonesia has outlined tighter benchmarks for industrial carbon emissions..."
  },
  {
    source: { id: 'reuters', name: 'Reuters' },
    author: 'Stanley Widianto',
    title: "Indonesia parliament reviews national budget proposal for ambitious infrastructure plans",
    description: "Lawmakers in Indonesia's parliament began deliberation on the upcoming state budget, allocating funds for transport corridors and public schools.",
    url: "https://www.reuters.com/world/asia-pacific/indonesia-parliament-state-budget-review",
    urlToImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-11T07:25:00Z",
    content: "Members of Indonesia's House of Representatives kicked off discussions regarding the state budget..."
  },
  {
    source: { id: 'channel-news-asia', name: 'CNA' },
    author: 'Chandni Vatvani',
    title: "Indonesia hosts ASEAN diplomatic envoys to discuss regional trade corridor",
    description: "Jakarta hosted senior diplomats and ASEAN envoys to finalize operational guidelines for simplified digital cross-border trade.",
    url: "https://www.channelnewsasia.com/asia/indonesia-asean-diplomatic-envoys-trade-corridor",
    urlToImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-10T10:30:00Z",
    content: "ASEAN ambassadors convened in Jakarta on Wednesday to advance economic integration..."
  },
  {
    source: { id: 'antara-news', name: 'Antara' },
    author: 'Antara Bureau',
    title: "Indonesia national football team advances in Asian qualifiers after shutout win",
    description: "A disciplined tactical performance guided Indonesia's national football squad to an energetic victory in front of 70,000 cheering fans in Jakarta.",
    url: "https://en.antaranews.com/news/indonesia-football-asian-qualifiers-victory",
    urlToImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-10T02:15:00Z",
    content: "JAKARTA - Indonesia's national team secured three pivotal points in their qualification journey..."
  },
  {
    source: { id: 'antara-news', name: 'Antara' },
    author: 'Antara Bureau',
    title: "Indonesia expands modern community hospital facilities in remote eastern islands",
    description: "The health department completed upgrades on three regional hospital hubs in Maluku and Papua to expand emergency care capabilities.",
    url: "https://en.antaranews.com/news/indonesia-remote-hospital-expansion",
    urlToImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-09T12:00:00Z",
    content: "Healthcare access in eastern Indonesia received a substantial boost this week..."
  },
  {
    source: { id: 'reuters', name: 'Reuters' },
    author: 'Bernadette Christina',
    title: "Indonesia rainforest conservation initiative gains international funding support",
    description: "Multilateral climate funds pledged $120 million to support Indonesia's community-managed tropical forest preservation zones.",
    url: "https://www.reuters.com/business/environment/indonesia-forest-conservation-funding",
    urlToImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-08T09:40:00Z",
    content: "An international coalition announced new grants for forest monitoring across Kalimantan and Sumatra..."
  },
  {
    source: { id: 'the-diplomat', name: 'The Diplomat' },
    author: 'Sebastian Strangio',
    title: "Indonesia signs historic defense treaty with regional neighbors",
    description: "The defense treaty establishes framework commitments for joint maritime rescue and combined naval training exercises in regional waters.",
    url: "https://thediplomat.com/indonesia-defense-treaty-regional-cooperation",
    urlToImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-07T15:20:00Z",
    content: "Indonesia formalized an overarching defense agreement on Friday, reflecting its active non-aligned posture..."
  },
  {
    source: { id: 'associated-press', name: 'Associated Press' },
    author: 'AP Reporter',
    title: "Indonesia culinary heritage celebrated in international gastronomy exhibition",
    description: "Chefs from across the Indonesian archipelago showcased traditional spices, coffee beans, and artisanal recipes at an international food fair.",
    url: "https://apnews.com/article/indonesia-culinary-culture-exhibition",
    urlToImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-06T11:00:00Z",
    content: "Traditional Indonesian culinary arts took center stage during the cultural showcase..."
  }
];
