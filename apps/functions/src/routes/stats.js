import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const filters = [];
        const params = [];
        let paramIndex = 1;

        if (req.query.trial_id) {
            filters.push(`account_id = $${paramIndex++}`);
            params.push(req.query.trial_id);
        }

        const assetWhere =
            filters.length > 0
                ? `WHERE soft_deleted_at IS NULL AND ${filters.join(' AND ')}`
                : 'WHERE soft_deleted_at IS NULL';

        const [
            assetStats,
            trialStats,
            siteStats,
            subjectStats,
            taskStats,
            uploadTrend,
        ] = await Promise.all([
            query(
                `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE processed = true) as processed,
          SUM(filesize) as total_size
        FROM assets ${assetWhere}
      `,
                params
            ),

            query(
                `SELECT COUNT(*) as total FROM accounts WHERE deleted_at IS NULL`
            ),

            query(
                `SELECT COUNT(*) as total FROM trial_containers WHERE type = 'Site' AND deleted_at IS NULL`
            ),

            query(`SELECT COUNT(*) as total FROM study_subjects`),

            query(`
        WITH procedure_tasks AS (
          SELECT jsonb_array_elements(study_procedure_tasks_json->'tasks') as task
          FROM study_procedures
          WHERE deleted_at IS NULL
          AND study_procedure_tasks_json IS NOT NULL
        )
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE task->>'completed_date' IS NOT NULL) as completed
        FROM procedure_tasks
      `),

            query(`
        SELECT
          DATE_TRUNC('day', created_at)::date as date,
          COUNT(*) as uploads
        FROM assets
        WHERE soft_deleted_at IS NULL
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
        LIMIT 30
      `),
        ]);

        const totalAssets = parseInt(assetStats.rows[0].total) || 0;
        const processedAssets = parseInt(assetStats.rows[0].processed) || 0;
        const totalSize = parseInt(assetStats.rows[0].total_size) || 0;
        const completedTasks = parseInt(taskStats.rows[0].completed) || 0;
        const totalTasks = parseInt(taskStats.rows[0].total) || 0;

        res.json({
            success: true,
            data: {
                assets: {
                    total: totalAssets,
                    processed: processedAssets,
                    processingRate:
                        totalAssets > 0
                            ? Math.round((processedAssets / totalAssets) * 100)
                            : 0,
                    totalSizeBytes: totalSize,
                    totalSizeFormatted: formatSize(totalSize),
                },
                trials: {
                    total: parseInt(trialStats.rows[0].total) || 0,
                },
                sites: {
                    total: parseInt(siteStats.rows[0].total) || 0,
                },
                subjects: {
                    total: parseInt(subjectStats.rows[0].total) || 0,
                },
                tasks: {
                    completed: completedTasks,
                    total: totalTasks,
                    completionRate:
                        totalTasks > 0
                            ? Math.round((completedTasks / totalTasks) * 100)
                            : 0,
                },
                uploadTrend: uploadTrend.rows.map(r => ({
                    date: r.date,
                    uploads: parseInt(r.uploads),
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

function formatSize(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(2)} ${units[i]}`;
}

router.get('/sites', async (req, res, next) => {
    try {
        const params = [];
        let paramIndex = 1;
        let trialFilter = '';

        if (req.query.trial_id) {
            trialFilter = `AND tc.account_id = $${paramIndex++}`;
            params.push(req.query.trial_id);
        }

        const [
            siteCount,
            subjectCount,
            assetCount,
            assetsPerSite,
            subjectsPerSite,
            countriesDistribution,
        ] = await Promise.all([
            query(
                `SELECT COUNT(*) as total FROM trial_containers tc WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}`,
                params
            ),

            query(
                `
                SELECT COUNT(DISTINCT ss.id) as total
                FROM study_subjects ss
                JOIN trial_containers tc ON ss.site_id = tc.id
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
                `,
                params
            ),

            query(
                `
                SELECT COUNT(*) as total
                FROM assets a
                JOIN trial_containers tc ON a.trial_container_id = tc.id
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL AND a.soft_deleted_at IS NULL ${trialFilter}
                `,
                params
            ),

            query(
                `
                SELECT tc.id as site_id, tc.name as site_name, COUNT(a.id) as count
                FROM trial_containers tc
                LEFT JOIN assets a ON a.trial_container_id = tc.id AND a.soft_deleted_at IS NULL
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
                GROUP BY tc.id, tc.name
                ORDER BY count DESC
                LIMIT 20
                `,
                params
            ),

            query(
                `
                SELECT tc.id as site_id, tc.name as site_name, COUNT(ss.id) as count
                FROM trial_containers tc
                LEFT JOIN study_subjects ss ON ss.site_id = tc.id
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
                GROUP BY tc.id, tc.name
                ORDER BY count DESC
                LIMIT 20
                `,
                params
            ),

            query(
                `
                SELECT
                    tc.country_code as country,
                    COUNT(DISTINCT tc.id) as site_count,
                    COUNT(DISTINCT a.id) as asset_count
                FROM trial_containers tc
                LEFT JOIN assets a ON a.trial_container_id = tc.id AND a.soft_deleted_at IS NULL
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL AND tc.country_code IS NOT NULL ${trialFilter}
                GROUP BY tc.country_code
                ORDER BY site_count DESC
                `,
                params
            ),
        ]);

        res.json({
            success: true,
            data: {
                totalSites: parseInt(siteCount.rows[0].total) || 0,
                totalSubjects: parseInt(subjectCount.rows[0].total) || 0,
                totalAssets: parseInt(assetCount.rows[0].total) || 0,
                assetsPerSite: assetsPerSite.rows.map(r => ({
                    siteId: r.site_id,
                    siteName: r.site_name,
                    count: parseInt(r.count) || 0,
                })),
                subjectsPerSite: subjectsPerSite.rows.map(r => ({
                    siteId: r.site_id,
                    siteName: r.site_name,
                    count: parseInt(r.count) || 0,
                })),
                countriesDistribution: countriesDistribution.rows.map(r => ({
                    country: r.country,
                    siteCount: parseInt(r.site_count) || 0,
                    assetCount: parseInt(r.asset_count) || 0,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get('/forms', async (req, res, next) => {
    try {
        const params = [];
        let paramIndex = 1;
        let trialFilter = '';

        if (req.query.trial_id) {
            trialFilter = `AND tc.account_id = $${paramIndex++}`;
            params.push(req.query.trial_id);
        }

        const formsQuery = `
            SELECT COUNT(*) as total
            FROM forms f
            WHERE f.deleted_at IS NULL
        `;

        const bySiteQuery = `
            SELECT
                tc.id as site_id,
                tc.name as site_name,
                COUNT(*) as total,
                COUNT(*) as complete
            FROM forms f
            LEFT JOIN assets a ON f.asset_id = a.id
            LEFT JOIN study_procedures sp ON f.form_container_type = 'Study::Procedure' AND f.form_container_id = sp.id
            LEFT JOIN study_events se ON sp.study_event_id = se.id
            LEFT JOIN study_subjects ss ON COALESCE(se.study_subject_id, a.study_subject_id) = ss.id
            LEFT JOIN trial_containers tc ON ss.site_id = tc.id
            WHERE f.deleted_at IS NULL
            AND tc.id IS NOT NULL
            ${trialFilter}
            GROUP BY tc.id, tc.name
            ORDER BY total DESC
            LIMIT 20
        `;

        const byTemplateQuery = `
            SELECT
                COALESCE(ft.title, 'Unknown Form') as procedure,
                COUNT(*) as total,
                COUNT(*) as complete
            FROM forms f
            LEFT JOIN form_templates ft ON f.form_template_id = ft.id
            WHERE f.deleted_at IS NULL
            GROUP BY ft.title
            ORDER BY total DESC
            LIMIT 10
        `;

        const [formStats, bySite, byTemplate] = await Promise.all([
            query(formsQuery, []),
            query(bySiteQuery, params),
            query(byTemplateQuery, []),
        ]);

        const total = parseInt(formStats.rows[0]?.total) || 0;

        res.json({
            success: true,
            data: {
                total,
                complete: total,
                pending: 0,
                notStarted: 0,
                completionRate: 100,
                byProcedureType: byTemplate.rows.map(r => ({
                    procedure: r.procedure,
                    total: parseInt(r.total) || 0,
                    complete: parseInt(r.complete) || 0,
                })),
                bySite: bySite.rows.map(r => ({
                    siteId: r.site_id,
                    siteName: r.site_name,
                    total: parseInt(r.total) || 0,
                    complete: parseInt(r.complete) || 0,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

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
                    COUNT(f.id) as complete_forms
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
