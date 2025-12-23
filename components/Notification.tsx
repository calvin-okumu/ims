import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  persistent?: boolean;
}

const Notification: React.FC<NotificationProps> = React.memo(({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
  persistent = false
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoClose && type !== 'loading' && !persistent) {
      const timeout = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [autoClose, duration, onClose, type, persistent]);

  useEffect(() => {
    if (autoClose && type !== 'loading' && !persistent) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [autoClose, duration, type, persistent]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-right duration-300`}>
      <div className={`flex items-start p-4 rounded-lg border shadow-lg ${getStyles()}`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {type !== 'loading' && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {!persistent && autoClose && type !== 'loading' && progress > 0 && (
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
});

Notification.displayName = 'Notification';

export default Notification;