import { ProxyServer, PROXY_LIST } from '../config/proxies';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios, { AxiosRequestConfig } from 'axios';

export class ProxyManager {
  private proxies: ProxyServer[] = [...PROXY_LIST];
  private currentIndex = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHealthCheck();
  }

  private startHealthCheck() {
    // Check proxy health every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.checkAllProxies();
    }, 5 * 60 * 1000);
  }

  private async checkAllProxies() {
    const checkPromises = this.proxies.map(proxy => this.checkProxyHealth(proxy));
    await Promise.allSettled(checkPromises);
  }

  private async checkProxyHealth(proxy: ProxyServer): Promise<boolean> {
    try {
      const startTime = Date.now();
      const agent = this.createProxyAgent(proxy);
      
      const config: AxiosRequestConfig = {
        httpsAgent: agent,
        timeout: 10000,
        url: 'https://httpbin.org/ip',
        method: 'GET'
      };

      await axios(config);
      
      const responseTime = Date.now() - startTime;
      proxy.isHealthy = true;
      proxy.lastChecked = new Date();
      proxy.responseTime = responseTime;
      
      return true;
    } catch (error) {
      proxy.isHealthy = false;
      proxy.lastChecked = new Date();
      return false;
    }
  }

  private createProxyAgent(proxy: ProxyServer) {
    const proxyUrl = `${proxy.type}://${proxy.host}:${proxy.port}`;
    
    switch (proxy.type) {
      case 'socks4':
      case 'socks5':
        return new SocksProxyAgent(proxyUrl);
      case 'http':
        return new HttpsProxyAgent(proxyUrl);
      default:
        throw new Error(`Unsupported proxy type: ${proxy.type}`);
    }
  }

  public getNextProxy(): ProxyServer | null {
    const healthyProxies = this.proxies.filter(p => p.isHealthy !== false);
    
    if (healthyProxies.length === 0) {
      // If no healthy proxies, try any proxy
      const proxy = this.proxies[this.currentIndex % this.proxies.length];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
      return proxy;
    }

    // Sort by response time and uptime for better performance
    healthyProxies.sort((a, b) => {
      const scoreA = (a.uptime / 100) * (10000 / a.responseTime);
      const scoreB = (b.uptime / 100) * (10000 / b.responseTime);
      return scoreB - scoreA;
    });

    const proxy = healthyProxies[0];
    this.currentIndex = (this.currentIndex + 1) % healthyProxies.length;
    return proxy;
  }

  public getRandomProxy(): ProxyServer | null {
    const healthyProxies = this.proxies.filter(p => p.isHealthy !== false);
    
    if (healthyProxies.length === 0) {
      return this.proxies[Math.floor(Math.random() * this.proxies.length)];
    }

    return healthyProxies[Math.floor(Math.random() * healthyProxies.length)];
  }

  public getFastestProxy(): ProxyServer | null {
    const healthyProxies = this.proxies.filter(p => p.isHealthy !== false);
    
    if (healthyProxies.length === 0) {
      // If no healthy proxies, return the one with best historical performance
      return this.proxies.sort((a, b) => {
        const scoreA = (a.uptime / 100) * (10000 / a.responseTime);
        const scoreB = (b.uptime / 100) * (10000 / b.responseTime);
        return scoreB - scoreA;
      })[0];
    }

    // Sort by response time (fastest first), then by uptime
    healthyProxies.sort((a, b) => {
      if (a.responseTime !== b.responseTime) {
        return a.responseTime - b.responseTime;
      }
      return b.uptime - a.uptime;
    });

    return healthyProxies[0];
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
      healthPercentage: total > 0 ? (healthy / total) * 100 : 0
    };
  }

  public getAllProxies(): ProxyServer[] {
    return [...this.proxies];
  }

  public getProxiesByCountry(country: string): ProxyServer[] {
    return this.proxies.filter(p => p.country === country);
  }

  public getProxiesByType(type: 'http' | 'socks4' | 'socks5'): ProxyServer[] {
    return this.proxies.filter(p => p.type === type);
  }

  public createAxiosConfig(proxy?: ProxyServer): AxiosRequestConfig {
    const targetProxy = proxy || this.getNextProxy();
    
    if (!targetProxy) {
      throw new Error('No proxy available');
    }

    const agent = this.createProxyAgent(targetProxy);
    
    return {
      httpsAgent: agent,
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
  }

  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Singleton instance
export const proxyManager = new ProxyManager();
