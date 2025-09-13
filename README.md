# Whiskey URL Fetcher

A simple, clean URL fetching service that works perfectly on Vercel. This service allows you to fetch any URL and get the response, with CORS support and JSON formatting.

## ✨ Features

- **Simple Interface**: Clean, minimal UI with just a search bar and buttons
- **URL Fetching**: Fetch any URL and get the response
- **CORS Support**: Works from any domain without CORS issues
- **JSON Formatting**: Automatically formats JSON responses for better readability
- **Error Handling**: Comprehensive error handling and status reporting
- **Vercel Compatible**: Designed specifically to work on Vercel's serverless platform

## 🚀 How to Use

1. **Enter a URL** in the search bar
2. **Click "Fetch"** to get the response
3. **View the result** in a clean, formatted display

### Example URLs to try:
- `https://httpbin.org/ip` - Get your IP address
- `https://httpbin.org/json` - Get JSON data
- `https://api.github.com/users/octocat` - GitHub API
- `https://jsonplaceholder.typicode.com/posts/1` - JSON Placeholder

## 🛠 API Endpoints

### GET `/api/proxy`
Fetch any URL and return the response.

**Parameters:**
- `url` (required): The URL to fetch

**Example:**
```
GET /api/proxy?url=https://httpbin.org/ip
```

**Response:**
```json
{
  "data": { "origin": "1.2.3.4" },
  "status": 200,
  "headers": { ... },
  "responseTime": 150,
  "url": "https://httpbin.org/ip",
  "method": "GET"
}
```

### GET `/api/proxy-info`
Get service information.

### GET `/api/proxy-stats`
Get service statistics.

### GET `/api/proxy-test`
Test the service with multiple requests.

## 🚀 Deployment

This project is designed to work on Vercel:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```

3. **Or connect your GitHub repository to Vercel for automatic deployments**

## 📁 Project Structure

```
whiskey/
├── api/
│   ├── proxy.ts          # Main URL fetching endpoint
│   ├── proxy-info.ts     # Service information
│   ├── proxy-stats.ts    # Service statistics
│   └── proxy-test.ts     # Testing endpoint
├── index.html            # Frontend interface
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies
└── README.md           # This file
```

## 🔧 Configuration

The service is configured in `vercel.json`:

- **Functions**: Serverless function configurations
- **Rewrites**: URL rewriting rules for clean URLs
- **Routes**: Routing configuration

## 🌟 Why This Approach?

This service uses a different approach than traditional proxy servers:

1. **Vercel Compatible**: Works within Vercel's serverless constraints
2. **No Proxy Servers**: Uses direct HTTP requests instead of proxy servers
3. **CORS Friendly**: Handles CORS issues by acting as a server-side fetcher
4. **Simple & Fast**: Minimal overhead and fast responses

## 📝 License

MIT License - feel free to use this project for your own needs!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.