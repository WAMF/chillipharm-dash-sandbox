import { NextResponse } from 'next/server';

import { mockDatabase } from '../../../../lib/mock/data';

export async function GET() {
    const workflows = mockDatabase.workflows.getAll();
    return NextResponse.json({ workflows, total: workflows.length });
}

export async function POST(request: Request) {
    const body = await request.json();

    if (!body.name || !body.trial_id || !body.destinations?.length) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    const workflow = mockDatabase.workflows.create({
        name: body.name,
        trial_id: body.trial_id,
        qa_destination: body.qa_destination,
        destinations: body.destinations,
    });

    return NextResponse.json(workflow, { status: 201 });
}
