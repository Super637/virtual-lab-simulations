/**
 * Network Monitoring and Health Check Utilities
 * Provides real-time monitoring of external lab links and network connectivity
 */

import { debugLogger } from './debugLogger';

export interface NetworkHealthCheck {
  url: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  responseTime?: number;
  lastChecked: Date;
  errorMessage?: string;
}

export interface NetworkMonitorConfig {
  checkInterval: number; // milliseconds
  timeout: number; // milliseconds
  retryAttempts: number;
}

class NetworkMonitor {
  private config: NetworkMonitorConfig;
  private healthChecks: Map<string, NetworkHealthCheck>;
  private intervals: Map<string, NodeJS.Timeout>;
  private isMonitoring: boolean = false;

  constructor(config: Partial<NetworkMonitorConfig> = {}) {
    this.config = {
      checkInterval: 60000, // 1 minute
      timeout: 10000, // 10 seconds
      retryAttempts: 3,
      ...config
    };
    this.healthChecks = new Map();
    this.intervals = new Map();

    debugLogger.info('NETWORK_MONITOR', 'Network monitor initialized', {
      config: this.config
    });
  }

  /**
   * Add a URL to monitor for health status
   */
  addUrl(url: string, immediate: boolean = true): void {
    debugLogger.info('NETWORK_MONITOR', 'Adding URL to monitoring', { url });

    if (this.healthChecks.has(url)) {
      debugLogger.warn('NETWORK_MONITOR', 'URL already being monitored', { url });
      return;
    }

    const healthCheck: NetworkHealthCheck = {
      url,
      status: 'checking',
      lastChecked: new Date()
    };

    this.healthChecks.set(url, healthCheck);

    if (immediate) {
      this.checkUrl(url);
    }

    if (this.isMonitoring) {
      this.startMonitoringUrl(url);
    }
  }

  /**
   * Remove a URL from monitoring
   */
  removeUrl(url: string): void {
    debugLogger.info('NETWORK_MONITOR', 'Removing URL from monitoring', { url });

    const interval = this.intervals.get(url);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(url);
    }

    this.healthChecks.delete(url);
  }

  /**
   * Start monitoring all added URLs
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      debugLogger.warn('NETWORK_MONITOR', 'Monitoring already started');
      return;
    }

    debugLogger.info('NETWORK_MONITOR', 'Starting network monitoring', {
      urlCount: this.healthChecks.size,
      interval: this.config.checkInterval
    });

    this.isMonitoring = true;

    for (const url of this.healthChecks.keys()) {
      this.startMonitoringUrl(url);
    }
  }

  /**
   * Stop monitoring all URLs
   */
  stopMonitoring(): void {
    debugLogger.info('NETWORK_MONITOR', 'Stopping network monitoring');

    this.isMonitoring = false;

    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }

  /**
   * Get health status for a specific URL
   */
  getHealthStatus(url: string): NetworkHealthCheck | undefined {
    return this.healthChecks.get(url);
  }

  /**
   * Get health status for all monitored URLs
   */
  getAllHealthStatus(): NetworkHealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Get summary statistics
   */
  getSummary(): { online: number; offline: number; checking: number; error: number; total: number } {
    const statuses = Array.from(this.healthChecks.values()).map(check => check.status);
    
    return {
      online: statuses.filter(s => s === 'online').length,
      offline: statuses.filter(s => s === 'offline').length,
      checking: statuses.filter(s => s === 'checking').length,
      error: statuses.filter(s => s === 'error').length,
      total: statuses.length
    };
  }

  private startMonitoringUrl(url: string): void {
    const interval = setInterval(() => {
      this.checkUrl(url);
    }, this.config.checkInterval);

    this.intervals.set(url, interval);
  }

  private async checkUrl(url: string): Promise<void> {
    const healthCheck = this.healthChecks.get(url);
    if (!healthCheck) return;

    debugLogger.debug('NETWORK_MONITOR', `Checking URL health: ${url}`);

    const startTime = performance.now();
    let attempt = 0;

    while (attempt < this.config.retryAttempts) {
      try {
        // Use a different approach for CORS-restricted external URLs
        const success = await this.checkUrlConnectivity(url);
        const responseTime = performance.now() - startTime;

        if (success) {
          healthCheck.status = 'online';
          healthCheck.responseTime = responseTime;
          healthCheck.errorMessage = undefined;
          healthCheck.lastChecked = new Date();

          debugLogger.info('NETWORK_MONITOR', `URL is online: ${url}`, {
            responseTime: responseTime.toFixed(2) + 'ms',
            attempts: attempt + 1
          });

          this.healthChecks.set(url, healthCheck);
          return;
        }
      } catch (error) {
        debugLogger.debug('NETWORK_MONITOR', `URL check attempt ${attempt + 1} failed: ${url}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }

      attempt++;
      if (attempt < this.config.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
      }
    }

    // All attempts failed
    healthCheck.status = 'offline';
    healthCheck.responseTime = undefined;
    healthCheck.errorMessage = `Failed after ${this.config.retryAttempts} attempts`;
    healthCheck.lastChecked = new Date();

    debugLogger.warn('NETWORK_MONITOR', `URL appears offline: ${url}`, {
      attempts: this.config.retryAttempts,
      error: healthCheck.errorMessage
    });

    this.healthChecks.set(url, healthCheck);
  }

  private async checkUrlConnectivity(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Use image loading as a connectivity test for external URLs
      // This bypasses CORS restrictions for basic connectivity checking
      const img = new Image();
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, this.config.timeout);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        // Even if image fails to load, the fact that we got a response
        // indicates the server is reachable. We'll try a different approach.
        this.checkUrlWithFetch(url).then(resolve).catch(() => resolve(false));
      };

      // Try to load a favicon or any small resource from the domain
      try {
        const urlObj = new URL(url);
        img.src = `${urlObj.origin}/favicon.ico?_t=${Date.now()}`;
      } catch {
        resolve(false);
      }
    });
  }

  private async checkUrlWithFetch(url: string): Promise<boolean> {
    try {
      // Use fetch with no-cors mode to test connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        debugLogger.debug('NETWORK_MONITOR', 'Fetch request timed out', { url });
      }
      return false;
    }
  }

  /**
   * Perform immediate health check on all URLs
   */
  async checkAllUrls(): Promise<void> {
    debugLogger.info('NETWORK_MONITOR', 'Performing immediate health check on all URLs');

    const promises = Array.from(this.healthChecks.keys()).map(url => this.checkUrl(url));
    await Promise.allSettled(promises);
  }

  /**
   * Get network quality estimation
   */
  getNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
    const summary = this.getSummary();
    
    if (summary.total === 0) return 'unknown';

    const onlinePercentage = (summary.online / summary.total) * 100;
    const avgResponseTime = this.getAverageResponseTime();

    if (onlinePercentage >= 95 && avgResponseTime < 2000) return 'excellent';
    if (onlinePercentage >= 85 && avgResponseTime < 5000) return 'good';
    if (onlinePercentage >= 70 && avgResponseTime < 10000) return 'fair';
    return 'poor';
  }

  private getAverageResponseTime(): number {
    const responseTimes = Array.from(this.healthChecks.values())
      .filter(check => check.responseTime !== undefined)
      .map(check => check.responseTime!);

    if (responseTimes.length === 0) return 0;

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }
}

// Create and export singleton instance
export const networkMonitor = new NetworkMonitor();

// Add lab URLs to monitoring
networkMonitor.addUrl('https://jes-win-hac-ker.github.io/browser-lab-experiments/');
networkMonitor.addUrl('https://jes-win-hac-ker.github.io/interactive-physics-lab/');

// Start monitoring in development mode or when specifically enabled
if (import.meta.env.DEV || localStorage.getItem('virtualLab_enableNetworkMonitoring') === 'true') {
  networkMonitor.startMonitoring();
}

export default networkMonitor;
