/**
 * Smart Fingerprint Capture Manager
 *
 * Automatically detects platform, starts appropriate services,
 * handles capture process, and cleans up afterwards.
 */

// WebSocket-based fingerprint capture only
export interface FingerprintData {
  template: string;
  quality: number;
  capturedAt: string;
  bioType: number;
  version: string;
  templateNo: string;
}

export interface CaptureStatus {
  status: 'idle' | 'detecting' | 'starting_services' | 'connecting' | 'capturing' | 'processing' | 'completed' | 'error';
  message: string;
  progress: number;
  platform?: 'windows' | 'linux' | 'macos' | 'unknown';
  serviceStarted?: boolean;
  servicePid?: number;
}

export class FingerprintCaptureManager {
  private status: CaptureStatus = {
    status: 'idle',
    message: 'Ready to capture',
    progress: 0
  };

  private statusCallbacks: ((status: CaptureStatus) => void)[] = [];
  private abortController: AbortController | null = null;

  constructor() {
    this.detectPlatform();
  }

  /**
   * Detect the operating system
   */
  private detectPlatform(): 'windows' | 'linux' | 'macos' | 'unknown' {
    if (typeof window === 'undefined') {
      // Server-side detection
      const platform = process.platform;
      switch (platform) {
        case 'win32':
          return 'windows';
        case 'linux':
          return 'linux';
        case 'darwin':
          return 'macos';
        default:
          return 'unknown';
      }
    } else {
      // Client-side detection (limited)
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('windows')) return 'windows';
      if (userAgent.includes('linux')) return 'linux';
      if (userAgent.includes('mac')) return 'macos';
      return 'unknown';
    }
  }

  /**
   * Subscribe to status updates
   */
  onStatusUpdate(callback: (status: CaptureStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(updates: Partial<CaptureStatus>) {
    this.status = { ...this.status, ...updates };
    this.statusCallbacks.forEach(callback => callback(this.status));
  }

  /**
   * Start the fingerprint capture process
   */
  async startCapture(fingerIndex: number = 0): Promise<FingerprintData> {
    this.abortController = new AbortController();

    try {
      // Step 1: Platform detection
      this.updateStatus({
        status: 'detecting',
        message: 'Detecting platform and available services...',
        progress: 10
      });

      const platform = this.detectPlatform();
      this.updateStatus({
        platform,
        message: `Detected ${platform} platform`,
        progress: 20
      });

      // Step 2: Start services
      this.updateStatus({
        status: 'starting_services',
        message: 'Starting fingerprint bridge service...',
        progress: 30
      });

      const serviceStarted = await this.startBridgeService(platform);
      if (!serviceStarted) {
        throw new Error('Failed to start bridge service');
      }

      this.updateStatus({
        serviceStarted: true,
        message: 'Bridge service started successfully',
        progress: 50
      });

      // Step 3: Connect to service
      this.updateStatus({
        status: 'connecting',
        message: 'Connecting to fingerprint service...',
        progress: 60
      });

      await this.connectToService();

      // Step 4: Capture fingerprint
      this.updateStatus({
        status: 'capturing',
        message: 'Place finger on scanner...',
        progress: 80
      });

      const fingerprintData = await this.performCapture(fingerIndex);

      // Step 5: Success
      this.updateStatus({
        status: 'completed',
        message: 'Fingerprint captured successfully!',
        progress: 100
      });

      return fingerprintData;

    } catch (error) {
      this.updateStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Capture failed',
        progress: 0
      });
      throw error;
    } finally {
      // Cleanup services
      await this.cleanupServices();
    }
  }

  /**
   * Start the appropriate bridge service for the platform
   */
  private async startBridgeService(platform: string): Promise<boolean> {
    // This would typically make an API call to start the service
    // For now, we'll simulate the process

    try {
      const response = await fetch('/api/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start-service', platform }),
        signal: this.abortController?.signal
      });

      if (!response.ok) {
        throw new Error(`Service start failed: ${response.status}`);
      }

      const result = await response.json();
      this.status.servicePid = result.pid;
      return result.success;

    } catch (error) {
      // Fallback: assume service is already running
      console.warn('Service start API failed, assuming service is running:', error);
      return true;
    }
  }

  /**
   * Connect to the fingerprint service
   */
  private async connectToService(): Promise<void> {
    // Connect to WebSocket bridge service
    try {
      const ws = new WebSocket('ws://localhost:8765');

      return new Promise((resolve, reject) => {
        ws.onopen = () => {
          ws.close();
          resolve();
        };

        ws.onerror = () => {
          reject(new Error('Failed to connect to bridge service'));
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          ws.close();
          reject(new Error('Bridge connection timeout'));
        }, 5000);
      });
    } catch (error) {
      throw new Error(`Bridge connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform the actual fingerprint capture
   */
  private async performCapture(fingerIndex: number): Promise<FingerprintData> {
    const ws = new WebSocket('ws://localhost:8765');

    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        // Set up message handler
        const messageHandler = (event: MessageEvent) => {
          try {
            const response = JSON.parse(event.data);

            if (response.status === 'success') {
              ws.removeEventListener('message', messageHandler);
              ws.close();

              resolve({
                template: response.template,
                quality: response.quality,
                capturedAt: new Date().toISOString(),
                bioType: response.bioType || 1,
                version: response.version || '10.0',
                templateNo: response.fingerIndex?.toString() || fingerIndex.toString()
              });
            } else if (response.status === 'error') {
              ws.removeEventListener('message', messageHandler);
              ws.close();
              reject(new Error(response.message || 'Bridge capture failed'));
            }
          } catch (error) {
            ws.removeEventListener('message', messageHandler);
            ws.close();
            reject(new Error('Invalid response from bridge'));
          }
        };

        ws.addEventListener('message', messageHandler);

        // Send capture request
        ws.send(JSON.stringify({
          action: 'capture',
          fingerIndex: fingerIndex
        }));

        // Timeout after 30 seconds
        setTimeout(() => {
          ws.removeEventListener('message', messageHandler);
          ws.close();
          reject(new Error('Fingerprint capture timeout'));
        }, 30000);
      };

      ws.onerror = () => {
        reject(new Error('Failed to connect to bridge service'));
      };
    });
  }

  /**
   * Clean up services after capture
   */
  private async cleanupServices(): Promise<void> {
    try {
      if (this.status.servicePid) {
        await fetch('/api/fingerprint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'stop-service', pid: this.status.servicePid })
        });
      }
    } catch (error) {
      console.warn('Service cleanup failed:', error);
    }
  }

  /**
   * Cancel the capture process
   */
  cancelCapture(): void {
    this.abortController?.abort();
    this.updateStatus({
      status: 'idle',
      message: 'Capture cancelled',
      progress: 0
    });
  }

  /**
   * Get current status
   */
  getStatus(): CaptureStatus {
    return { ...this.status };
  }
}

// Export singleton instance
export const fingerprintCaptureManager = new FingerprintCaptureManager();