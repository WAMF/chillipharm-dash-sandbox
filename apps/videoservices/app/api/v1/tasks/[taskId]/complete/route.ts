import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../../../lib/mock/data';

interface RouteParams {
    params: Promise<{ taskId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
    const { taskId } = await params;
    const task = mockDatabase.tasks.complete(taskId);

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const workflow = mockDatabase.workflows.getAll().find(
        (w) => w.workflow_id === task.workflow_id
    );

    const outputs = (workflow?.destinations || []).map((dest) => ({
        site_id: dest.site_id,
        site_name: dest.site_name,
        asset_id: `output-${Date.now()}-${dest.site_id}`,
        fields_copied: dest.field_mapping.fields,
        status: 'success' as const,
    }));

    return NextResponse.json({
        status: 'complete',
        job_id: `job-${Date.now()}`,
        completed_at: task.completed_at,
        outputs,
    });
}
