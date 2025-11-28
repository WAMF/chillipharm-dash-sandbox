'use client';

import { HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
    success: 'bg-success/10 text-success-dark',
    warning: 'bg-warning/10 text-warning-dark',
    error: 'bg-error/10 text-error-dark',
    neutral: 'bg-neutral-100 text-neutral-700',
    info: 'bg-blue-100 text-blue-700',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className = '', variant = 'neutral', ...props }, ref) => {
        const baseClasses =
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
        const classes = [baseClasses, VARIANT_CLASSES[variant], className].join(
            ' '
        );

        return <span ref={ref} className={classes} {...props} />;
    }
);

Badge.displayName = 'Badge';
