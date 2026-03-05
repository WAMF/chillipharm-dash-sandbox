'use client';

export default function BrowseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-6">
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-neutral-800 mb-1">Browse Data</h2>
                <p className="text-neutral-500 text-sm">Navigate Sites to explore assets</p>
            </div>

            {children}
        </div>
    );
}
