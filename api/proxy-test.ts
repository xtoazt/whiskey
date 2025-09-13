import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

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
    const { testUrl = 'https://httpbin.org/ip', count = '3' } = req.query;
    const testCount = Math.min(parseInt(count as string, 10) || 3, 10); // Max 10 tests
    
    const results = [];
    let successful = 0;
    let totalResponseTime = 0;

    for (let i = 0; i < testCount; i++) {
      const startTime = Date.now();
      
      try {
        const response = await axios({
          url: testUrl as string,
          method: 'GET',
          timeout: 10000,
          headers: {
            'User-Agent': 'Whiskey-URL-Fetcher/1.0.0'
          }
        });
        
        const responseTime = Date.now() - startTime;
        totalResponseTime += responseTime;
        successful++;
        
        results.push({
          test: i + 1,
          success: true,
          status: response.status,
          responseTime: responseTime,
          data: response.data
        });
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        
        results.push({
          test: i + 1,
          success: false,
          error: error.message,
          responseTime: responseTime
        });
      }
    }

    const avgResponseTime = successful > 0 ? Math.round(totalResponseTime / successful) : 0;
    const successRate = (successful / testCount) * 100;

    res.status(200).json({
      summary: {
        total: testCount,
        successful: successful,
        failed: testCount - successful,
        successRate: Math.round(successRate),
        avgResponseTime: avgResponseTime
      },
      results: results,
      testUrl: testUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error running tests:', error.message);
    res.status(500).json({
      error: 'Failed to run tests',
      message: error.message
    });
  }
}