'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, placeholder, error = false, ...props }, ref) => {
    const baseClasses =
      'block w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-neutral-100';
    const borderClasses = error
      ? 'border-error focus:border-error focus:ring-error'
      : 'border-neutral-300 focus:border-chilli-red focus:ring-chilli-red';
    const classes = [baseClasses, borderClasses, className].join(' ');

    return (
      <select ref={ref} className={classes} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
