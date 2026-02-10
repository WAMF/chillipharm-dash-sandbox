import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ siteId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
    const { siteId } = await params;
    const site = mockDatabase.sites.getById(siteId);

    if (!site) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json(site);
}
