'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider } from '@cp/firebase';
import { FilterProvider } from '../../contexts/FilterContext';
import { DashboardProvider } from '../../contexts/DashboardContext';
import { ReportWizardWrapper } from '../../components/ReportWizardWrapper';
import { HeaderActions } from '../../components/HeaderActions';
import { AssetListModal } from '../../components/AssetListModal';
import { AssetDetailModal } from '../../components/AssetDetailModal';

const NAVIGATION_ITEMS = [
    { href: '/dashboard', label: 'Overview', icon: 'chart-bar' },
    { href: '/dashboard/browse', label: 'Browse', icon: 'folder-open' },
    { href: '/dashboard/video-metrics', label: 'Video Metrics', icon: 'play' },
    {
        href: '/dashboard/compliance',
        label: 'Compliance',
        icon: 'shield-check',
    },
];

function NavIcon({ name }: { name: string }) {
    const icons: Record<string, JSX.Element> = {
        'chart-bar': (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        ),
        'folder-open': (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                />
            </svg>
        ),
        'chart-pie': (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
            </svg>
        ),
        'play': (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        'check-circle': (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        'shield-check': (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
            </svg>
        ),
    };
    return icons[name] || null;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <AuthProvider>
            <FilterProvider>
                <DashboardProvider>
                    <div className="min-h-screen bg-neutral-50">
                        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
                            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center gap-8">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-2xl font-bold text-chilli-red">
                                            ChilliPharm
                                        </span>
                                    </Link>
                                    <nav className="hidden md:flex">
                                        <ul className="flex items-center gap-1">
                                            {NAVIGATION_ITEMS.map(item => {
                                                const isActive =
                                                    item.href === '/dashboard'
                                                        ? pathname ===
                                                          '/dashboard'
                                                        : pathname.startsWith(
                                                              item.href
                                                          );
                                                return (
                                                    <li key={item.href}>
                                                        <Link
                                                            href={item.href}
                                                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                                                isActive
                                                                    ? 'bg-chilli-red/10 text-chilli-red'
                                                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                                            }`}
                                                        >
                                                            <NavIcon
                                                                name={item.icon}
                                                            />
                                                            {item.label}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </nav>
                                </div>
                                <HeaderActions />
                            </div>
                        </header>

                        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                            {children}
                        </main>
                        <AssetListModal />
                        <AssetDetailModal />
                        <ReportWizardWrapper />
                    </div>
                </DashboardProvider>
            </FilterProvider>
        </AuthProvider>
    );
}
