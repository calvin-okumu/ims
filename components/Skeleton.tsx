'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      default:
        return 'rounded';
    }
  };

  const getSizeClasses = () => {
    if (variant === 'circular') {
      return width ? `w-${width} h-${width}` : 'w-10 h-10';
    }

    const widthClass = width ? (typeof width === 'number' ? `w-${width}` : `w-[${width}]`) : 'w-full';
    const heightClass = height ? (typeof height === 'number' ? `h-${height}` : `h-[${height}]`) : 'h-4';

    return `${widthClass} ${heightClass}`;
  };

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      style={{
        width: typeof width === 'string' && width.includes('px') ? width : undefined,
        height: typeof height === 'string' && height.includes('px') ? height : undefined
      }}
    />
  );
};

// Pre-built skeleton components for common use cases
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="space-y-4">
      <Skeleton variant="rectangular" height={24} width="60%" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <div className="flex space-x-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton width={120} height={16} />
      <Skeleton height={40} />
    </div>
    <div className="space-y-2">
      <Skeleton width={100} height={16} />
      <Skeleton height={40} />
    </div>
    <div className="space-y-2">
      <Skeleton width={140} height={16} />
      <Skeleton height={40} />
    </div>
    <div className="flex space-x-4">
      <Skeleton width={100} height={40} />
      <Skeleton width={100} height={40} />
    </div>
  </div>
);

export default Skeleton;