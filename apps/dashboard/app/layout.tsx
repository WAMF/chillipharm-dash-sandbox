import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChilliPharm Dashboard',
  description: 'Clinical trial asset management and reporting dashboard',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">{children}</body>
    </html>
  );
}
