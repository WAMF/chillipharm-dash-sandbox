import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ taskId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
    const { taskId } = await params;
    const body = await request.json();

    if (!body.files || !Array.isArray(body.files)) {
        return NextResponse.json(
            { error: 'Files array is required' },
            { status: 400 }
        );
    }

    const inputs = mockDatabase.tasks.addInputsFromFiles(taskId, body.files);

    if (inputs.length === 0) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ inputs }, { status: 201 });
}
