import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ workflowId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
    const { workflowId } = await params;
    const workflow = mockDatabase.workflows.getById(workflowId);

    if (!workflow) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(workflow);
}

export async function PUT(request: Request, { params }: RouteParams) {
    const { workflowId } = await params;
    const body = await request.json();

    const workflow = mockDatabase.workflows.update(workflowId, body);

    if (!workflow) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(workflow);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { workflowId } = await params;
    const deleted = mockDatabase.workflows.delete(workflowId);

    if (!deleted) {
        return NextResponse.json(
            { error: 'Workflow not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true });
}
