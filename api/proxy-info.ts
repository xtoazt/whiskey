import { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyManager } from '../src/utils/proxyManager';
import { setCurrentProxy, getCurrentProxy } from './proxy';

// Simple in-memory storage for current proxy (in production, use a database)
let currentProxy: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return handleProxySelection(req, res);
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
      currentProxy: getCurrentProxy(),
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

async function handleProxySelection(req: VercelRequest, res: VercelResponse) {
  try {
    const { host, port, fastest } = req.body;

    if (fastest) {
      // Select fastest proxy
      const fastestProxy = proxyManager.getFastestProxy();
      if (fastestProxy) {
        const proxyData = {
          host: fastestProxy.host,
          port: fastestProxy.port,
          type: fastestProxy.type,
          country: fastestProxy.country,
          uptime: fastestProxy.uptime,
          responseTime: fastestProxy.responseTime
        };
        setCurrentProxy(proxyData);
        res.status(200).json({
          success: true,
          proxy: proxyData,
          message: 'Fastest proxy selected'
        });
      } else {
        res.status(404).json({
          error: 'No proxy available',
          message: 'No healthy proxies found'
        });
      }
    } else if (host && port) {
      // Select specific proxy
      const allProxies = proxyManager.getAllProxies();
      const selectedProxy = allProxies.find(p => p.host === host && p.port === port);
      
      if (selectedProxy) {
        const proxyData = {
          host: selectedProxy.host,
          port: selectedProxy.port,
          type: selectedProxy.type,
          country: selectedProxy.country,
          uptime: selectedProxy.uptime,
          responseTime: selectedProxy.responseTime
        };
        setCurrentProxy(proxyData);
        res.status(200).json({
          success: true,
          proxy: proxyData,
          message: 'Proxy selected successfully'
        });
      } else {
        res.status(404).json({
          error: 'Proxy not found',
          message: 'The specified proxy was not found in the list'
        });
      }
    } else {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Either specify host and port, or set fastest to true'
      });
    }
  } catch (error: any) {
    console.error('Error selecting proxy:', error.message);
    res.status(500).json({
      error: 'Failed to select proxy',
      message: error.message
    });
  }
}
