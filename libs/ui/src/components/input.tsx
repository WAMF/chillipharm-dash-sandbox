'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', error = false, ...props }, ref) => {
        const baseClasses =
            'block w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-neutral-100';
        const borderClasses = error
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-neutral-300 focus:border-chilli-red focus:ring-chilli-red';
        const classes = [baseClasses, borderClasses, className].join(' ');

        return <input ref={ref} className={classes} {...props} />;
    }
);

Input.displayName = 'Input';
