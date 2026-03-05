'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
    { href: '/dashboard/reports/templates', label: 'Templates' },
    { href: '/dashboard/reports/email-lists', label: 'Email Lists' },
    { href: '/dashboard/reports/schedules', label: 'Schedules' },
];

export default function ReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Manage report templates, email lists, and scheduled delivery.
                </p>
            </div>

            <nav className="flex gap-1 border-b border-neutral-200">
                {TABS.map(tab => {
                    const isActive = pathname.startsWith(tab.href);
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                                isActive
                                    ? 'border-b-2 border-chilli-red text-chilli-red'
                                    : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>

            {children}
        </div>
    );
}
