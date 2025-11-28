'use client';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const SIZE_CLASSES = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({
    size = 'md',
    className = '',
}: LoadingSpinnerProps) {
    return (
        <div
            className={`animate-spin rounded-full border-chilli-red border-t-transparent ${SIZE_CLASSES[size]} ${className}`}
        />
    );
}
