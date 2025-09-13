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
    // Return service statistics
    res.status(200).json({
      service: 'Whiskey URL Fetcher',
      status: 'online',
      uptime: '100%',
      features: {
        urlFetching: true,
        corsSupport: true,
        jsonFormatting: true,
        errorHandling: true
      },
      limits: {
        maxResponseSize: '50MB',
        timeout: '30 seconds',
        maxRedirects: 5
      },
      supportedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      supportedContentTypes: [
        'application/json',
        'text/html',
        'text/plain',
        'application/xml',
        'text/xml'
      ]
    });

  } catch (error: any) {
    console.error('Error getting service stats:', error.message);
    res.status(500).json({
      error: 'Failed to get service statistics',
      message: error.message
    });
  }
}