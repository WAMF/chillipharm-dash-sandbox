import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ taskId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
    const { taskId } = await params;
    const task = mockDatabase.tasks.getById(taskId);

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
}

export async function PUT(request: Request, { params }: RouteParams) {
    const { taskId } = await params;
    const body = await request.json();

    const task = mockDatabase.tasks.update(taskId, body);

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { taskId } = await params;
    const deleted = mockDatabase.tasks.delete(taskId);

    if (!deleted) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
