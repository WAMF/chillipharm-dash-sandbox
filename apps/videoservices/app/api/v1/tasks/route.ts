import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../lib/mock/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflow_id');

    const tasks = workflowId
        ? mockDatabase.tasks.getByWorkflow(workflowId)
        : mockDatabase.tasks.getAll();

    return NextResponse.json({ tasks, total: tasks.length });
}

export async function POST(request: Request) {
    const body = await request.json();

    if (!body.workflow_id || !body.name) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    const task = mockDatabase.tasks.create({
        workflow_id: body.workflow_id,
        name: body.name,
        description: body.description,
    });

    return NextResponse.json(task, { status: 201 });
}
