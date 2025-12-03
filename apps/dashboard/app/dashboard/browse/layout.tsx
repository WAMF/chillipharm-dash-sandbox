'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const BROWSE_TABS = [
    { href: '/dashboard/browse/sites', label: 'Sites' },
    { href: '/dashboard/browse/libraries', label: 'Libraries' },
];

export default function BrowseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-neutral-800 mb-1">Browse Data</h2>
                <p className="text-neutral-500 text-sm">Navigate Sites and Libraries to explore assets</p>
            </div>

            <div className="border-b border-neutral-200">
                <nav className="flex gap-1">
                    {BROWSE_TABS.map(tab => {
                        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                    isActive
                                        ? 'border-chilli-red text-chilli-red'
                                        : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {children}
        </div>
    );
}
