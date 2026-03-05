import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ taskId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
    const { taskId } = await params;
    const task = mockDatabase.tasks.submitToQA(taskId);

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const workflow = mockDatabase.workflows.getAll().find(
        (w) => w.workflow_id === task.workflow_id
    );

    return NextResponse.json({
        status: 'submitted',
        job_id: `job-${Date.now()}`,
        submitted_at: task.qa_submitted_at,
        output: {
            site_id: workflow?.qa_destination?.site_id || '',
            site_name: workflow?.qa_destination?.site_name || '',
            asset_id: `qa-output-${Date.now()}`,
            status: 'success',
        },
    });
}
