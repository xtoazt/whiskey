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
    // For Vercel compatibility, we'll simulate health checking
    // In a real environment, you'd test actual proxy connections
    console.log('Starting proxy health check...');
    
    // Mark all proxies as healthy initially (since we can't test them properly on Vercel)
    this.proxies.forEach((proxy, index) => {
      // Simulate some proxies being healthy and some not
      const isHealthy = Math.random() > 0.3; // 70% chance of being healthy
      this.proxies[index].isHealthy = isHealthy;
      this.proxies[index].speed = isHealthy ? Math.floor(Math.random() * 2000) + 500 : 0;
      
      if (isHealthy) {
        console.log(`Proxy ${proxy.host}:${proxy.port} marked as healthy (simulated)`);
      } else {
        console.log(`Proxy ${proxy.host}:${proxy.port} marked as unhealthy (simulated)`);
      }
    });
    
    console.log(`Health check completed. ${this.proxies.filter(p => p.isHealthy).length}/${this.proxies.length} proxies healthy`);
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
