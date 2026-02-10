import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ taskId: string; inputId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { taskId, inputId } = await params;
    const removed = mockDatabase.tasks.removeInput(taskId, inputId);

    if (!removed) {
        return NextResponse.json(
            { error: 'Task or input not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true });
}
