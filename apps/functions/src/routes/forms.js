import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function formatDateTime(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().replace('T', ' ').substring(0, 19);
}

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

router.post('/query', async (req, res, next) => {
    try {
        const {
            sites = [],
            formStatus = 'all',
            dateRange = {},
            page = 1,
            limit = 1000,
        } = req.body;

        const safeLimit = Math.min(Math.max(1, limit), 5000);
        const safePage = Math.max(1, page);
        const offset = (safePage - 1) * safeLimit;

        const filters = ['f.deleted_at IS NULL'];
        const params = [];
        let paramIndex = 1;

        if (sites.length > 0) {
            filters.push(`tc.name = ANY($${paramIndex++})`);
            params.push(sites);
        }

        if (dateRange.start) {
            filters.push(`f.created_at >= $${paramIndex++}`);
            params.push(dateRange.start);
        }

        if (dateRange.end) {
            filters.push(`f.created_at <= $${paramIndex++}`);
            params.push(dateRange.end + ' 23:59:59');
        }

        const whereClause = filters.join(' AND ');

        const countQuery = `
            SELECT COUNT(*) as total
            FROM forms f
            LEFT JOIN form_templates ft ON f.form_template_id = ft.id
            LEFT JOIN assets a ON f.asset_id = a.id
            LEFT JOIN study_procedures sp ON f.form_container_type = 'Study::Procedure' AND f.form_container_id = sp.id
            LEFT JOIN study_events se ON sp.study_event_id = se.id
            LEFT JOIN study_subjects ss ON COALESCE(se.study_subject_id, a.study_subject_id) = ss.id
            LEFT JOIN trial_containers tc ON ss.site_id = tc.id
            WHERE ${whereClause}
        `;

        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].total) || 0;
        const totalPages = Math.ceil(total / safeLimit);

        params.push(safeLimit);
        params.push(offset);

        const dataQuery = `
            SELECT
                f.id as form_id,
                f.uuid as form_uuid,
                f.created_at as submitted_at,
                f.form_container_type,
                ft.title as form_name,
                sp.date as procedure_date,
                spd.display_name as procedure_name,
                sed.display_name as event_name,
                ss.id as subject_id,
                ss.number as subject_number,
                sa.display_name as arm_name,
                tc.id as site_id,
                tc.name as site_name,
                tc.country_code
            FROM forms f
            LEFT JOIN form_templates ft ON f.form_template_id = ft.id
            LEFT JOIN assets a ON f.asset_id = a.id
            LEFT JOIN study_procedures sp ON f.form_container_type = 'Study::Procedure' AND f.form_container_id = sp.id
            LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
            LEFT JOIN study_events se ON sp.study_event_id = se.id
            LEFT JOIN study_event_definitions sed ON se.study_event_definition_id = sed.id
            LEFT JOIN study_subjects ss ON COALESCE(se.study_subject_id, a.study_subject_id) = ss.id
            LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
            LEFT JOIN trial_containers tc ON ss.site_id = tc.id
            WHERE ${whereClause}
            ORDER BY f.created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        const result = await query(dataQuery, params);

        const forms = result.rows.map(row => ({
            formId: row.form_uuid || row.form_id.toString(),
            formName: row.form_name || 'Unknown Form',
            formStatus: 'complete',
            submittedAt: formatDateTime(row.submitted_at),
            site: {
                id: row.site_id,
                name: row.site_name || 'Unknown Site',
                country: COUNTRY_CODE_MAP[row.country_code] || row.country_code || 'Unknown',
            },
            subject: {
                id: row.subject_id,
                number: row.subject_number || 'Unknown',
                arm: row.arm_name || null,
            },
            event: {
                name: row.event_name || 'N/A',
            },
            procedure: {
                id: row.procedure_id,
                name: row.procedure_name || 'N/A',
                date: formatDate(row.procedure_date),
            },
        }));

        res.json({
            success: true,
            data: forms,
            meta: {
                total,
                page: safePage,
                limit: safeLimit,
                totalPages,
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get('/all', async (req, res, next) => {
    try {
        const dataQuery = `
            SELECT
                f.id as form_id,
                f.uuid as form_uuid,
                f.created_at as submitted_at,
                f.form_container_type,
                ft.title as form_name,
                sp.date as procedure_date,
                spd.display_name as procedure_name,
                sed.display_name as event_name,
                ss.id as subject_id,
                ss.number as subject_number,
                sa.display_name as arm_name,
                tc.id as site_id,
                tc.name as site_name,
                tc.country_code
            FROM forms f
            LEFT JOIN form_templates ft ON f.form_template_id = ft.id
            LEFT JOIN assets a ON f.asset_id = a.id
            LEFT JOIN study_procedures sp ON f.form_container_type = 'Study::Procedure' AND f.form_container_id = sp.id
            LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
            LEFT JOIN study_events se ON sp.study_event_id = se.id
            LEFT JOIN study_event_definitions sed ON se.study_event_definition_id = sed.id
            LEFT JOIN study_subjects ss ON COALESCE(se.study_subject_id, a.study_subject_id) = ss.id
            LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
            LEFT JOIN trial_containers tc ON ss.site_id = tc.id
            WHERE f.deleted_at IS NULL
            ORDER BY f.created_at DESC
        `;

        const result = await query(dataQuery);

        const forms = result.rows.map(row => ({
            formId: row.form_uuid || row.form_id.toString(),
            formName: row.form_name || 'Unknown Form',
            formStatus: 'complete',
            submittedAt: formatDateTime(row.submitted_at),
            siteName: row.site_name || 'Unknown Site',
            siteId: row.site_id,
            siteCountry: COUNTRY_CODE_MAP[row.country_code] || row.country_code || 'Unknown',
            subjectNumber: row.subject_number || 'Unknown',
            studyArm: row.arm_name || '',
            eventName: row.event_name || 'N/A',
            procedureName: row.procedure_name || 'N/A',
            procedureDate: formatDate(row.procedure_date),
        }));

        res.json({
            success: true,
            data: forms,
            meta: {
                total: forms.length,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
