import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ taskId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
    const { taskId } = await params;
    const body = await request.json();

    if (!body.asset_ids || !Array.isArray(body.asset_ids)) {
        return NextResponse.json(
            { error: 'asset_ids array is required' },
            { status: 400 }
        );
    }

    const inputs = mockDatabase.tasks.addInputs(taskId, body.asset_ids);

    if (inputs.length === 0) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ inputs }, { status: 201 });
}
