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
    const { proxyIndex = '0' } = req.query;
    const index = parseInt(proxyIndex as string);
    const proxies = proxyManager.getAllProxies();
    
    if (index >= proxies.length) {
      return res.status(400).json({ error: 'Invalid proxy index' });
    }

    const proxy = proxies[index];
    const testUrl = 'https://httpbin.org/ip';
    
    console.log(`Testing proxy ${proxy.host}:${proxy.port}...`);
    
    try {
      const startTime = Date.now();
      
      // Create proxy agent
      const { HttpsProxyAgent } = require('https-proxy-agent');
      const proxyUrl = `http://${proxy.host}:${proxy.port}`;
      const agent = new HttpsProxyAgent(proxyUrl);
      
      // Test with axios using the proxy agent
      const axios = require('axios');
      const response = await axios({
        url: testUrl,
        method: 'GET',
        httpsAgent: agent,
        timeout: 15000,
        validateStatus: (status: number) => status < 500
      });
      
      const responseTime = Date.now() - startTime;
      
      res.status(200).json({
        success: true,
        proxy: {
          host: proxy.host,
          port: proxy.port,
          type: proxy.type,
          country: proxy.country
        },
        testResult: {
          status: response.status,
          responseTime: responseTime,
          data: response.data,
          headers: response.headers
        },
        message: `Proxy ${proxy.host}:${proxy.port} is working!`
      });
      
    } catch (error: any) {
      res.status(200).json({
        success: false,
        proxy: {
          host: proxy.host,
          port: proxy.port,
          type: proxy.type,
          country: proxy.country
        },
        error: error.message,
        message: `Proxy ${proxy.host}:${proxy.port} failed: ${error.message}`
      });
    }

  } catch (error: any) {
    console.error('Proxy test failed:', error.message);
    res.status(500).json({
      error: 'Proxy test failed',
      message: error.message
    });
  }
}
