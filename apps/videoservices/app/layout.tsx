import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
    title: 'Video Services - ChilliPharm',
    description: 'Video processing workflow automation tool',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-neutral-50">{children}</body>
        </html>
    );
}
