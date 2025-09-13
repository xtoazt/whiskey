import fs from 'fs';
import path from 'path';

export interface Proxy {
  host: string;
  port: number;
  type: 'http' | 'socks4' | 'socks5';
  country: string;
  speed: number;
  lastUsed?: number;
  isHealthy?: boolean;
}

class ProxyManager {
  private proxies: Proxy[] = [];
  private currentProxyIndex: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadProxies();
    this.startHealthCheck();
  }

  private loadProxies() {
    try {
      const proxiesPath = path.join(__dirname, '..', 'proxies.json');
      const data = fs.readFileSync(proxiesPath, 'utf8');
      this.proxies = JSON.parse(data);
      console.log(`Loaded ${this.proxies.length} proxies`);
    } catch (error) {
      console.error('Failed to load proxies:', error);
      this.proxies = [];
    }
  }

  private startHealthCheck() {
    // Check proxy health every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.checkProxyHealth();
    }, 5 * 60 * 1000);
  }

  private async checkProxyHealth() {
    const testUrl = 'https://httpbin.org/ip';
    const promises = this.proxies.slice(0, 20).map(async (proxy, index) => {
      try {
        const startTime = Date.now();
        
        // Test with axios using the proxy
        const axios = require('axios');
        const response = await axios({
          url: testUrl,
          method: 'GET',
          proxy: {
            protocol: 'http',
            host: proxy.host,
            port: proxy.port
          },
          timeout: 10000,
          validateStatus: (status: number) => status < 500
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.status === 200) {
          this.proxies[index].speed = responseTime;
          this.proxies[index].isHealthy = true;
          console.log(`Proxy ${proxy.host}:${proxy.port} is healthy (${responseTime}ms)`);
        } else {
          this.proxies[index].isHealthy = false;
          console.log(`Proxy ${proxy.host}:${proxy.port} returned status ${response.status}`);
        }
      } catch (error: any) {
        this.proxies[index].isHealthy = false;
        console.log(`Proxy ${proxy.host}:${proxy.port} failed health check:`, error.message);
      }
    });

    await Promise.allSettled(promises);
  }

  public getRandomProxy(): Proxy | null {
    const healthyProxies = this.proxies.filter(p => p.isHealthy !== false);
    if (healthyProxies.length === 0) {
      return this.proxies[Math.floor(Math.random() * this.proxies.length)] || null;
    }
    return healthyProxies[Math.floor(Math.random() * healthyProxies.length)];
  }

  public getFastestProxy(): Proxy | null {
    const healthyProxies = this.proxies.filter(p => p.isHealthy !== false && p.speed > 0);
    if (healthyProxies.length === 0) {
      return this.getRandomProxy();
    }
    return healthyProxies.reduce((fastest, current) => 
      current.speed < fastest.speed ? current : fastest
    );
  }

  public getNextProxy(): Proxy | null {
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }

  public getAllProxies(): Proxy[] {
    return [...this.proxies];
  }

  public getProxyStats() {
    const total = this.proxies.length;
    const healthy = this.proxies.filter(p => p.isHealthy === true).length;
    const unhealthy = this.proxies.filter(p => p.isHealthy === false).length;
    const untested = this.proxies.filter(p => p.isHealthy === undefined).length;

    return {
      total,
      healthy,
      unhealthy,
      untested,
      currentIndex: this.currentProxyIndex
    };
  }

  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Singleton instance
export const proxyManager = new ProxyManager();
