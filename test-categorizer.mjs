import { fetchArticles } from './src/api.js';

async function test() {
  const data = await fetchArticles();
  console.log(`Successfully loaded ${data.articles.length} articles (isMock: ${data.isMock}):`);
  
  const categoryCounts = {};
  for (const a of data.articles) {
    categoryCounts[a.category.label] = (categoryCounts[a.category.label] || 0) + 1;
    console.log(`- [${a.category.label.padEnd(11)}] (matched: "${a.category.matchedKeyword || 'none'}"): ${a.title}`);
  }

  console.log('\nCategory Distribution:');
  console.table(categoryCounts);
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
