import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  message, 
  onRetry, 
  className = '' 
}: ErrorMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
      <p className="text-red-700 text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}