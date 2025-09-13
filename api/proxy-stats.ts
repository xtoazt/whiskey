import { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyManager } from './utils/proxyManager';

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
    const stats = proxyManager.getProxyStats();
    const proxies = proxyManager.getAllProxies();

    res.status(200).json({
      service: 'Whiskey Proxy',
      status: 'online',
      stats: stats,
      proxies: proxies.slice(0, 10), // Return first 10 proxies as sample
      totalProxies: proxies.length,
      features: {
        proxyRotation: true,
        healthChecking: true,
        urlFetching: true,
        corsSupport: true
      }
    });

  } catch (error: any) {
    console.error('Error getting proxy stats:', error.message);
    res.status(500).json({
      error: 'Failed to get proxy statistics',
      message: error.message
    });
  }
}