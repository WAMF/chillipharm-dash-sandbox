import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const COUNTRY_CODE_MAP = {
    AF: 'Afghanistan',
    AL: 'Albania',
    DZ: 'Algeria',
    AR: 'Argentina',
    AU: 'Australia',
    AT: 'Austria',
    BE: 'Belgium',
    BR: 'Brazil',
    BG: 'Bulgaria',
    CA: 'Canada',
    CL: 'Chile',
    CN: 'China',
    CO: 'Colombia',
    HR: 'Croatia',
    CZ: 'Czechia',
    DK: 'Denmark',
    EG: 'Egypt',
    FI: 'Finland',
    FR: 'France',
    DE: 'Germany',
    GR: 'Greece',
    HK: 'Hong Kong',
    HU: 'Hungary',
    IN: 'India',
    ID: 'Indonesia',
    IE: 'Ireland',
    IL: 'Israel',
    IT: 'Italy',
    JP: 'Japan',
    KR: 'South Korea',
    MY: 'Malaysia',
    MX: 'Mexico',
    NL: 'Netherlands',
    NZ: 'New Zealand',
    NO: 'Norway',
    PK: 'Pakistan',
    PH: 'Philippines',
    PL: 'Poland',
    PT: 'Portugal',
    RO: 'Romania',
    RU: 'Russia',
    SA: 'Saudi Arabia',
    SG: 'Singapore',
    ZA: 'South Africa',
    ES: 'Spain',
    SE: 'Sweden',
    CH: 'Switzerland',
    TW: 'Taiwan',
    TH: 'Thailand',
    TR: 'Turkey',
    UA: 'Ukraine',
    AE: 'United Arab Emirates',
    GB: 'United Kingdom',
    US: 'United States',
    VN: 'Vietnam',
};

router.get('/sites/report', async (req, res, next) => {
    try {
        const params = [];
        let paramIndex = 1;
        let trialFilter = '';

        if (req.query.trial_id) {
            trialFilter = `AND tc.account_id = $${paramIndex++}`;
            params.push(req.query.trial_id);
        }

        const siteReportQuery = `
            WITH site_subjects AS (
                SELECT
                    tc.id as site_id,
                    COUNT(DISTINCT ss.id) as subject_count
                FROM trial_containers tc
                LEFT JOIN study_subjects ss ON ss.site_id = tc.id
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
                GROUP BY tc.id
            ),
            site_assets AS (
                SELECT
                    tc.id as site_id,
                    COUNT(a.id) as asset_count
                FROM trial_containers tc
                LEFT JOIN assets a ON a.trial_container_id = tc.id AND a.soft_deleted_at IS NULL
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
                GROUP BY tc.id
            ),
            site_forms AS (
                SELECT
                    tc.id as site_id,
                    COUNT(f.id) as total_forms,
                    COUNT(f.id) FILTER (WHERE f.status = 'complete') as complete_forms
                FROM trial_containers tc
                LEFT JOIN study_subjects ss ON ss.site_id = tc.id
                LEFT JOIN assets a ON a.study_subject_id = ss.id
                LEFT JOIN forms f ON (f.asset_id = a.id OR (f.form_container_type = 'Study::Procedure' AND f.form_container_id IN (
                    SELECT sp.id FROM study_procedures sp
                    JOIN study_events se ON sp.study_event_id = se.id
                    WHERE se.study_subject_id = ss.id
                )))
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL
                AND f.deleted_at IS NULL
                ${trialFilter}
                GROUP BY tc.id
            ),
            site_tasks AS (
                SELECT
                    tc.id as site_id,
                    COUNT(*) as total_tasks,
                    COUNT(*) FILTER (WHERE task->>'completed_date' IS NOT NULL) as completed_tasks
                FROM trial_containers tc
                JOIN study_subjects ss ON ss.site_id = tc.id
                JOIN study_events se ON se.study_subject_id = ss.id
                JOIN study_procedures sp ON sp.study_event_id = se.id
                CROSS JOIN LATERAL jsonb_array_elements(COALESCE(sp.study_procedure_tasks_json->'tasks', '[]'::jsonb)) as task
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL
                AND sp.deleted_at IS NULL
                AND sp.study_procedure_tasks_json IS NOT NULL
                ${trialFilter}
                GROUP BY tc.id
            ),
            site_flags AS (
                SELECT
                    tc.id as site_id,
                    COUNT(*) FILTER (WHERE flag->>'resolved_at' IS NULL) as open_flags,
                    COUNT(*) FILTER (WHERE flag->>'resolved_at' IS NOT NULL) as resolved_flags
                FROM trial_containers tc
                JOIN study_subjects ss ON ss.site_id = tc.id
                JOIN study_events se ON se.study_subject_id = ss.id
                JOIN study_procedures sp ON sp.study_event_id = se.id
                CROSS JOIN LATERAL jsonb_array_elements(COALESCE(sp.study_procedure_flagged_tasks_json->'flagged_tasks', '[]'::jsonb)) as flag
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL
                AND sp.deleted_at IS NULL
                AND sp.study_procedure_flagged_tasks_json IS NOT NULL
                ${trialFilter}
                GROUP BY tc.id
            )
            SELECT
                tc.id as site_id,
                tc.name as site_name,
                tc.country_code,
                COALESCE(subj.subject_count, 0) as subject_count,
                COALESCE(assets.asset_count, 0) as asset_count,
                COALESCE(forms.total_forms, 0) as total_forms,
                COALESCE(forms.complete_forms, 0) as complete_forms,
                COALESCE(tasks.total_tasks, 0) as total_tasks,
                COALESCE(tasks.completed_tasks, 0) as completed_tasks,
                COALESCE(flags.open_flags, 0) as open_flags,
                COALESCE(flags.resolved_flags, 0) as resolved_flags
            FROM trial_containers tc
            LEFT JOIN site_subjects subj ON subj.site_id = tc.id
            LEFT JOIN site_assets assets ON assets.site_id = tc.id
            LEFT JOIN site_forms forms ON forms.site_id = tc.id
            LEFT JOIN site_tasks tasks ON tasks.site_id = tc.id
            LEFT JOIN site_flags flags ON flags.site_id = tc.id
            WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
            ORDER BY tc.name
        `;

        const result = await query(siteReportQuery, params);

        res.json({
            success: true,
            data: result.rows.map(row => {
                const totalForms = parseInt(row.total_forms) || 0;
                const completeForms = parseInt(row.complete_forms) || 0;
                const totalTasks = parseInt(row.total_tasks) || 0;
                const completedTasks = parseInt(row.completed_tasks) || 0;

                return {
                    siteId: row.site_id,
                    siteName: row.site_name,
                    country: COUNTRY_CODE_MAP[row.country_code] || row.country_code || '',
                    subjectCount: parseInt(row.subject_count) || 0,
                    assetCount: parseInt(row.asset_count) || 0,
                    totalForms,
                    completeForms,
                    formCompletionRate: totalForms > 0 ? Math.round((completeForms / totalForms) * 100) : 0,
                    totalTasks,
                    completedTasks,
                    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                    openFlags: parseInt(row.open_flags) || 0,
                    resolvedFlags: parseInt(row.resolved_flags) || 0,
                };
            }),
        });
    } catch (error) {
        next(error);
    }
});

export default router;
