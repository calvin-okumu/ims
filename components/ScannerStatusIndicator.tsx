'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, Usb, AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react';
import { webUSBScanner, type ScannerStatus } from '../services/webUSBScannerService';

interface ScannerStatusIndicatorProps {
  onScannerStatusChange?: (status: ScannerStatus) => void;
}

const ScannerStatusIndicator: React.FC<ScannerStatusIndicatorProps> = ({ onScannerStatusChange }) => {
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>(webUSBScanner.getStatus());
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Update status on mount
    const status = webUSBScanner.getStatus();
    setScannerStatus(status);
    onScannerStatusChange?.(status);
  }, [onScannerStatusChange]);

  const handleConnectScanner = async () => {
    setIsConnecting(true);
    try {
      const success = await webUSBScanner.requestDevice();
      if (success) {
        const newStatus = webUSBScanner.getStatus();
        setScannerStatus(newStatus);
        onScannerStatusChange?.(newStatus);
      }
    } catch (error) {
      console.error('Failed to connect scanner:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (!scannerStatus.supported) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (scannerStatus.connected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (isConnecting) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    return <Usb className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (!scannerStatus.supported) {
      return 'WebUSB not supported';
    }
    if (scannerStatus.connected) {
      return 'Scanner connected';
    }
    if (isConnecting) {
      return 'Connecting...';
    }
    if (scannerStatus.permissionGranted === false) {
      return 'Permission denied';
    }
    return 'Scanner not connected';
  };

  const getStatusColor = () => {
    if (!scannerStatus.supported) return 'text-red-600 bg-red-50 border-red-200';
    if (scannerStatus.connected) return 'text-green-600 bg-green-50 border-green-200';
    if (isConnecting) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="ml-2">{getStatusText()}</span>
      {!scannerStatus.connected && scannerStatus.supported && !isConnecting && (
        <button
          onClick={handleConnectScanner}
          className="ml-3 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Zap className="w-3 h-3" />
          Connect
        </button>
      )}
      {scannerStatus.connected && scannerStatus.device && (
        <div className="ml-3 text-xs text-gray-500">
          {scannerStatus.device.productName || `Device ${scannerStatus.device.vendorId}:${scannerStatus.device.productId}`}
        </div>
      )}
    </div>
  );
};

export default ScannerStatusIndicator;