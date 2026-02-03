
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        {...props}
        className={`
          w-full min-h-[48px] px-4 py-2
          border border-slate-200 bg-slate-50/50
          transition-all duration-300
          placeholder:text-slate-300 text-sm
          focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white
          ${error ? 'border-red-500' : 'hover:border-slate-300'}
          disabled:opacity-50
          ${className}
        `}
      />
      {error && <span className="text-[10px] font-semibold text-red-500 mt-1">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={`
            w-full min-h-[48px] px-4 py-2
            border border-slate-200 bg-slate-50/50 appearance-none
            transition-all duration-300 text-sm
            focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white
            ${error ? 'border-red-500' : 'hover:border-slate-300'}
          `}
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-[10px] font-semibold text-red-500 mt-1">{error}</span>}
    </div>
  );
};
