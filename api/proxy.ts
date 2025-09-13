import { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyManager } from '../src/utils/proxyManager';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { url, method = 'GET', headers = {}, data, proxyType, country } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate URL
    let targetUrl: string;
    try {
      targetUrl = decodeURIComponent(url as string);
      new URL(targetUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }

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
      proxy = proxyManager.getNextProxy();
    }

    if (!proxy) {
      return res.status(503).json({ error: 'No proxy available' });
    }

    // Create axios config with proxy
    const config = proxyManager.createAxiosConfig(proxy);
    
    // Prepare request config
    const requestConfig = {
      ...config,
      url: targetUrl,
      method: method as string,
      headers: {
        ...config.headers,
        ...headers
      },
      data: data ? JSON.parse(data as string) : undefined,
      maxRedirects: 5,
      validateStatus: (status: number) => status < 500 // Don't throw on 4xx errors
    };

    // Make the request
    const startTime = Date.now();
    const response = await axios(requestConfig);
    const responseTime = Date.now() - startTime;

    // Update proxy stats
    proxy.responseTime = responseTime;
    proxy.lastChecked = new Date();
    proxy.isHealthy = true;

    // Return response
    res.status(response.status).json({
      data: response.data,
      status: response.status,
      headers: response.headers,
      proxy: {
        host: proxy.host,
        port: proxy.port,
        type: proxy.type,
        country: proxy.country,
        responseTime: responseTime
      },
      responseTime: responseTime
    });

  } catch (error: any) {
    console.error('Proxy request failed:', error.message);
    
    // Mark proxy as unhealthy if it was used
    if (error.config?.agent) {
      // Try to find which proxy was used and mark it as unhealthy
      const usedProxy = proxyManager.getAllProxies().find(p => 
        error.config.url?.includes(p.host) || 
        error.message?.includes(p.host)
      );
      if (usedProxy) {
        usedProxy.isHealthy = false;
        usedProxy.lastChecked = new Date();
      }
    }

    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
      code: error.code
    });
  }
}
