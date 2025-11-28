'use client';

import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', hover = false, ...props }, ref) => {
        const baseClasses =
            'rounded-lg border border-neutral-200 bg-white shadow-card';
        const hoverClasses = hover
            ? 'transition-shadow hover:shadow-card-hover'
            : '';
        const classes = [baseClasses, hoverClasses, className]
            .filter(Boolean)
            .join(' ');

        return <div ref={ref} className={classes} {...props} />;
    }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`flex flex-col space-y-1.5 p-6 ${className}`}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
    HTMLHeadingElement,
    HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => (
    <h3
        ref={ref}
        className={`text-lg font-semibold leading-none tracking-tight ${className}`}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className = '', ...props }, ref) => (
    <p
        ref={ref}
        className={`text-sm text-neutral-500 ${className}`}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`flex items-center p-6 pt-0 ${className}`}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';
