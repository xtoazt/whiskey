import { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyManager } from '../src/utils/proxyManager';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      testUrl = 'https://httpbin.org/ip', 
      proxyType, 
      country, 
      count = '5' 
    } = req.query;

    const testCount = Math.min(parseInt(count as string, 10), 20); // Max 20 tests
    const results = [];

    for (let i = 0; i < testCount; i++) {
      try {
        // Get proxy based on preferences
        let proxy;
        if (proxyType && country) {
          const proxies = proxyManager.getProxiesByType(proxyType as any)
            .filter(p => p.country === country);
          proxy = proxies[Math.floor(Math.random() * proxies.length)];
        } else if (proxyType) {
          const proxies = proxyManager.getProxiesByType(proxyType as any);
          proxy = proxies[Math.floor(Math.random() * proxies.length)];
        } else if (country) {
          const proxies = proxyManager.getProxiesByCountry(country as string);
          proxy = proxies[Math.floor(Math.random() * proxies.length)];
        } else {
          proxy = proxyManager.getRandomProxy();
        }

        if (!proxy) {
          results.push({
            success: false,
            error: 'No proxy available',
            proxy: null
          });
          continue;
        }

        const startTime = Date.now();
        const config = proxyManager.createAxiosConfig(proxy);
        
        const response = await axios({
          ...config,
          url: testUrl as string,
          method: 'GET',
          timeout: 10000
        });

        const responseTime = Date.now() - startTime;
        
        // Update proxy stats
        proxy.responseTime = responseTime;
        proxy.lastChecked = new Date();
        proxy.isHealthy = true;

        results.push({
          success: true,
          responseTime,
          status: response.status,
          data: response.data,
          proxy: {
            host: proxy.host,
            port: proxy.port,
            type: proxy.type,
            country: proxy.country
          }
        });

      } catch (error: any) {
        results.push({
          success: false,
          error: error.message,
          code: error.code,
          proxy: null
        });
      }
    }

    // Calculate summary statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgResponseTime = results
      .filter(r => r.success && r.responseTime)
      .reduce((sum, r) => sum + r.responseTime, 0) / successful || 0;

    res.status(200).json({
      summary: {
        total: results.length,
        successful,
        failed,
        successRate: results.length > 0 ? (successful / results.length) * 100 : 0,
        avgResponseTime: Math.round(avgResponseTime)
      },
      results,
      testUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error testing proxies:', error.message);
    res.status(500).json({
      error: 'Failed to test proxies',
      message: error.message
    });
  }
}
