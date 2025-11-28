/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        '../../libs/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                chilli: {
                    'red': '#c8102e',
                    'red-dark': '#9b0a21',
                    'red-light': '#e8344f',
                },
                brand: {
                    primary: '#c8102e',
                    secondary: '#1a1a2e',
                    accent: '#ed7621',
                },
                success: {
                    DEFAULT: '#10b981',
                    light: '#34d399',
                    dark: '#059669',
                },
                warning: {
                    DEFAULT: '#ed7621',
                    light: '#f59e0b',
                    dark: '#d97706',
                },
                error: {
                    DEFAULT: '#ef4444',
                    light: '#f87171',
                    dark: '#dc2626',
                },
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                },
            },
            fontFamily: {
                sans: [
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
            },
            boxShadow: {
                'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'card-hover':
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
            animation: {
                'spin-slow': 'spin 2s linear infinite',
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
