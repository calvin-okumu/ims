/**
 * WebUSB-based fingerprint scanner service for ZK8500R
 * Provides browser-native USB device access without additional software
 */

// WebUSB Type Definitions
declare global {
  interface Navigator {
    usb: USB;
  }

  interface USB {
    getDevices(): Promise<USBDevice[]>;
    requestDevice(options?: USBDeviceRequestOptions): Promise<USBDevice>;
  }

  interface USBDevice {
    readonly vendorId: number;
    readonly productId: number;
    readonly productName?: string;
    readonly opened: boolean;
    open(): Promise<void>;
    close(): Promise<void>;
    claimInterface(interfaceNumber: number): Promise<void>;
    releaseInterface(interfaceNumber: number): Promise<void>;
    transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
  }

  interface USBDeviceRequestOptions {
    filters?: USBDeviceFilter[];
  }

  interface USBDeviceFilter {
    vendorId?: number;
    productId?: number;
    classCode?: number;
    subclassCode?: number;
    protocolCode?: number;
    serialNumber?: string;
  }

  interface USBInTransferResult {
    readonly data?: DataView;
    readonly status: 'ok' | 'stall' | 'babble';
  }

  interface USBOutTransferResult {
    readonly bytesWritten: number;
    readonly status: 'ok' | 'stall';
  }
}

interface FingerprintData {
  template: string;
  quality: number;
  capturedAt: string;
  bioType: number;
  version: string;
  templateNo: string;
}

interface ScannerStatus {
  connected: boolean;
  device?: USBDevice;
  supported: boolean;
  permissionGranted: boolean;
}

class WebUSBScannerService {
  private device: USBDevice | null = null;
  private status: ScannerStatus = {
    connected: false,
    supported: false,
    permissionGranted: false
  };

  constructor() {
    this.checkBrowserSupport();
  }

  /**
   * Check if WebUSB is supported in current browser
   */
  private checkBrowserSupport(): void {
    this.status.supported = 'usb' in navigator;
  }

  /**
   * Get current scanner status
   */
  getStatus(): ScannerStatus {
    return { ...this.status };
  }

  /**
   * Request user permission to access USB devices
   */
  async requestDevice(): Promise<boolean> {
    if (!this.status.supported) {
      throw new Error('WebUSB is not supported in this browser. Please use Chrome, Edge, or Opera.');
    }

    try {
      // ZK8500R USB Vendor/Product IDs (these may need to be verified)
      const device = await navigator.usb.requestDevice({
        filters: [
          // ZKTeco vendor ID
          { vendorId: 0x2109 }, // Common ZKTeco vendor ID
          // Add specific product IDs if known
          { vendorId: 0x2109, productId: 0x8500 } // Example ZK8500R product ID
        ]
      });

      this.device = device;
      this.status.connected = true;
      this.status.device = device;
      this.status.permissionGranted = true;

      return true;
    } catch (error) {
      console.error('Failed to request USB device:', error);
      this.status.permissionGranted = false;
      return false;
    }
  }

  /**
   * Connect to already paired device
   */
  async connectDevice(): Promise<boolean> {
    if (!this.status.supported) {
      throw new Error('WebUSB is not supported in this browser.');
    }

    try {
      const devices = await navigator.usb.getDevices();
      const zkDevice = devices.find((device: USBDevice) =>
        device.vendorId === 0x2109 || // ZKTeco vendor ID
        device.productId === 0x8500    // ZK8500R product ID
      );

      if (zkDevice) {
        this.device = zkDevice;
        await this.device.open();
        this.status.connected = true;
        this.status.device = zkDevice;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to connect to device:', error);
      return false;
    }
  }

  /**
   * Capture fingerprint from scanner
   */
  async captureFingerprint(fingerIndex: number = 0): Promise<FingerprintData> {
    if (!this.device || !this.status.connected) {
      throw new Error('Scanner not connected. Please connect the device first.');
    }

    try {
      // Open device if not already open
      if (!this.device.opened) {
        await this.device.open();
      }

      // Claim interface (usually interface 0 for fingerprint scanners)
      await this.device.claimInterface(0);

      // Send capture command (ZK8500R specific protocol)
      const captureCommand = new Uint8Array([
        0x01, // Command type
        fingerIndex, // Finger index
        0x00, 0x00 // Padding
      ]);

      await this.device.transferOut(1, captureCommand);

      // Wait for response (adjust timeout as needed)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Read fingerprint data
      const result = await this.device.transferIn(1, 1024);
      const data = new Uint8Array(result.data!.buffer);

      // Parse fingerprint template (simplified - actual parsing depends on ZK protocol)
      const template = this.parseFingerprintTemplate(data);
      const quality = this.calculateQualityScore(data);

      return {
        template: btoa(String.fromCharCode(...template)),
        quality,
        capturedAt: new Date().toISOString(),
        bioType: 1, // Fingerprint
        version: '10.0',
        templateNo: fingerIndex.toString()
      };

    } catch (error) {
      console.error('Fingerprint capture failed:', error);
      throw new Error(`Fingerprint capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Release interface
      try {
        await this.device.releaseInterface(0);
      } catch (e) {
        // Ignore release errors
      }
    }
  }

  /**
   * Parse raw fingerprint data into template format
   * This is a simplified implementation - actual parsing depends on ZK8500R protocol
   */
  private parseFingerprintTemplate(data: Uint8Array): Uint8Array {
    // Skip header bytes and extract template data
    // This is protocol-specific and may need adjustment
    const headerSize = 8; // Assume 8-byte header
    const templateSize = 512; // Typical template size

    if (data.length < headerSize + templateSize) {
      throw new Error('Invalid fingerprint data received');
    }

    return data.slice(headerSize, headerSize + templateSize);
  }

  /**
   * Calculate quality score from raw data
   */
  private calculateQualityScore(data: Uint8Array): number {
    // Simplified quality calculation
    // In real implementation, this would analyze template characteristics
    const qualityByte = data[4] || 0; // Assume quality is in byte 4
    return Math.min(100, Math.max(0, qualityByte));
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    if (this.device && this.device.opened) {
      try {
        await this.device.close();
      } catch (error) {
        console.error('Error closing device:', error);
      }
    }

    this.device = null;
    this.status.connected = false;
    this.status.device = undefined;
  }

  /**
   * Get device information
   */
  getDeviceInfo(): { vendorId: number; productId: number; productName?: string } | null {
    if (!this.device) return null;

    return {
      vendorId: this.device.vendorId,
      productId: this.device.productId,
      productName: this.device.productName
    };
  }
}

// Export singleton instance
export const webUSBScanner = new WebUSBScannerService();
export type { FingerprintData, ScannerStatus };