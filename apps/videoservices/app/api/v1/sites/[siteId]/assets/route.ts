import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ siteId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    const { siteId } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const assets = search
        ? mockDatabase.assets.search(siteId, search)
        : mockDatabase.assets.getBySite(siteId);

    return NextResponse.json({ assets, total: assets.length });
}
