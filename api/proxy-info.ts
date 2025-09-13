import { VercelRequest, VercelResponse } from '@vercel/node';

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
    // Return service information
    res.status(200).json({
      service: 'Whiskey URL Fetcher',
      description: 'A simple URL fetching service that works on Vercel',
      version: '1.0.0',
      features: [
        'URL fetching and forwarding',
        'CORS support',
        'JSON response formatting',
        'Error handling'
      ],
      endpoints: {
        '/api/proxy': 'Fetch any URL and return the response',
        '/api/proxy-info': 'Get service information',
        '/api/proxy-stats': 'Get service statistics'
      },
      usage: {
        example: '/api/proxy?url=https://httpbin.org/ip',
        description: 'Add ?url=YOUR_URL to fetch any URL'
      }
    });

  } catch (error: any) {
    console.error('Error getting service info:', error.message);
    res.status(500).json({
      error: 'Failed to get service information',
      message: error.message
    });
  }
}