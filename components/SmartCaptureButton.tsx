'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, Loader2, CheckCircle, X, AlertCircle, Zap } from 'lucide-react';
import { fingerprintCaptureManager, type CaptureStatus } from '../services/fingerprintCaptureManager';

interface SmartCaptureButtonProps {
  fingerIndex?: number;
  onCaptureSuccess?: (data: any) => void;
  onCaptureError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

const SmartCaptureButton: React.FC<SmartCaptureButtonProps> = ({
  fingerIndex = 0,
  onCaptureSuccess,
  onCaptureError,
  disabled = false,
  className = ''
}) => {
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>(fingerprintCaptureManager.getStatus());
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // Subscribe to status updates
    const unsubscribe = fingerprintCaptureManager.onStatusUpdate((status) => {
      setCaptureStatus(status);
      setIsCapturing(status.status !== 'idle' && status.status !== 'completed' && status.status !== 'error');
    });

    return unsubscribe;
  }, []);

  const handleCapture = async () => {
    if (isCapturing || disabled) return;

    try {
      setIsCapturing(true);
      const fingerprintData = await fingerprintCaptureManager.startCapture(fingerIndex);
      onCaptureSuccess?.(fingerprintData);
    } catch (error) {
      onCaptureError?.(error as Error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCancel = () => {
    fingerprintCaptureManager.cancelCapture();
  };

  const getButtonIcon = () => {
    if (captureStatus.status === 'completed') {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (captureStatus.status === 'error') {
      return <X className="w-5 h-5" />;
    }
    if (isCapturing) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    return <Fingerprint className="w-5 h-5" />;
  };

  const getButtonText = () => {
    if (captureStatus.status === 'completed') {
      return 'Captured!';
    }
    if (captureStatus.status === 'error') {
      return 'Failed';
    }
    if (isCapturing) {
      return 'Capturing...';
    }
    return 'Smart Capture';
  };

  const getButtonColor = () => {
    if (captureStatus.status === 'completed') {
      return 'bg-green-600 hover:bg-green-700';
    }
    if (captureStatus.status === 'error') {
      return 'bg-red-600 hover:bg-red-700';
    }
    if (isCapturing) {
      return 'bg-blue-600 hover:bg-blue-700';
    }
    return 'bg-purple-600 hover:bg-purple-700';
  };

  const getProgressBar = () => {
    if (!isCapturing || captureStatus.progress === 0) return null;

    return (
      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${captureStatus.progress}%` }}
        />
      </div>
    );
  };

  const getStatusMessage = () => {
    if (!isCapturing && captureStatus.status === 'idle') return null;

    return (
      <div className="mt-2 text-sm text-center">
        {captureStatus.status === 'error' && (
          <div className="flex items-center justify-center gap-1 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{captureStatus.message}</span>
          </div>
        )}
        {captureStatus.status === 'completed' && (
          <div className="flex items-center justify-center gap-1 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>{captureStatus.message}</span>
          </div>
        )}
        {isCapturing && (
          <div className="text-blue-400">
            {captureStatus.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isCapturing ? handleCancel : handleCapture}
        disabled={disabled}
        className={`
          ${getButtonColor()}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium
          ${className}
        `}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
        {isCapturing && (
          <span className="text-xs">({captureStatus.progress}%)</span>
        )}
      </button>

      {getProgressBar()}
      {getStatusMessage()}

      {captureStatus.platform && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>Platform: {captureStatus.platform}</span>
        </div>
      )}
    </div>
  );
};

export default SmartCaptureButton;