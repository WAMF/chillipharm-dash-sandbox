import { NextResponse } from 'next/server';

import type { AssetFilters } from '@cp/types';

import { mockDatabase } from '../../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ siteId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    const { siteId } = await params;
    const { searchParams } = new URL(request.url);

    const filters: AssetFilters = {
        search: searchParams.get('search') ?? undefined,
        file_type: searchParams.get('file_type') ?? undefined,
        visit_type: searchParams.get('visit_type') ?? undefined,
        assessment: searchParams.get('assessment') ?? undefined,
        subject_id: searchParams.get('subject_id') ?? undefined,
        visit_date_from: searchParams.get('visit_date_from') ?? undefined,
        visit_date_to: searchParams.get('visit_date_to') ?? undefined,
        sort_by: (searchParams.get('sort_by') as AssetFilters['sort_by']) ?? undefined,
        sort_dir: (searchParams.get('sort_dir') as AssetFilters['sort_dir']) ?? undefined,
    };

    const assets = mockDatabase.assets.query(siteId, filters);

    return NextResponse.json({ assets, total: assets.length });
}
