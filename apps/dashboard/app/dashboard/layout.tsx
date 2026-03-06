'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@cp/firebase';
import { FilterProvider } from '../../contexts/FilterContext';
import { DashboardProvider, useDashboard } from '../../contexts/DashboardContext';
import { ReportWizardWrapper } from '../../components/ReportWizardWrapper';
import { AssetListModal } from '../../components/AssetListModal';
import { AssetDetailModal } from '../../components/AssetDetailModal';
import { ReportProvider } from '../../contexts/ReportContext';

function ChartBarIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className || 'h-5 w-5'}
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
    );
}

function FolderOpenIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className || 'h-5 w-5'}
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
    );
}

function DocumentTextIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className || 'h-5 w-5'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    );
}

function ExportIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className || 'h-5 w-5'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    );
}

function LogoutIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className || 'h-5 w-5'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </svg>
    );
}

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Overview', icon: ChartBarIcon },
    { href: '/dashboard/browse', label: 'Browse', icon: FolderOpenIcon },
    { href: '/dashboard/reports', label: 'Reports', icon: DocumentTextIcon },
];

function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { setShowReportWizard } = useDashboard();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 bg-white border-r border-neutral-200">
            <div className="flex items-center h-16 px-6 border-b border-neutral-200">
                <Link href="/dashboard">
                    <span className="text-xl font-bold text-chilli-red">ChilliPharm</span>
                </Link>
            </div>
            <nav className="flex-1 py-4 px-3">
                {NAV_ITEMS.map(item => {
                    const isActive =
                        item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1 ${
                                isActive
                                    ? 'bg-chilli-red/10 text-chilli-red'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
                <button
                    onClick={() => setShowReportWizard(true)}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors mb-1"
                >
                    <ExportIcon className="h-5 w-5" />
                    Export
                </button>
            </nav>
            <div className="p-3 border-t border-neutral-200">
                <div className="px-3 py-2 mb-2">
                    <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                >
                    <LogoutIcon className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

function MobileHeader() {
    return (
        <header className="md:hidden sticky top-0 z-50 border-b border-neutral-200 bg-white">
            <div className="flex h-14 items-center justify-center px-4">
                <Link href="/dashboard">
                    <span className="text-xl font-bold text-chilli-red">ChilliPharm</span>
                </Link>
            </div>
        </header>
    );
}

function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {NAV_ITEMS.map(item => {
                    const isActive =
                        item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                isActive
                                    ? 'text-chilli-red'
                                    : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        >
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs mt-1 font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-screen bg-neutral-50">
            <Sidebar />
            <div className="md:pl-60 flex flex-col h-full">
                <MobileHeader />
                <main className="flex-1 px-4 py-6 pb-20 md:pb-6 md:px-6 lg:px-8 overflow-auto">
                    {children}
                </main>
                <BottomNav />
            </div>
            <AssetListModal />
            <AssetDetailModal />
            <ReportWizardWrapper />
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <FilterProvider>
                <DashboardProvider>
                    <ReportProvider>
                        <AppLayoutContent>{children}</AppLayoutContent>
                    </ReportProvider>
                </DashboardProvider>
            </FilterProvider>
        </AuthProvider>
    );
}
