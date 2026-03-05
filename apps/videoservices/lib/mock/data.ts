import type {
    Workflow,
    WorkflowDestination,
    VSTask,
    TaskMember,
    TaskInput,
    VSAsset,
    AssetFilters,
} from '@cp/types';

export interface MockUser {
    user_id: string;
    user_name: string;
    user_email: string;
}

export const mockUsers: MockUser[] = [
    {
        user_id: 'user-001',
        user_name: 'Sarah Jenkins',
        user_email: 'sarah.jenkins@chillipharm.com',
    },
    {
        user_id: 'user-002',
        user_name: 'Stevie Hall',
        user_email: 'stevie.hall@chillipharm.com',
    },
    {
        user_id: 'user-003',
        user_name: 'Jaq Aguila',
        user_email: 'jaq.aguila@chillipharm.com',
    },
    {
        user_id: 'user-004',
        user_name: 'Pavlos Georgiou',
        user_email: 'pavlos.georgiou@chillipharm.com',
    },
];

export interface Site {
    site_id: string;
    name: string;
    trial_id: string;
    trial_name: string;
    type: 'site' | 'library';
    available_fields: string[];
}

export const mockSites: Site[] = [
    {
        site_id: 'site-001',
        name: 'Library: 336160 - Sunderland Eye Infirmary - GBR',
        trial_id: 'trial-001',
        trial_name: 'WR42221 - Velodrome',
        type: 'library',
        available_fields: [
            'subject_id',
            'visit_date',
            'visit_type',
            'investigator',
            'notes',
            'Assessment',
        ],
    },
    {
        site_id: 'site-002',
        name: 'London Central',
        trial_id: 'trial-001',
        trial_name: 'WR42221 - Velodrome',
        type: 'site',
        available_fields: [
            'subject_id',
            'visit_date',
            'visit_type',
            'investigator',
            'notes',
            'Assessment',
        ],
    },
    {
        site_id: 'lib-001',
        name: 'Velodrome Sponsor QC Library',
        trial_id: 'trial-001',
        trial_name: 'WR42221 - Velodrome',
        type: 'library',
        available_fields: [
            'subject_id',
            'visit_date',
            'visit_type',
            'Assessment',
        ],
    },
    {
        site_id: 'lib-002',
        name: 'Velodrome Sponsor/Review Library',
        trial_id: 'trial-001',
        trial_name: 'WR42221 - Velodrome',
        type: 'library',
        available_fields: [
            'subject_id',
            'visit_date',
            'visit_type',
            'investigator',
            'notes',
            'Assessment',
        ],
    },
];

export const mockAssets: VSAsset[] = [
    {
        asset_id: 'asset-001',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20308 Refill Week 36.mp4',
        file_type: 'video/mp4',
        file_size: 524288000,
        duration: '00:15:32',
        thumbnail_url: '/thumbnails/thumb-001.jpg',
        created_at: '2024-01-15T10:30:00Z',
        metadata: {
            subject_id: '20308',
            visit_date: '2024-01-15',
            visit_type: 'Refill Week 36',
            Assessment: 'Standard',
        },
    },
    {
        asset_id: 'asset-002',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20309 Baseline Week 0.mp4',
        file_type: 'video/mp4',
        file_size: 312475648,
        duration: '00:12:45',
        thumbnail_url: '/thumbnails/thumb-002.jpg',
        created_at: '2024-01-20T14:15:00Z',
        metadata: {
            subject_id: '20309',
            visit_date: '2024-01-20',
            visit_type: 'Baseline Week 0',
            Assessment: 'Initial',
        },
    },
    {
        asset_id: 'asset-003',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20310 Visit Week 12.mp4',
        file_type: 'video/mp4',
        file_size: 445644800,
        duration: '00:18:20',
        thumbnail_url: '/thumbnails/thumb-003.jpg',
        created_at: '2024-01-22T09:00:00Z',
        metadata: {
            subject_id: '20310',
            visit_date: '2024-01-22',
            visit_type: 'Visit Week 12',
            Assessment: 'Follow-up',
        },
    },
    {
        asset_id: 'asset-004',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20311 Refill Week 24.mp4',
        file_type: 'video/mp4',
        file_size: 256000000,
        duration: '00:08:15',
        thumbnail_url: '/thumbnails/thumb-004.jpg',
        created_at: '2024-01-18T11:30:00Z',
        metadata: {
            subject_id: '20311',
            visit_date: '2024-01-18',
            visit_type: 'Refill Week 24',
            Assessment: 'Standard',
        },
    },
    {
        asset_id: 'asset-005',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20312 Visit Week 48.mp4',
        file_type: 'video/mp4',
        file_size: 628318208,
        duration: '00:22:10',
        thumbnail_url: '/thumbnails/thumb-005.jpg',
        created_at: '2024-01-25T16:45:00Z',
        metadata: {
            subject_id: '20312',
            visit_date: '2024-01-25',
            visit_type: 'Visit Week 48',
            Assessment: 'End of study',
        },
    },
    {
        asset_id: 'asset-006',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20308 Visit Week 4.mp4',
        file_type: 'video/mp4',
        file_size: 178257920,
        duration: '00:06:22',
        thumbnail_url: '/thumbnails/thumb-006.jpg',
        created_at: '2024-02-01T08:15:00Z',
        metadata: {
            subject_id: '20308',
            visit_date: '2024-02-01',
            visit_type: 'Visit Week 4',
            Assessment: 'Standard',
        },
    },
    {
        asset_id: 'asset-007',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20313 Screening.mp4',
        file_type: 'video/mp4',
        file_size: 94371840,
        duration: '00:03:45',
        thumbnail_url: '/thumbnails/thumb-007.jpg',
        created_at: '2024-02-05T10:00:00Z',
        metadata: {
            subject_id: '20313',
            visit_date: '2024-02-05',
            visit_type: 'Screening',
            Assessment: 'Initial',
        },
    },
    {
        asset_id: 'asset-008',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20314 Baseline Week 0.mp4',
        file_type: 'video/mp4',
        file_size: 402653184,
        duration: '00:14:50',
        thumbnail_url: '/thumbnails/thumb-008.jpg',
        created_at: '2024-02-10T13:30:00Z',
        metadata: {
            subject_id: '20314',
            visit_date: '2024-02-10',
            visit_type: 'Baseline Week 0',
            Assessment: 'Initial',
        },
    },
    {
        asset_id: 'asset-009',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20309 Refill Week 8.mp4',
        file_type: 'video/mp4',
        file_size: 209715200,
        duration: '00:07:30',
        thumbnail_url: '/thumbnails/thumb-009.jpg',
        created_at: '2024-02-15T09:45:00Z',
        metadata: {
            subject_id: '20309',
            visit_date: '2024-02-15',
            visit_type: 'Refill Week 8',
            Assessment: 'Standard',
        },
    },
    {
        asset_id: 'asset-010',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20315 Early Termination.mp4',
        file_type: 'video/mp4',
        file_size: 524288000,
        duration: '00:19:05',
        thumbnail_url: '/thumbnails/thumb-010.jpg',
        created_at: '2024-02-20T15:00:00Z',
        metadata: {
            subject_id: '20315',
            visit_date: '2024-02-20',
            visit_type: 'Early Termination',
            Assessment: 'End of study',
        },
    },
    {
        asset_id: 'asset-011',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20310 Unscheduled.mp4',
        file_type: 'video/mp4',
        file_size: 157286400,
        duration: '00:05:18',
        thumbnail_url: '/thumbnails/thumb-011.jpg',
        created_at: '2024-03-01T11:20:00Z',
        metadata: {
            subject_id: '20310',
            visit_date: '2024-03-01',
            visit_type: 'Unscheduled',
            Assessment: 'Follow-up',
        },
    },
    {
        asset_id: 'asset-012',
        site_id: 'site-001',
        name: 'WR42221-366044-Subject 20316 Visit Week 24.mp4',
        file_type: 'video/mp4',
        file_size: 838860800,
        duration: '00:30:10',
        thumbnail_url: '/thumbnails/thumb-012.jpg',
        created_at: '2024-03-10T14:00:00Z',
        metadata: {
            subject_id: '20316',
            visit_date: '2024-03-10',
            visit_type: 'Visit Week 24',
            Assessment: 'Extended',
        },
    },
];

const mockQADestination: WorkflowDestination = {
    destination_id: 'dest-qa-001',
    workflow_id: 'wf-001',
    site_id: 'lib-001',
    site_name: 'Velodrome Sponsor QC Library',
    is_primary: false,
    field_mapping: { mode: 'include', fields: ['subject_id', 'visit_date', 'visit_type', 'Assessment'] },
    display_order: 0,
    created_at: '2024-01-10T09:00:00Z',
};

const mockDestinations: WorkflowDestination[] = [
    {
        destination_id: 'dest-001',
        workflow_id: 'wf-001',
        site_id: 'lib-002',
        site_name: 'Velodrome Sponsor/Review Library',
        is_primary: true,
        field_mapping: { mode: 'all' },
        display_order: 0,
        created_at: '2024-01-10T09:00:00Z',
    },
];

export const mockWorkflows: Workflow[] = [
    {
        workflow_id: 'wf-001',
        name: 'Redaction',
        trial_id: 'trial-001',
        trial_name: 'WR42221 - Velodrome',
        qa_destination: mockQADestination,
        destinations: mockDestinations,
        created_by: 'user-001',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-10T09:00:00Z',
    },
];

const mockMembers: TaskMember[] = [
    {
        task_member_id: 'tm-001',
        task_id: 'task-001',
        user_id: 'user-001',
        user_name: 'Sarah Jenkins',
        user_email: 'sarah.jenkins@chillipharm.com',
        is_creator: true,
        added_by: 'user-001',
        created_at: '2024-01-28T10:00:00Z',
    },
];

const mockInputSubject20308: TaskInput[] = [
    {
        task_input_id: 'ti-001',
        task_id: 'task-001',
        asset_id: 'asset-001',
        site_id: 'site-001',
        asset_name: 'WR42221-366044-Subject 20308 Refill Week 36.mp4',
        duration: '00:15:32',
        file_size: 524288000,
        sequence_order: 0,
        created_at: '2024-01-28T10:05:00Z',
    },
];

const mockInputSubject20309: TaskInput[] = [
    {
        task_input_id: 'ti-002',
        task_id: 'task-003',
        asset_id: 'asset-002',
        site_id: 'site-001',
        asset_name: 'WR42221-366044-Subject 20309 Baseline Week 0.mp4',
        duration: '00:12:45',
        file_size: 312475648,
        sequence_order: 0,
        created_at: '2024-01-27T14:05:00Z',
    },
];

const mockInputSubject20310: TaskInput[] = [
    {
        task_input_id: 'ti-003',
        task_id: 'task-004',
        asset_id: 'asset-003',
        site_id: 'site-001',
        asset_name: 'WR42221-366044-Subject 20310 Visit Week 12.mp4',
        duration: '00:18:20',
        file_size: 445644800,
        sequence_order: 0,
        created_at: '2024-01-18T10:05:00Z',
    },
];

const mockInputSubject20311: TaskInput[] = [
    {
        task_input_id: 'ti-004',
        task_id: 'task-005',
        asset_id: 'asset-004',
        site_id: 'site-001',
        asset_name: 'WR42221-366044-Subject 20311 Refill Week 24.mp4',
        duration: '00:08:15',
        file_size: 256000000,
        sequence_order: 0,
        created_at: '2024-01-15T10:05:00Z',
    },
];

const mockInputSubject20312: TaskInput[] = [
    {
        task_input_id: 'ti-005',
        task_id: 'task-002',
        asset_id: 'asset-005',
        site_id: 'site-001',
        asset_name: 'WR42221-366044-Subject 20312 Visit Week 48.mp4',
        duration: '00:22:10',
        file_size: 628318208,
        sequence_order: 0,
        created_at: '2024-01-29T09:05:00Z',
    },
];

export const mockTasks: VSTask[] = [
    {
        task_id: 'task-001',
        workflow_id: 'wf-001',
        workflow_name: 'Redaction',
        name: 'Subject 20308 Refill Week 36',
        description: 'WR42221-366044 — Redact refill visit recording. See Monday for work package.',
        status: 'in_progress',
        members: mockMembers,
        inputs: mockInputSubject20308,
        source_site_id: 'site-001',
        source_site_name: 'Library: 336160 - Sunderland Eye Infirmary - GBR',
        assigned_to: 'user-002',
        assigned_to_name: 'Stevie Hall',
        created_by: 'user-001',
        created_at: '2024-01-28T10:00:00Z',
        updated_at: '2024-01-28T10:05:00Z',
    },
    {
        task_id: 'task-002',
        workflow_id: 'wf-001',
        workflow_name: 'Redaction',
        name: 'Subject 20312 Visit Week 48',
        description: 'WR42221-366044 — Redact end-of-study visit recording. Final filename to be confirmed.',
        status: 'todo',
        members: mockMembers,
        inputs: mockInputSubject20312,
        source_site_id: 'site-001',
        source_site_name: 'Library: 336160 - Sunderland Eye Infirmary - GBR',
        created_by: 'user-001',
        created_at: '2024-01-29T09:00:00Z',
        updated_at: '2024-01-29T09:00:00Z',
    },
    {
        task_id: 'task-003',
        workflow_id: 'wf-001',
        workflow_name: 'Redaction',
        name: 'Subject 20309 Baseline Week 0',
        description: 'WR42221-366044 — Redact baseline visit recording for initial assessment.',
        status: 'qa',
        members: mockMembers,
        inputs: mockInputSubject20309,
        source_site_id: 'site-001',
        source_site_name: 'Library: 336160 - Sunderland Eye Infirmary - GBR',
        assigned_to: 'user-003',
        assigned_to_name: 'Jaq Aguila',
        created_by: 'user-001',
        created_at: '2024-01-27T14:00:00Z',
        updated_at: '2024-01-30T11:00:00Z',
        qa_submitted_at: '2024-01-30T10:00:00Z',
        qa_submitted_by: 'user-001',
    },
    {
        task_id: 'task-004',
        workflow_id: 'wf-001',
        workflow_name: 'Redaction',
        name: 'Subject 20310 Visit Week 12',
        description: 'WR42221-366044 — Redact Week 12 follow-up visit recording.',
        status: 'approved',
        members: mockMembers,
        inputs: mockInputSubject20310,
        source_site_id: 'site-001',
        source_site_name: 'Library: 336160 - Sunderland Eye Infirmary - GBR',
        output_file_name: 'WR42221-366044-Subject 20310 Visit Week 12 — Redacted.mp4',
        output_file_size: 430000000,
        created_by: 'user-001',
        created_at: '2024-01-18T10:00:00Z',
        updated_at: '2024-01-21T14:00:00Z',
        qa_submitted_at: '2024-01-20T09:00:00Z',
        qa_submitted_by: 'user-001',
        qa_approved_at: '2024-01-21T14:00:00Z',
        qa_approved_by: 'user-002',
    },
    {
        task_id: 'task-005',
        workflow_id: 'wf-001',
        workflow_name: 'Redaction',
        name: 'Subject 20311 Refill Week 24',
        description: 'WR42221-366044 — Redact refill visit recording for Week 24.',
        status: 'done',
        members: mockMembers,
        inputs: mockInputSubject20311,
        source_site_id: 'site-001',
        source_site_name: 'Library: 336160 - Sunderland Eye Infirmary - GBR',
        output_file_name: 'WR42221-366044-Subject 20311 Refill Week 24 — Redacted.mp4',
        output_file_size: 248000000,
        assigned_to: 'user-004',
        assigned_to_name: 'Pavlos Georgiou',
        created_by: 'user-001',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T16:00:00Z',
        qa_submitted_at: '2024-01-17T14:30:00Z',
        qa_submitted_by: 'user-001',
        qa_approved_at: '2024-01-18T11:00:00Z',
        qa_approved_by: 'user-002',
        completed_at: '2024-01-20T16:00:00Z',
        completed_by: 'user-001',
    },
];

function parseDurationToSeconds(duration: string): number {
    const parts = duration.split(':').map(Number);
    return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
}

interface MockStore {
    workflows: Workflow[];
    tasks: VSTask[];
}

const globalStore = globalThis as unknown as { __mockStore?: MockStore };

if (!globalStore.__mockStore) {
    globalStore.__mockStore = {
        workflows: [...mockWorkflows],
        tasks: [...mockTasks],
    };
}

const store = globalStore.__mockStore;

function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const mockDatabase = {
    users: {
        getAll: () => [...mockUsers],
        getById: (id: string) => mockUsers.find((u) => u.user_id === id),
        search: (query: string) =>
            mockUsers.filter(
                (u) =>
                    u.user_name.toLowerCase().includes(query.toLowerCase()) ||
                    u.user_email.toLowerCase().includes(query.toLowerCase())
            ),
    },

    sites: {
        getAll: () => [...mockSites],
        getById: (id: string) => mockSites.find((s) => s.site_id === id),
        getByTrial: (trialId: string) =>
            mockSites.filter((s) => s.trial_id === trialId),
    },

    assets: {
        getAll: () => [...mockAssets],
        getBySite: (siteId: string) =>
            mockAssets.filter((a) => a.site_id === siteId),
        getById: (id: string) => mockAssets.find((a) => a.asset_id === id),
        search: (siteId: string, query: string) =>
            mockAssets.filter(
                (a) =>
                    a.site_id === siteId &&
                    a.name.toLowerCase().includes(query.toLowerCase())
            ),
        query: (siteId: string, filters: AssetFilters) => {
            let results = mockAssets.filter((a) => a.site_id === siteId);

            if (filters.search) {
                const term = filters.search.toLowerCase();
                results = results.filter((a) =>
                    a.name.toLowerCase().includes(term)
                );
            }

            if (filters.file_type) {
                results = results.filter((a) => a.file_type === filters.file_type);
            }

            if (filters.visit_type) {
                results = results.filter(
                    (a) => a.metadata?.visit_type === filters.visit_type
                );
            }

            if (filters.assessment) {
                results = results.filter(
                    (a) => a.metadata?.Assessment === filters.assessment
                );
            }

            if (filters.subject_id) {
                results = results.filter(
                    (a) => a.metadata?.subject_id === filters.subject_id
                );
            }

            if (filters.visit_date_from) {
                results = results.filter(
                    (a) =>
                        typeof a.metadata?.visit_date === 'string' &&
                        a.metadata.visit_date >= filters.visit_date_from!
                );
            }

            if (filters.visit_date_to) {
                results = results.filter(
                    (a) =>
                        typeof a.metadata?.visit_date === 'string' &&
                        a.metadata.visit_date <= filters.visit_date_to!
                );
            }

            const sortField = filters.sort_by ?? 'created_at';
            const sortDir = filters.sort_dir === 'asc' ? 1 : -1;

            results.sort((a, b) => {
                let comparison = 0;
                switch (sortField) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case 'created_at':
                        comparison = a.created_at.localeCompare(b.created_at);
                        break;
                    case 'file_size':
                        comparison = a.file_size - b.file_size;
                        break;
                    case 'duration':
                        comparison =
                            parseDurationToSeconds(a.duration ?? '00:00:00') -
                            parseDurationToSeconds(b.duration ?? '00:00:00');
                        break;
                }
                return comparison * sortDir;
            });

            return results;
        },
    },

    workflows: {
        getAll: () => [...store.workflows],
        getById: (id: string) => store.workflows.find((w) => w.workflow_id === id),
        create: (data: {
            name: string;
            trial_id: string;
            qa_destination?: {
                site_id: string;
                field_mapping: { mode: string; fields?: string[] };
            };
            destinations: Array<{
                site_id: string;
                is_primary?: boolean;
                field_mapping: { mode: string; fields?: string[] };
                display_order?: number;
            }>;
        }): Workflow => {
            const trial = mockSites.find((s) => s.trial_id === data.trial_id);
            const workflowId = generateId('wf');

            let qaDestination: WorkflowDestination | undefined;
            if (data.qa_destination) {
                const qaSite = mockSites.find(
                    (s) => s.site_id === data.qa_destination!.site_id
                );
                qaDestination = {
                    destination_id: generateId('dest-qa'),
                    workflow_id: workflowId,
                    site_id: data.qa_destination.site_id,
                    site_name: qaSite?.name || 'Unknown',
                    is_primary: false,
                    field_mapping: data.qa_destination.field_mapping as WorkflowDestination['field_mapping'],
                    display_order: 0,
                    created_at: new Date().toISOString(),
                };
            }

            const destinations: WorkflowDestination[] = data.destinations.map(
                (d, index) => {
                    const destinationSite = mockSites.find(
                        (s) => s.site_id === d.site_id
                    );
                    return {
                        destination_id: generateId('dest'),
                        workflow_id: workflowId,
                        site_id: d.site_id,
                        site_name: destinationSite?.name || 'Unknown',
                        is_primary: d.is_primary ?? index === 0,
                        field_mapping: d.field_mapping as WorkflowDestination['field_mapping'],
                        display_order: d.display_order ?? index,
                        created_at: new Date().toISOString(),
                    };
                }
            );

            const workflow: Workflow = {
                workflow_id: workflowId,
                name: data.name,
                trial_id: data.trial_id,
                trial_name: trial?.trial_name || 'Unknown Trial',
                qa_destination: qaDestination,
                destinations,
                created_by: 'current-user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            store.workflows.push(workflow);
            return workflow;
        },
        update: (id: string, data: Partial<Workflow>): Workflow | null => {
            const index = store.workflows.findIndex((w) => w.workflow_id === id);
            if (index === -1) return null;

            store.workflows[index] = {
                ...store.workflows[index],
                ...data,
                updated_at: new Date().toISOString(),
            };
            return store.workflows[index];
        },
        delete: (id: string): boolean => {
            const index = store.workflows.findIndex((w) => w.workflow_id === id);
            if (index === -1) return false;
            store.workflows.splice(index, 1);
            return true;
        },
    },

    tasks: {
        getAll: () => [...store.tasks],
        getById: (id: string) => store.tasks.find((t) => t.task_id === id),
        getByWorkflow: (workflowId: string) =>
            store.tasks.filter((t) => t.workflow_id === workflowId),
        create: (data: {
            workflow_id: string;
            name: string;
            description?: string;
            assigned_to?: string;
            source_site_id: string;
        }): VSTask => {
            const workflow = store.workflows.find(
                (w) => w.workflow_id === data.workflow_id
            );
            const sourceSite = mockSites.find(
                (s) => s.site_id === data.source_site_id
            );
            const taskId = generateId('task');
            const assignee = data.assigned_to
                ? mockUsers.find((u) => u.user_id === data.assigned_to)
                : undefined;

            const task: VSTask = {
                task_id: taskId,
                workflow_id: data.workflow_id,
                workflow_name: workflow?.name || 'Unknown',
                name: data.name,
                description: data.description,
                status: 'todo',
                members: [
                    {
                        task_member_id: generateId('tm'),
                        task_id: taskId,
                        user_id: 'current-user',
                        user_name: 'Current User',
                        user_email: 'user@example.com',
                        is_creator: true,
                        added_by: 'current-user',
                        created_at: new Date().toISOString(),
                    },
                ],
                inputs: [],
                source_site_id: data.source_site_id,
                source_site_name: sourceSite?.name || 'Unknown',
                assigned_to: assignee?.user_id,
                assigned_to_name: assignee?.user_name,
                created_by: 'current-user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            store.tasks.push(task);
            return task;
        },
        update: (id: string, data: Partial<VSTask>): VSTask | null => {
            const index = store.tasks.findIndex((t) => t.task_id === id);
            if (index === -1) return null;

            if ('assigned_to' in data) {
                if (!data.assigned_to) {
                    data.assigned_to = undefined;
                    data.assigned_to_name = undefined;
                } else {
                    const assignee = mockUsers.find(
                        (u) => u.user_id === data.assigned_to
                    );
                    data.assigned_to_name = assignee?.user_name;
                }
            }

            store.tasks[index] = {
                ...store.tasks[index],
                ...data,
                updated_at: new Date().toISOString(),
            };
            return store.tasks[index];
        },
        addInputs: (
            taskId: string,
            assetIds: string[]
        ): TaskInput[] => {
            const task = store.tasks.find((t) => t.task_id === taskId);
            if (!task) return [];

            const newInputs: TaskInput[] = assetIds
                .map((assetId, index) => {
                    const asset = mockAssets.find((a) => a.asset_id === assetId);
                    return {
                        task_input_id: generateId('ti'),
                        task_id: taskId,
                        asset_id: assetId,
                        site_id: asset?.site_id || '',
                        asset_name: asset?.name || 'Unknown Asset',
                        duration: asset?.duration,
                        file_size: asset?.file_size,
                        sequence_order: task.inputs.length + index,
                        created_at: new Date().toISOString(),
                    };
                });

            task.inputs.push(...newInputs);
            task.status = 'in_progress';
            task.updated_at = new Date().toISOString();

            return newInputs;
        },
        addInputsFromFiles: (
            taskId: string,
            files: Array<{ name: string; size: number }>
        ): TaskInput[] => {
            const task = store.tasks.find((t) => t.task_id === taskId);
            if (!task) return [];

            const newInputs: TaskInput[] = files.map((file, index) => ({
                task_input_id: generateId('ti'),
                task_id: taskId,
                asset_id: generateId('asset'),
                site_id: task.source_site_id,
                asset_name: file.name,
                file_size: file.size,
                sequence_order: task.inputs.length + index,
                created_at: new Date().toISOString(),
            }));

            task.inputs.push(...newInputs);
            task.status = 'in_progress';
            task.updated_at = new Date().toISOString();

            return newInputs;
        },
        removeInput: (taskId: string, inputId: string): boolean => {
            const task = store.tasks.find((t) => t.task_id === taskId);
            if (!task) return false;

            const index = task.inputs.findIndex(
                (i) => i.task_input_id === inputId
            );
            if (index === -1) return false;

            task.inputs.splice(index, 1);
            task.inputs.forEach((input, index_) => {
                input.sequence_order = index_;
            });

            if (task.inputs.length === 0) {
                task.status = 'todo';
            }
            task.updated_at = new Date().toISOString();

            return true;
        },
        complete: (taskId: string): VSTask | null => {
            const task = store.tasks.find((t) => t.task_id === taskId);
            if (!task) return null;

            task.status = 'done';
            task.completed_at = new Date().toISOString();
            task.completed_by = 'current-user';
            task.updated_at = new Date().toISOString();

            return task;
        },
        submitToQA: (taskId: string): VSTask | null => {
            const task = store.tasks.find((t) => t.task_id === taskId);
            if (!task) return null;

            task.status = 'qa';
            task.qa_submitted_at = new Date().toISOString();
            task.qa_submitted_by = 'current-user';
            task.qa_rejected_at = undefined;
            task.qa_rejected_by = undefined;
            task.updated_at = new Date().toISOString();

            return task;
        },
        approveQA: (taskId: string): VSTask | null => {
            const task = store.tasks.find((t) => t.task_id === taskId);
            if (!task) return null;

            task.status = 'approved';
            task.qa_approved_at = new Date().toISOString();
            task.qa_approved_by = 'current-user';
            task.updated_at = new Date().toISOString();

            return task;
        },
        rejectQA: (taskId: string): VSTask | null => {
            const task = store.tasks.find((t) => t.task_id === taskId);
            if (!task) return null;

            task.status = 'in_progress';
            task.qa_rejected_at = new Date().toISOString();
            task.qa_rejected_by = 'current-user';
            task.qa_submitted_at = undefined;
            task.qa_submitted_by = undefined;
            task.updated_at = new Date().toISOString();

            return task;
        },
        delete: (id: string): boolean => {
            const index = store.tasks.findIndex((t) => t.task_id === id);
            if (index === -1) return false;
            store.tasks.splice(index, 1);
            return true;
        },
    },

    reset: () => {
        store.workflows = [...mockWorkflows];
        store.tasks = [...mockTasks];
    },
};
