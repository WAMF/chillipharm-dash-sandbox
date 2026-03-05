import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../lib/mock/data';

export async function GET() {
    const sites = mockDatabase.sites.getAll();
    return NextResponse.json({ sites });
}
