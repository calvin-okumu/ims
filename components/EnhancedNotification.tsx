'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  onClose?: () => void;
  duration?: number;
  persistent?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  duration = 5000,
  persistent = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!persistent && duration > 0 && type !== 'loading') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            setIsVisible(false);
            onClose?.();
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration, persistent, onClose, type]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      case 'loading': return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full shadow-lg rounded-lg border-l-4 transition-all duration-300";

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
      case 'loading':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
    }
  };

  return (
    <div className={getStyles()}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {type !== 'loading' && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {!persistent && duration > 0 && type !== 'loading' && (
        <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
              type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Notification;