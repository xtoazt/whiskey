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
    const stats = proxyManager.getProxyStats();
    const allProxies = proxyManager.getAllProxies();

    // Calculate additional statistics
    const countryStats = allProxies.reduce((acc, proxy) => {
      if (!acc[proxy.country]) {
        acc[proxy.country] = { total: 0, healthy: 0, avgResponseTime: 0 };
      }
      acc[proxy.country].total++;
      if (proxy.isHealthy === true) {
        acc[proxy.country].healthy++;
      }
      return acc;
    }, {} as Record<string, { total: number; healthy: number; avgResponseTime: number }>);

    // Calculate average response times by country
    Object.keys(countryStats).forEach(country => {
      const countryProxies = allProxies.filter(p => p.country === country);
      const avgResponseTime = countryProxies.reduce((sum, p) => sum + p.responseTime, 0) / countryProxies.length;
      countryStats[country].avgResponseTime = Math.round(avgResponseTime);
    });

    const typeStats = allProxies.reduce((acc, proxy) => {
      if (!acc[proxy.type]) {
        acc[proxy.type] = { total: 0, healthy: 0, avgResponseTime: 0 };
      }
      acc[proxy.type].total++;
      if (proxy.isHealthy === true) {
        acc[proxy.type].healthy++;
      }
      return acc;
    }, {} as Record<string, { total: number; healthy: 0; avgResponseTime: number }>);

    // Calculate average response times by type
    Object.keys(typeStats).forEach(type => {
      const typeProxies = allProxies.filter(p => p.type === type);
      const avgResponseTime = typeProxies.reduce((sum, p) => sum + p.responseTime, 0) / typeProxies.length;
      typeStats[type].avgResponseTime = Math.round(avgResponseTime);
    });

    // Get top performing proxies
    const topProxies = allProxies
      .filter(p => p.isHealthy !== false)
      .sort((a, b) => {
        const scoreA = (a.uptime / 100) * (10000 / a.responseTime);
        const scoreB = (b.uptime / 100) * (10000 / b.responseTime);
        return scoreB - scoreA;
      })
      .slice(0, 10)
      .map(proxy => ({
        host: proxy.host,
        port: proxy.port,
        type: proxy.type,
        country: proxy.country,
        uptime: proxy.uptime,
        responseTime: proxy.responseTime,
        score: Math.round((proxy.uptime / 100) * (10000 / proxy.responseTime))
      }));

    res.status(200).json({
      overview: stats,
      byCountry: countryStats,
      byType: typeStats,
      topProxies,
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting proxy stats:', error.message);
    res.status(500).json({
      error: 'Failed to get proxy statistics',
      message: error.message
    });
  }
}
