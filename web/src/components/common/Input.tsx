import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helpText, 
  required, 
  className = '', 
  id, 
  ...props 
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1">
      <label 
        htmlFor={inputId} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={inputId}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
        } ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        {...props}
      />
      
      {error && (
        <p 
          id={`${inputId}-error`} 
          className="text-sm text-red-600" 
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p 
          id={`${inputId}-help`} 
          className="text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  );
};

export default Input;
