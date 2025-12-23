'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, AlertCircle, CheckCircle, Loader2, Zap, Edit } from 'lucide-react';

interface ScannerStatus {
  bridgeAvailable: boolean;
  bridgeConnected: boolean;
  deviceConnected?: boolean;
  sdkAvailable?: boolean;
  mockMode?: boolean;
  manualEntryAvailable: boolean;
}

interface ScannerStatusIndicatorProps {
  onScannerStatusChange?: (status: ScannerStatus) => void;
}

const ScannerStatusIndicator: React.FC<ScannerStatusIndicatorProps> = ({ onScannerStatusChange }) => {
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>({
    bridgeAvailable: false,
    bridgeConnected: false,
    manualEntryAvailable: true
  });
  const [isConnectingBridge, setIsConnectingBridge] = useState(false);

  useEffect(() => {
    // Check bridge availability on mount
    checkBridgeAvailability();
  }, []);

  const checkBridgeAvailability = async () => {
    try {
      const ws = new WebSocket('ws://localhost:8765');

      return new Promise<void>((resolve) => {
        ws.onopen = () => {
          // Request device status
          ws.send(JSON.stringify({ action: 'status' }));

          ws.onmessage = (event) => {
            try {
              const response = JSON.parse(event.data);
              if (response.status === 'info' && response.device_status) {
                const deviceStatus = response.device_status;
                setScannerStatus(prev => ({
                  ...prev,
                  bridgeAvailable: true,
                  bridgeConnected: deviceStatus.device_connected || false,
                  deviceConnected: deviceStatus.device_connected || false,
                  sdkAvailable: deviceStatus.sdk_available || false,
                  mockMode: deviceStatus.mock_mode || false
                }));
              }
            } catch (e) {
              console.warn('Failed to parse device status:', e);
            }
            ws.close();
            resolve();
          };

          ws.onerror = () => {
            setScannerStatus(prev => ({
              ...prev,
              bridgeAvailable: false,
              bridgeConnected: false,
              deviceConnected: false
            }));
            resolve();
          };
        };

        ws.onerror = () => {
          setScannerStatus(prev => ({
            ...prev,
            bridgeAvailable: false,
            bridgeConnected: false,
            deviceConnected: false
          }));
          resolve();
        };

        // Timeout after 3 seconds
        setTimeout(() => {
          setScannerStatus(prev => ({
            ...prev,
            bridgeAvailable: false,
            bridgeConnected: false,
            deviceConnected: false
          }));
          ws.close();
          resolve();
        }, 3000);
      });
    } catch (error) {
      setScannerStatus(prev => ({
        ...prev,
        bridgeAvailable: false,
        bridgeConnected: false,
        deviceConnected: false
      }));
    }
  };

  const handleConnectBridge = async () => {
    setIsConnectingBridge(true);
    try {
      const ws = new WebSocket('ws://localhost:8765');

      return new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          setScannerStatus(prev => ({ ...prev, bridgeConnected: true }));
          ws.close();
          resolve();
        };

        ws.onerror = () => {
          setScannerStatus(prev => ({ ...prev, bridgeConnected: false }));
          reject(new Error('Failed to connect to bridge'));
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          setScannerStatus(prev => ({ ...prev, bridgeConnected: false }));
          ws.close();
          reject(new Error('Bridge connection timeout'));
        }, 5000);
      });
    } catch (error) {
      console.error('Failed to connect to bridge:', error);
      setScannerStatus(prev => ({ ...prev, bridgeConnected: false }));
    } finally {
      setIsConnectingBridge(false);
    }
  };

  const getStatusIcon = () => {
    if (scannerStatus.deviceConnected && scannerStatus.bridgeConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (scannerStatus.bridgeConnected && scannerStatus.mockMode) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    if (isConnectingBridge) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (scannerStatus.bridgeAvailable) {
      return <Zap className="w-4 h-4 text-blue-500" />;
    }
    return <Fingerprint className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (scannerStatus.deviceConnected && scannerStatus.bridgeConnected) {
      return 'Device connected - ready to capture';
    }
    if (scannerStatus.bridgeConnected && scannerStatus.mockMode) {
      return 'Bridge connected (mock mode) - device not detected';
    }
    if (isConnectingBridge) {
      return 'Connecting to bridge service...';
    }
    if (scannerStatus.bridgeAvailable) {
      return 'Bridge service available - click to connect';
    }
    return 'Bridge service not available - manual entry only';
  };

  const getStatusColor = () => {
    if (scannerStatus.deviceConnected && scannerStatus.bridgeConnected) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    if (scannerStatus.bridgeConnected && scannerStatus.mockMode) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    if (isConnectingBridge) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (scannerStatus.bridgeAvailable) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  return (
    <div className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="ml-2">{getStatusText()}</span>
      {!scannerStatus.bridgeConnected && (
        <div className="ml-3 flex gap-2">
          {scannerStatus.bridgeAvailable && !isConnectingBridge && (
            <button
              onClick={handleConnectBridge}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Connect Bridge
            </button>
          )}
          {!scannerStatus.bridgeAvailable && (
            <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded flex items-center gap-1">
              <Edit className="w-3 h-3" />
              Manual Entry Only
            </span>
          )}
        </div>
      )}
      {scannerStatus.bridgeConnected && (
        <div className="ml-3 flex gap-2">
          {scannerStatus.deviceConnected && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded flex items-center gap-1">
              <Fingerprint className="w-3 h-3" />
              Device Ready
            </span>
          )}
          {scannerStatus.mockMode && (
            <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Mock Mode
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ScannerStatusIndicator;