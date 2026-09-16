/**
 * IndoPress - Vercel Serverless Function Proxy (/api/news)
 * Securely wraps NewsAPI calls using environment variables without exposing the API key to the client.
 */

export default async function handler(req, res) {
  // Allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      status: 'error',
      message: 'NEWS_API_KEY environment variable is not set on the server.'
    });
  }

  const { query = 'indonesia', sortBy = 'publishedAt', pageSize = '40' } = req.query;

  try {
    const targetUrl = `https://newsapi.org/v2/everything?qInTitle=${encodeURIComponent(query)}&language=en&sortBy=${sortBy}&pageSize=${pageSize}&apiKey=${apiKey}`;
    const apiResponse = await fetch(targetUrl);
    const data = await apiResponse.json();

    return res.status(apiResponse.status).json(data);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal proxy server error'
    });
  }
}
