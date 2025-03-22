import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
} 