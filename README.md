# 🥃 Whiskey Proxy Service

A high-performance web proxy service that uses rotating proxy servers to route requests. Built for Vercel deployment with TypeScript and modern web technologies.

## Features

- **Rotating Proxy Pool**: 100+ proxy servers from around the world
- **Multiple Proxy Types**: HTTP, SOCKS4, and SOCKS5 support
- **Health Monitoring**: Automatic proxy health checking and rotation
- **Geographic Filtering**: Filter proxies by country
- **Performance Metrics**: Real-time statistics and performance monitoring
- **RESTful API**: Easy integration with any application
- **Modern Web Interface**: Beautiful, responsive UI for testing and management

## API Endpoints

### 1. Proxy Request
```
GET /api/proxy?url=<target_url>&method=<http_method>&proxyType=<type>&country=<country>
```

**Parameters:**
- `url` (required): Target URL to proxy
- `method`: HTTP method (GET, POST, PUT, DELETE) - default: GET
- `proxyType`: Proxy type filter (http, socks4, socks5)
- `country`: Country code filter (US, CA, GB, etc.)
- `data`: JSON data for POST/PUT requests

**Example:**
```bash
curl "https://your-domain.vercel.app/api/proxy?url=https://httpbin.org/ip&proxyType=http&country=US"
```

### 2. Proxy Information
```
GET /api/proxy-info?type=<proxy_type>&country=<country>&limit=<number>
```

Returns detailed information about available proxies with filtering options.

### 3. Proxy Statistics
```
GET /api/proxy-stats
```

Returns comprehensive statistics about proxy performance, health, and distribution.

### 4. Proxy Testing
```
GET /api/proxy-test?testUrl=<url>&count=<number>&proxyType=<type>&country=<country>
```

Tests multiple proxies and returns performance metrics.

## Deployment on Vercel

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build the Project:**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

4. **Environment Variables:**
   No environment variables required - the service uses the provided proxy list.

## Project Structure

```
whiskey/
├── api/                    # Vercel serverless functions
│   ├── proxy.ts           # Main proxy handler
│   ├── proxy-info.ts      # Proxy information endpoint
│   ├── proxy-stats.ts     # Statistics endpoint
│   └── proxy-test.ts      # Testing endpoint
├── src/                   # Source code
│   ├── config/
│   │   └── proxies.ts     # Proxy server configuration
│   └── utils/
│       └── proxyManager.ts # Proxy management logic
├── index.html             # Web interface
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment configuration
└── README.md              # This file
```

## Usage Examples

### JavaScript/Node.js
```javascript
const response = await fetch('https://your-domain.vercel.app/api/proxy?url=https://httpbin.org/ip&proxyType=http&country=US');
const data = await response.json();
console.log(data);
```

### Python
```python
import requests

response = requests.get('https://your-domain.vercel.app/api/proxy', params={
    'url': 'https://httpbin.org/ip',
    'proxyType': 'http',
    'country': 'US'
})
print(response.json())
```

### cURL
```bash
curl "https://your-domain.vercel.app/api/proxy?url=https://httpbin.org/ip&method=GET&proxyType=socks5&country=CA"
```

## Proxy Types Supported

- **HTTP Proxies**: Standard HTTP proxy servers
- **SOCKS4**: SOCKS4 proxy protocol
- **SOCKS5**: SOCKS5 proxy protocol with authentication support

## Countries Available

The service includes proxies from 50+ countries including:
- United States (US)
- Canada (CA)
- United Kingdom (GB)
- Germany (DE)
- France (FR)
- Japan (JP)
- And many more...

## Performance Features

- **Automatic Health Checking**: Proxies are tested every 5 minutes
- **Smart Rotation**: Best performing proxies are prioritized
- **Response Time Tracking**: Real-time performance metrics
- **Uptime Monitoring**: Track proxy reliability
- **Geographic Distribution**: Global proxy coverage

## Rate Limits

- Maximum 20 concurrent proxy tests
- 30-second timeout for proxy requests
- Automatic retry with different proxies on failure

## Security

- CORS enabled for cross-origin requests
- Input validation and sanitization
- No logging of sensitive data
- Automatic proxy rotation for anonymity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub or contact the maintainers.

---

**Note**: This service is for educational and legitimate use cases only. Please respect the terms of service of target websites and applicable laws.
