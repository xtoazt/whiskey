import { VercelRequest, VercelResponse } from '@vercel/node';
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
    const { url } = req.query;
    
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

    // Make the request directly (Vercel doesn't support proxy agents)
    const startTime = Date.now();
    
    const response = await axios({
      url: targetUrl,
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...req.headers
      },
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: (status: number) => status < 500 // Don't throw on 4xx errors
    });

    const responseTime = Date.now() - startTime;

    // Return response
    res.status(response.status).json({
      data: response.data,
      status: response.status,
      headers: response.headers,
      responseTime: responseTime,
      url: targetUrl,
      method: req.method
    });

  } catch (error: any) {
    console.error('Request failed:', error.message);
    
    res.status(500).json({
      error: 'Request failed',
      message: error.message,
      code: error.code
    });
  }
}