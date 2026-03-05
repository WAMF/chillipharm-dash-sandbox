import { Router } from 'express';
import { query } from '../db.js';
import { getCountryName, formatDate, formatDateTime } from '../utils/formatting.js';

const router = Router();

// ---------------------------------------------------------------------------
// Saved Templates CRUD
// ---------------------------------------------------------------------------

router.get('/templates', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT * FROM report_templates ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: result.rows.map(mapTemplateRow),
        });
    } catch (error) {
        next(error);
    }
});

router.post('/templates', async (req, res, next) => {
    try {
        const { name, description, baseTemplateId, rowEntity, columns, filters } = req.body;

        if (!name || !rowEntity || !columns) {
            return res.status(400).json({
                success: false,
                error: 'name, rowEntity, and columns are required',
            });
        }

        const result = await query(
            `INSERT INTO report_templates (name, description, base_template_id, row_entity, columns, filters, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                name,
                description || null,
                baseTemplateId || null,
                rowEntity,
                JSON.stringify(columns),
                JSON.stringify(filters || {}),
                req.user?.uid || 'unknown',
            ]
        );

        res.status(201).json({
            success: true,
            data: mapTemplateRow(result.rows[0]),
        });
    } catch (error) {
        next(error);
    }
});

router.put('/templates/:id', async (req, res, next) => {
    try {
        const { name, description, columns, filters } = req.body;

        const result = await query(
            `UPDATE report_templates
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 columns = COALESCE($3, columns),
                 filters = COALESCE($4, filters),
                 updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
            [
                name || null,
                description !== undefined ? description : null,
                columns ? JSON.stringify(columns) : null,
                filters ? JSON.stringify(filters) : null,
                req.params.id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }

        res.json({ success: true, data: mapTemplateRow(result.rows[0]) });
    } catch (error) {
        next(error);
    }
});

router.delete('/templates/:id', async (req, res, next) => {
    try {
        const result = await query(
            `DELETE FROM report_templates WHERE id = $1 RETURNING id`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

function mapTemplateRow(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        baseTemplateId: row.base_template_id,
        rowEntity: row.row_entity,
        columns: row.columns,
        filters: row.filters,
        createdBy: row.created_by,
        createdAt: formatDateTime(row.created_at),
        updatedAt: formatDateTime(row.updated_at),
    };
}

// ---------------------------------------------------------------------------
// Email Lists CRUD
// ---------------------------------------------------------------------------

router.get('/email-lists', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT * FROM email_lists ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: result.rows.map(mapEmailListRow),
        });
    } catch (error) {
        next(error);
    }
});

router.post('/email-lists', async (req, res, next) => {
    try {
        const { name, emails } = req.body;

        if (!name || !emails) {
            return res.status(400).json({
                success: false,
                error: 'name and emails are required',
            });
        }

        const result = await query(
            `INSERT INTO email_lists (name, emails, created_by)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, JSON.stringify(emails), req.user?.uid || 'unknown']
        );

        res.status(201).json({
            success: true,
            data: mapEmailListRow(result.rows[0]),
        });
    } catch (error) {
        next(error);
    }
});

router.put('/email-lists/:id', async (req, res, next) => {
    try {
        const { name, emails } = req.body;

        const result = await query(
            `UPDATE email_lists
             SET name = COALESCE($1, name),
                 emails = COALESCE($2, emails),
                 updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [
                name || null,
                emails ? JSON.stringify(emails) : null,
                req.params.id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Email list not found' });
        }

        res.json({ success: true, data: mapEmailListRow(result.rows[0]) });
    } catch (error) {
        next(error);
    }
});

router.delete('/email-lists/:id', async (req, res, next) => {
    try {
        const result = await query(
            `DELETE FROM email_lists WHERE id = $1 RETURNING id`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Email list not found' });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

function mapEmailListRow(row) {
    return {
        id: row.id,
        name: row.name,
        emails: row.emails,
        createdBy: row.created_by,
        createdAt: formatDateTime(row.created_at),
        updatedAt: formatDateTime(row.updated_at),
    };
}

// ---------------------------------------------------------------------------
// Schedules CRUD
// ---------------------------------------------------------------------------

router.get('/schedules', async (req, res, next) => {
    try {
        const result = await query(
            `SELECT rs.*, rt.name as template_name, el.name as email_list_name
             FROM report_schedules rs
             LEFT JOIN report_templates rt ON rs.saved_template_id = rt.id
             LEFT JOIN email_lists el ON rs.email_list_id = el.id
             ORDER BY rs.created_at DESC`
        );

        res.json({
            success: true,
            data: result.rows.map(mapScheduleRow),
        });
    } catch (error) {
        next(error);
    }
});

router.post('/schedules', async (req, res, next) => {
    try {
        const { savedTemplateId, emailListId, cadence, enabled } = req.body;

        if (!savedTemplateId || !emailListId || !cadence) {
            return res.status(400).json({
                success: false,
                error: 'savedTemplateId, emailListId, and cadence are required',
            });
        }

        const nextRunAt = computeNextRunAt(cadence);

        const result = await query(
            `INSERT INTO report_schedules (saved_template_id, email_list_id, cadence, enabled, next_run_at, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                savedTemplateId,
                emailListId,
                cadence,
                enabled !== false,
                nextRunAt,
                req.user?.uid || 'unknown',
            ]
        );

        const withNames = await query(
            `SELECT rs.*, rt.name as template_name, el.name as email_list_name
             FROM report_schedules rs
             LEFT JOIN report_templates rt ON rs.saved_template_id = rt.id
             LEFT JOIN email_lists el ON rs.email_list_id = el.id
             WHERE rs.id = $1`,
            [result.rows[0].id]
        );

        res.status(201).json({
            success: true,
            data: mapScheduleRow(withNames.rows[0]),
        });
    } catch (error) {
        next(error);
    }
});

router.put('/schedules/:id', async (req, res, next) => {
    try {
        const { cadence, emailListId, enabled } = req.body;

        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (cadence !== undefined) {
            updates.push(`cadence = $${paramIndex++}`);
            params.push(cadence);
            updates.push(`next_run_at = $${paramIndex++}`);
            params.push(computeNextRunAt(cadence));
        }

        if (emailListId !== undefined) {
            updates.push(`email_list_id = $${paramIndex++}`);
            params.push(emailListId);
        }

        if (enabled !== undefined) {
            updates.push(`enabled = $${paramIndex++}`);
            params.push(enabled);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }

        params.push(req.params.id);

        const result = await query(
            `UPDATE report_schedules SET ${updates.join(', ')} WHERE id = $${paramIndex}
             RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Schedule not found' });
        }

        const withNames = await query(
            `SELECT rs.*, rt.name as template_name, el.name as email_list_name
             FROM report_schedules rs
             LEFT JOIN report_templates rt ON rs.saved_template_id = rt.id
             LEFT JOIN email_lists el ON rs.email_list_id = el.id
             WHERE rs.id = $1`,
            [req.params.id]
        );

        res.json({ success: true, data: mapScheduleRow(withNames.rows[0]) });
    } catch (error) {
        next(error);
    }
});

router.delete('/schedules/:id', async (req, res, next) => {
    try {
        const result = await query(
            `DELETE FROM report_schedules WHERE id = $1 RETURNING id`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Schedule not found' });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.post('/schedules/:id/run', async (req, res, next) => {
    try {
        const scheduleResult = await query(
            `SELECT rs.*, rt.row_entity, rt.columns, rt.filters
             FROM report_schedules rs
             JOIN report_templates rt ON rs.saved_template_id = rt.id
             WHERE rs.id = $1`,
            [req.params.id]
        );

        if (scheduleResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Schedule not found' });
        }

        const schedule = scheduleResult.rows[0];

        console.log(`[STUB] Would send report "${schedule.saved_template_id}" to email list "${schedule.email_list_id}"`);

        await query(
            `UPDATE report_schedules SET last_run_at = NOW(), next_run_at = $1 WHERE id = $2`,
            [computeNextRunAt(schedule.cadence), schedule.id]
        );

        res.json({ success: true, message: 'Report run triggered (email delivery stubbed)' });
    } catch (error) {
        next(error);
    }
});

function mapScheduleRow(row) {
    return {
        id: row.id,
        savedTemplateId: row.saved_template_id,
        templateName: row.template_name || null,
        emailListId: row.email_list_id,
        emailListName: row.email_list_name || null,
        cadence: row.cadence,
        enabled: row.enabled,
        lastRunAt: formatDateTime(row.last_run_at),
        nextRunAt: formatDateTime(row.next_run_at),
        createdBy: row.created_by,
        createdAt: formatDateTime(row.created_at),
    };
}

function computeNextRunAt(cadence) {
    const now = new Date();
    switch (cadence) {
        case 'hourly':
            return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        case 'daily':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        case 'weekly':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        case 'monthly':
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        default:
            return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
}

// ---------------------------------------------------------------------------
// Report Data Endpoint — Entity-Specific Pipelines
// ---------------------------------------------------------------------------

router.post('/data', async (req, res, next) => {
    try {
        const { rowEntity, filters = {} } = req.body;

        if (!rowEntity) {
            return res.status(400).json({
                success: false,
                error: 'rowEntity is required',
            });
        }

        let data;
        switch (rowEntity) {
            case 'studyProcedure':
                data = await fetchStudyProcedureRows(filters);
                break;
            case 'form':
                data = await fetchFormRows(filters);
                break;
            case 'actionRequired':
                data = await fetchFlaggedTaskRows(filters);
                break;
            case 'subject':
                data = await fetchSubjectRows(filters);
                break;
            case 'asset':
                data = await fetchAssetRows(filters);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: `Unknown rowEntity: ${rowEntity}`,
                });
        }

        res.json({
            success: true,
            data,
            totalRows: data.length,
        });
    } catch (error) {
        next(error);
    }
});

// ---------------------------------------------------------------------------
// Pipeline A — Study Procedure Rows
// ---------------------------------------------------------------------------

async function fetchStudyProcedureRows(filters) {
    const { conditions, params } = buildHierarchyFilters(filters);

    const result = await query(
        `SELECT
            acc.trial_name,
            acc.company_name,
            tc.name as site_name,
            tc.identifier as site_number,
            tc.country_code,
            ss.number as subject_number,
            sa.display_name as arm_name,
            se.display_name as event_name,
            se.date as event_date,
            se.status as event_status,
            sp.id as procedure_id,
            sp.display_name as procedure_name,
            sp.date as procedure_date,
            sp.status as procedure_status,
            sp.updated_at as procedure_updated_at,
            sp.study_procedure_tasks_json,
            evaluator.first_name as evaluator_first_name,
            evaluator.last_name as evaluator_last_name,
            (SELECT array_agg(a.s3_url)
             FROM assets a
             WHERE a.study_procedure_id = sp.id AND a.soft_deleted_at IS NULL
            ) as asset_urls
        FROM study_procedures sp
        JOIN study_events se ON sp.study_event_id = se.id AND se.deleted_at IS NULL
        JOIN study_subjects ss ON se.study_subject_id = ss.id
        JOIN trial_containers tc ON ss.site_id = tc.id AND tc.deleted_at IS NULL AND tc.type = 'Site'
        JOIN accounts acc ON tc.account_id = acc.id
        LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
        LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
        WHERE sp.deleted_at IS NULL ${conditions}
        ORDER BY tc.name, ss.number, se.date, sp.date`,
        params
    );

    let rows = result.rows.map(row => ({
        trialName: row.trial_name || row.company_name,
        siteName: row.site_name,
        siteNumber: row.site_number || '',
        siteCountry: getCountryName(row.country_code),
        trialConfigName: '',
        subjectNumber: row.subject_number,
        studyEventName: row.event_name,
        studyEventArm: row.arm_name || '',
        studyEventStatus: String(row.event_status ?? ''),
        studyEventDate: formatDate(row.event_date) || '',
        studyProcedureName: row.procedure_name,
        studyProcedureDate: formatDate(row.procedure_date) || '',
        studyProcedureStatus: String(row.procedure_status ?? ''),
        clinicalEvaluator: [row.evaluator_first_name, row.evaluator_last_name].filter(Boolean).join(' '),
        tasks: parseTasks(row.study_procedure_tasks_json),
        assetLinks: row.asset_urls || [],
        studyProcedureLink: '',
        studyProcedureUpdates: formatDateTime(row.procedure_updated_at) || '',
    }));

    rows = applyTaskStatusFilters(rows, filters.taskStatusFilters);

    if (filters.exceptionDaysThreshold) {
        rows = applyExceptionFilter(rows, filters.exceptionDaysThreshold);
    }

    return rows;
}

// ---------------------------------------------------------------------------
// Pipeline B — Form Rows
// ---------------------------------------------------------------------------

async function fetchFormRows(filters) {
    const { conditions, params } = buildHierarchyFilters(filters);

    let formCondition = '';
    if (filters.formStatus) {
        params.push(filters.formStatus);
        formCondition = ` AND f.status = $${params.length}`;
    }

    const result = await query(
        `SELECT
            acc.trial_name,
            acc.company_name,
            tc.name as site_name,
            tc.identifier as site_number,
            tc.country_code,
            ss.number as subject_number,
            sa.display_name as arm_name,
            se.display_name as event_name,
            se.date as event_date,
            se.status as event_status,
            sp.display_name as procedure_name,
            sp.date as procedure_date,
            sp.status as procedure_status,
            evaluator.first_name as evaluator_first_name,
            evaluator.last_name as evaluator_last_name,
            f.id as form_id,
            f.name as form_name,
            f.status as form_status,
            f.submitted_at
        FROM forms f
        JOIN study_procedures sp ON f.form_container_id = sp.id AND f.form_container_type = 'Study::Procedure'
        JOIN study_events se ON sp.study_event_id = se.id AND se.deleted_at IS NULL
        JOIN study_subjects ss ON se.study_subject_id = ss.id
        JOIN trial_containers tc ON ss.site_id = tc.id AND tc.deleted_at IS NULL AND tc.type = 'Site'
        JOIN accounts acc ON tc.account_id = acc.id
        LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
        LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
        WHERE sp.deleted_at IS NULL ${conditions}${formCondition}
        ORDER BY tc.name, ss.number, se.date, sp.date, f.name`,
        params
    );

    return result.rows.map(row => ({
        trialName: row.trial_name || row.company_name,
        siteName: row.site_name,
        siteNumber: row.site_number || '',
        siteCountry: getCountryName(row.country_code),
        subjectNumber: row.subject_number,
        studyEventName: row.event_name,
        studyEventArm: row.arm_name || '',
        studyEventStatus: String(row.event_status ?? ''),
        studyEventDate: formatDate(row.event_date) || '',
        studyProcedureName: row.procedure_name,
        studyProcedureDate: formatDate(row.procedure_date) || '',
        studyProcedureStatus: String(row.procedure_status ?? ''),
        clinicalEvaluator: [row.evaluator_first_name, row.evaluator_last_name].filter(Boolean).join(' '),
        formName: row.form_name,
        formStatus: row.form_status || '',
        submittedAt: formatDateTime(row.submitted_at),
        formLink: '',
    }));
}

// ---------------------------------------------------------------------------
// Pipeline C — Flagged Task (Action Required) Rows
// ---------------------------------------------------------------------------

async function fetchFlaggedTaskRows(filters) {
    const { conditions, params } = buildHierarchyFilters(filters);

    const result = await query(
        `SELECT
            acc.trial_name,
            acc.company_name,
            tc.name as site_name,
            tc.identifier as site_number,
            tc.country_code,
            ss.number as subject_number,
            sa.display_name as arm_name,
            se.display_name as event_name,
            se.date as event_date,
            se.status as event_status,
            sp.display_name as procedure_name,
            sp.date as procedure_date,
            sp.status as procedure_status,
            evaluator.first_name as evaluator_first_name,
            evaluator.last_name as evaluator_last_name,
            ft.value as flagged_task
        FROM study_procedures sp
        CROSS JOIN LATERAL jsonb_array_elements(
            COALESCE(sp.study_procedure_flagged_tasks_json->'flagged_tasks', '[]'::jsonb)
        ) AS ft(value)
        JOIN study_events se ON sp.study_event_id = se.id AND se.deleted_at IS NULL
        JOIN study_subjects ss ON se.study_subject_id = ss.id
        JOIN trial_containers tc ON ss.site_id = tc.id AND tc.deleted_at IS NULL AND tc.type = 'Site'
        JOIN accounts acc ON tc.account_id = acc.id
        LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
        LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
        WHERE sp.deleted_at IS NULL
          ${filters.includeResolved ? '' : "AND (ft.value->>'resolved_at') IS NULL"}
          ${conditions}
        ORDER BY tc.name, ss.number, se.date, sp.date`,
        params
    );

    return result.rows.map(row => {
        const ft = row.flagged_task;
        return {
            trialName: row.trial_name || row.company_name,
            siteName: row.site_name,
            siteNumber: row.site_number || '',
            siteCountry: getCountryName(row.country_code),
            subjectNumber: row.subject_number,
            studyEventName: row.event_name,
            studyEventArm: row.arm_name || '',
            studyEventStatus: String(row.event_status ?? ''),
            studyEventDate: formatDate(row.event_date) || '',
            studyProcedureName: row.procedure_name,
            studyProcedureDate: formatDate(row.procedure_date) || '',
            studyProcedureStatus: String(row.procedure_status ?? ''),
            clinicalEvaluator: [row.evaluator_first_name, row.evaluator_last_name].filter(Boolean).join(' '),
            actionRequiredReason: ft?.name || ft?.reason || '',
            actionRequiredCreationDate: formatDateTime(ft?.created_at) || '',
            actionRequiredCreator: ft?.created_by_name || '',
            flagStatus: ft?.resolved_at ? 'resolved' : 'open',
            priority: ft?.priority || '',
            actionRequiredLink: '',
        };
    });
}

// ---------------------------------------------------------------------------
// Pipeline D — Subject Rows
// ---------------------------------------------------------------------------

async function fetchSubjectRows(filters) {
    const { conditions, params } = buildHierarchyFilters(filters);

    const result = await query(
        `SELECT
            acc.trial_name,
            acc.company_name,
            tc.name as site_name,
            tc.identifier as site_number,
            tc.country_code,
            ss.number as subject_number,
            ss.active,
            ss.created_at
        FROM study_subjects ss
        JOIN trial_containers tc ON ss.site_id = tc.id AND tc.deleted_at IS NULL AND tc.type = 'Site'
        JOIN accounts acc ON tc.account_id = acc.id
        WHERE 1=1 ${conditions}
        ORDER BY tc.name, ss.number`,
        params
    );

    return result.rows.map(row => ({
        trialName: row.trial_name || row.company_name,
        siteName: row.site_name,
        siteNumber: row.site_number || '',
        siteCountry: getCountryName(row.country_code),
        subjectNumber: row.subject_number,
        subjectStatus: row.active ? 'Active' : 'Disabled',
        subjectStatusReason: '',
    }));
}

// ---------------------------------------------------------------------------
// Pipeline E — Asset Rows (extended with task data)
// ---------------------------------------------------------------------------

async function fetchAssetRows(filters) {
    const { conditions, params } = buildHierarchyFilters(filters);

    const result = await query(
        `SELECT
            a.id as asset_id,
            a.filename,
            a.filesize,
            a.created_at as upload_date,
            a.processed,
            a.s3_url,
            a.media_info,
            acc.id as trial_id,
            acc.trial_name,
            acc.company_name,
            tc.id as site_id,
            tc.name as site_name,
            tc.identifier as site_number,
            tc.country_code,
            ss.number as subject_number,
            sa.display_name as arm_name,
            se.display_name as event_name,
            sp.display_name as procedure_name,
            sp.date as procedure_date,
            sp.study_procedure_tasks_json,
            evaluator.first_name as evaluator_first_name,
            evaluator.last_name as evaluator_last_name,
            uploader.first_name as uploader_first_name,
            uploader.last_name as uploader_last_name,
            uploader.email as uploader_email
        FROM assets a
        JOIN trial_containers tc ON a.trial_container_id = tc.id AND tc.deleted_at IS NULL AND tc.type = 'Site'
        JOIN accounts acc ON tc.account_id = acc.id
        LEFT JOIN study_procedures sp ON a.study_procedure_id = sp.id AND sp.deleted_at IS NULL
        LEFT JOIN study_events se ON sp.study_event_id = se.id
        LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
        LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
        LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
        LEFT JOIN users uploader ON a.uploader_id = uploader.id
        WHERE a.soft_deleted_at IS NULL ${conditions}
        ORDER BY tc.name, ss.number, a.created_at DESC`,
        params
    );

    let rows = result.rows.map(row => ({
        trialName: row.trial_name || row.company_name,
        trialId: row.trial_id,
        siteName: row.site_name,
        siteId: row.site_id,
        siteNumber: row.site_number || '',
        siteCountry: getCountryName(row.country_code),
        subjectNumber: row.subject_number || '',
        studyArm: row.arm_name || '',
        studyEvent: row.event_name || '',
        studyProcedure: row.procedure_name || '',
        studyProcedureDate: formatDate(row.procedure_date) || '',
        evaluator: [row.evaluator_first_name, row.evaluator_last_name].filter(Boolean).join(' '),
        assetId: row.asset_id,
        assetTitle: row.filename,
        uploadDate: formatDateTime(row.upload_date) || '',
        uploadedBy: [row.uploader_first_name, row.uploader_last_name].filter(Boolean).join(' ') || row.uploader_email || '',
        processed: row.processed ? 'Yes' : 'No',
        assetDuration: '',
        fileSize: row.filesize ? `${(parseInt(row.filesize) / (1024 * 1024)).toFixed(2)} MB` : '',
        assetLink: row.s3_url || '',
        containsPii: '',
        piiProcessed: '',
        tasks: parseTasks(row.study_procedure_tasks_json),
    }));

    rows = applyTaskStatusFilters(rows, filters.taskStatusFilters);

    return rows;
}

// ---------------------------------------------------------------------------
// Shared Helpers
// ---------------------------------------------------------------------------

function buildHierarchyFilters(filters) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.trialIds?.length) {
        conditions.push(`acc.id = ANY($${paramIndex++})`);
        params.push(filters.trialIds);
    }

    if (filters.siteIds?.length) {
        conditions.push(`tc.id = ANY($${paramIndex++})`);
        params.push(filters.siteIds);
    }

    if (filters.dateRange?.start) {
        conditions.push(`sp.date >= $${paramIndex++}`);
        params.push(filters.dateRange.start);
    }

    if (filters.dateRange?.end) {
        conditions.push(`sp.date <= $${paramIndex++}`);
        params.push(filters.dateRange.end);
    }

    const conditionStr = conditions.length > 0
        ? ' AND ' + conditions.join(' AND ')
        : '';

    return { conditions: conditionStr, params };
}

function parseTasks(tasksJson) {
    if (!tasksJson || !tasksJson.tasks) return [];
    return tasksJson.tasks.map(t => ({
        name: t.name || '',
        completedDate: t.completed_date || null,
    }));
}

function applyTaskStatusFilters(rows, taskStatusFilters) {
    if (!taskStatusFilters?.length) return rows;

    return rows.filter(row => {
        return taskStatusFilters.every(tsf => {
            const task = row.tasks?.find(t =>
                t.name.toLowerCase().includes(tsf.taskName.toLowerCase())
            );
            if (!task) return tsf.status === 'incomplete';
            const isComplete = task.completedDate !== null;
            return tsf.status === 'complete' ? isComplete : !isComplete;
        });
    });
}

function applyExceptionFilter(rows, thresholdDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - thresholdDays);

    return rows.filter(row => {
        const hasAssets = row.assetLinks?.length > 0;
        const allTasksIncomplete = row.tasks?.length > 0 &&
            !row.tasks.every(t => t.completedDate !== null);
        const procedureOldEnough = row.studyProcedureDate &&
            new Date(row.studyProcedureDate) < cutoff;
        return hasAssets && allTasksIncomplete && procedureOldEnough;
    });
}

export default router;
