import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ taskId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
    const { taskId } = await params;
    const task = mockDatabase.tasks.approveQA(taskId);

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
        status: 'approved',
        task,
    });
}
