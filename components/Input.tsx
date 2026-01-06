
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  isTextArea?: boolean;
  isSelect?: boolean;
  options?: { value: string; label: string }[];
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  isTextArea, 
  isSelect, 
  options, 
  ...props 
}) => {
  const baseInputStyles = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
    error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
  }`;

  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      
      {isTextArea ? (
        <textarea 
          className={`${baseInputStyles} min-h-[100px] resize-none`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : isSelect ? (
        <select 
          className={baseInputStyles}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input 
          className={baseInputStyles}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
