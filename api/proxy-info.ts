import { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyManager } from '../src/utils/proxyManager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, country, limit = '50' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    let proxies = proxyManager.getAllProxies();

    // Filter by type if specified
    if (type) {
      proxies = proxies.filter(p => p.type === type);
    }

    // Filter by country if specified
    if (country) {
      proxies = proxies.filter(p => p.country === country);
    }

    // Limit results
    if (limitNum > 0) {
      proxies = proxies.slice(0, limitNum);
    }

    // Get statistics
    const stats = proxyManager.getProxyStats();

    // Get unique countries and types
    const countries = [...new Set(proxies.map(p => p.country))].sort();
    const types = [...new Set(proxies.map(p => p.type))].sort();

    res.status(200).json({
      proxies: proxies.map(proxy => ({
        host: proxy.host,
        port: proxy.port,
        type: proxy.type,
        country: proxy.country,
        uptime: proxy.uptime,
        responseTime: proxy.responseTime,
        isHealthy: proxy.isHealthy,
        lastChecked: proxy.lastChecked
      })),
      stats: {
        ...stats,
        filtered: proxies.length
      },
      filters: {
        countries,
        types
      }
    });

  } catch (error: any) {
    console.error('Error getting proxy info:', error.message);
    res.status(500).json({
      error: 'Failed to get proxy information',
      message: error.message
    });
  }
}
