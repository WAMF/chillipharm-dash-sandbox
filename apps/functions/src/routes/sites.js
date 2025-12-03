import { Router } from 'express';
import { query } from '../db.js';
import {
    getPaginationParams,
    buildPaginationResponse,
    getSortParams,
} from '../utils/pagination.js';
import {
    getCountryName,
    formatDateTime,
    formatDate,
    formatDuration,
    formatFileSize,
} from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'name', 'country_code', 'created_at'];
const SUBJECT_SORT_FIELDS = ['id', 'number', 'created_at'];
const EVENT_SORT_FIELDS = ['id', 'date', 'status', 'created_at'];
const PROCEDURE_SORT_FIELDS = ['id', 'date', 'status', 'created_at'];
const ASSET_SORT_FIELDS = ['id', 'filename', 'filesize', 'created_at'];

async function validateSiteHierarchy(
    siteId,
    subjectId = null,
    eventId = null,
    procedureId = null
) {
    const site = await query(
        `SELECT id FROM trial_containers WHERE id = $1 AND type = 'Site' AND deleted_at IS NULL`,
        [siteId]
    );
    if (site.rows.length === 0) {
        return { valid: false, error: 'Site not found', status: 404 };
    }

    if (!subjectId) return { valid: true };

    const subject = await query(
        `SELECT id FROM study_subjects WHERE id = $1 AND site_id = $2`,
        [subjectId, siteId]
    );
    if (subject.rows.length === 0) {
        return {
            valid: false,
            error: 'Subject not found at this site',
            status: 404,
        };
    }

    if (!eventId) return { valid: true };

    const event = await query(
        `SELECT id FROM study_events WHERE id = $1 AND study_subject_id = $2 AND deleted_at IS NULL`,
        [eventId, subjectId]
    );
    if (event.rows.length === 0) {
        return {
            valid: false,
            error: 'Event not found for this subject',
            status: 404,
        };
    }

    if (!procedureId) return { valid: true };

    const procedure = await query(
        `SELECT id FROM study_procedures WHERE id = $1 AND study_event_id = $2 AND deleted_at IS NULL`,
        [procedureId, eventId]
    );
    if (procedure.rows.length === 0) {
        return {
            valid: false,
            error: 'Procedure not found for this event',
            status: 404,
        };
    }

    return { valid: true };
}

router.get('/', async (req, res, next) => {
    try {
        const { page, limit, offset } = getPaginationParams(req.query);
        const { sort, order } = getSortParams(
            req.query,
            ALLOWED_SORT_FIELDS,
            'name',
            'asc'
        );

        const filters = ["tc.type = 'Site'", 'tc.deleted_at IS NULL'];
        const params = [];
        let paramIndex = 1;

        if (req.query.trial_id) {
            filters.push(`tc.account_id = $${paramIndex++}`);
            params.push(req.query.trial_id);
        }

        if (req.query.country_code) {
            filters.push(`tc.country_code = $${paramIndex++}`);
            params.push(req.query.country_code);
        }

        if (req.query.search) {
            filters.push(`tc.name ILIKE $${paramIndex++}`);
            params.push(`%${req.query.search}%`);
        }

        const whereClause = `WHERE ${filters.join(' AND ')}`;

        const countResult = await query(
            `SELECT COUNT(*) FROM trial_containers tc ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        const dataResult = await query(
            `
      SELECT 
        tc.id,
        tc.name,
        tc.identifier,
        tc.country_code,
        tc.account_id as trial_id,
        tc.go_live_date,
        tc.access_status,
        tc.contact_name,
        tc.contact_email,
        tc.contact_number,
        tc.created_at,
        tc.updated_at,
        a.trial_name,
        a.company_name,
        (SELECT COUNT(*) FROM assets WHERE trial_container_id = tc.id AND soft_deleted_at IS NULL) as asset_count,
        (SELECT COUNT(*) FROM study_subjects WHERE site_id = tc.id) as subject_count
      FROM trial_containers tc
      LEFT JOIN accounts a ON tc.account_id = a.id
      ${whereClause}
      ORDER BY tc.${sort} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `,
            [...params, limit, offset]
        );

        const data = dataResult.rows.map(row => ({
            id: row.id,
            name: row.name,
            identifier: row.identifier,
            country: getCountryName(row.country_code),
            countryCode: row.country_code,
            goLiveDate: formatDate(row.go_live_date),
            accessStatus: row.access_status,
            contact: row.contact_name
                ? {
                      name: row.contact_name,
                      email: row.contact_email,
                      phone: row.contact_number,
                  }
                : null,
            trial: {
                id: row.trial_id,
                name: row.trial_name || row.company_name,
            },
            createdAt: formatDateTime(row.created_at),
            updatedAt: formatDateTime(row.updated_at),
            stats: {
                assetCount: parseInt(row.asset_count) || 0,
                subjectCount: parseInt(row.subject_count) || 0,
            },
        }));

        const pagination = buildPaginationResponse(
            page,
            limit,
            total,
            '/api/v1/sites',
            req.query
        );

        res.json({
            success: true,
            data,
            ...pagination,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const result = await query(
            `
      SELECT 
        tc.*,
        a.trial_name,
        a.company_name,
        (SELECT COUNT(*) FROM assets WHERE trial_container_id = tc.id AND soft_deleted_at IS NULL) as asset_count,
        (SELECT COUNT(*) FROM study_subjects WHERE site_id = tc.id) as subject_count
      FROM trial_containers tc
      LEFT JOIN accounts a ON tc.account_id = a.id
      WHERE tc.id = $1 AND tc.type = 'Site' AND tc.deleted_at IS NULL
    `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Site not found',
            });
        }

        const row = result.rows[0];

        res.json({
            success: true,
            data: {
                id: row.id,
                name: row.name,
                identifier: row.identifier,
                number: row.number,
                country: getCountryName(row.country_code),
                countryCode: row.country_code,
                goLiveDate: formatDate(row.go_live_date),
                accessStatus: row.access_status,
                reasonForLocking: row.reason_for_locking,
                shippingAddress: row.shipping_address,
                contact: row.contact_name
                    ? {
                          name: row.contact_name,
                          email: row.contact_email,
                          phone: row.contact_number,
                      }
                    : null,
                trial: {
                    id: row.account_id,
                    name: row.trial_name || row.company_name,
                },
                createdAt: formatDateTime(row.created_at),
                updatedAt: formatDateTime(row.updated_at),
                stats: {
                    assetCount: parseInt(row.asset_count) || 0,
                    subjectCount: parseInt(row.subject_count) || 0,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:siteId/subjects', async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const validation = await validateSiteHierarchy(siteId);
        if (!validation.valid) {
            return res
                .status(validation.status)
                .json({ success: false, error: validation.error });
        }

        const { page, limit, offset } = getPaginationParams(req.query);
        const { sort, order } = getSortParams(
            req.query,
            SUBJECT_SORT_FIELDS,
            'number',
            'asc'
        );

        const sortColumnMap = {
            id: 'ss.id',
            number: 'ss.number',
            created_at: 'ss.created_at',
        };

        const countResult = await query(
            `SELECT COUNT(*) FROM study_subjects ss WHERE ss.site_id = $1`,
            [siteId]
        );
        const total = parseInt(countResult.rows[0].count);

        const dataResult = await query(
            `
            SELECT
                ss.id,
                ss.number,
                ss.active,
                ss.created_at,
                sa.id as arm_id,
                sa.display_name as arm_name,
                COUNT(DISTINCT se.id) as event_count,
                COUNT(DISTINCT sp.id) as procedure_count
            FROM study_subjects ss
            LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
            LEFT JOIN study_events se ON se.study_subject_id = ss.id AND se.deleted_at IS NULL
            LEFT JOIN study_procedures sp ON sp.study_event_id = se.id AND sp.deleted_at IS NULL
            WHERE ss.site_id = $1
            GROUP BY ss.id, sa.id, sa.display_name
            ORDER BY ${sortColumnMap[sort] || 'ss.number'} ${order === 'asc' ? 'ASC' : 'DESC'}
            LIMIT $2 OFFSET $3
            `,
            [siteId, limit, offset]
        );

        const data = dataResult.rows.map(row => ({
            id: row.id,
            number: row.number,
            active: row.active,
            arm: row.arm_id
                ? {
                      id: row.arm_id,
                      name: row.arm_name,
                  }
                : null,
            createdAt: formatDateTime(row.created_at),
            stats: {
                eventCount: parseInt(row.event_count) || 0,
                procedureCount: parseInt(row.procedure_count) || 0,
            },
        }));

        const pagination = buildPaginationResponse(
            page,
            limit,
            total,
            `/api/v1/sites/${siteId}/subjects`,
            req.query
        );

        res.json({
            success: true,
            data,
            ...pagination,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:siteId/subjects/:subjectId/events', async (req, res, next) => {
    try {
        const { siteId, subjectId } = req.params;
        const validation = await validateSiteHierarchy(siteId, subjectId);
        if (!validation.valid) {
            return res
                .status(validation.status)
                .json({ success: false, error: validation.error });
        }

        const { page, limit, offset } = getPaginationParams(req.query);
        const { sort, order } = getSortParams(
            req.query,
            EVENT_SORT_FIELDS,
            'date',
            'desc'
        );

        const sortColumnMap = {
            id: 'se.id',
            date: 'se.date',
            status: 'se.status',
            created_at: 'se.created_at',
        };

        const countResult = await query(
            `SELECT COUNT(*) FROM study_events se WHERE se.study_subject_id = $1 AND se.deleted_at IS NULL`,
            [subjectId]
        );
        const total = parseInt(countResult.rows[0].count);

        const dataResult = await query(
            `
            SELECT
                se.id,
                se.identifier,
                se.display_name as name,
                se.date,
                se.status,
                sed.display_name as definition_name,
                COUNT(DISTINCT sp.id) as procedure_count,
                COUNT(DISTINCT a.id) as asset_count
            FROM study_events se
            LEFT JOIN study_event_definitions sed ON se.study_event_definition_id = sed.id
            LEFT JOIN study_procedures sp ON sp.study_event_id = se.id AND sp.deleted_at IS NULL
            LEFT JOIN assets a ON a.study_procedure_id = sp.id AND a.soft_deleted_at IS NULL
            WHERE se.study_subject_id = $1 AND se.deleted_at IS NULL
            GROUP BY se.id, sed.display_name
            ORDER BY ${sortColumnMap[sort] || 'se.date'} ${order === 'asc' ? 'ASC' : 'DESC'} NULLS LAST
            LIMIT $2 OFFSET $3
            `,
            [subjectId, limit, offset]
        );

        const data = dataResult.rows.map(row => ({
            id: row.id,
            identifier: row.identifier,
            name: row.name || row.definition_name,
            date: formatDate(row.date),
            status: row.status,
            stats: {
                procedureCount: parseInt(row.procedure_count) || 0,
                assetCount: parseInt(row.asset_count) || 0,
            },
        }));

        const pagination = buildPaginationResponse(
            page,
            limit,
            total,
            `/api/v1/sites/${siteId}/subjects/${subjectId}/events`,
            req.query
        );

        res.json({
            success: true,
            data,
            ...pagination,
        });
    } catch (error) {
        next(error);
    }
});

router.get(
    '/:siteId/subjects/:subjectId/events/:eventId/procedures',
    async (req, res, next) => {
        try {
            const { siteId, subjectId, eventId } = req.params;
            const validation = await validateSiteHierarchy(
                siteId,
                subjectId,
                eventId
            );
            if (!validation.valid) {
                return res
                    .status(validation.status)
                    .json({ success: false, error: validation.error });
            }

            const { page, limit, offset } = getPaginationParams(req.query);
            const { sort, order } = getSortParams(
                req.query,
                PROCEDURE_SORT_FIELDS,
                'date',
                'desc'
            );

            const sortColumnMap = {
                id: 'sp.id',
                date: 'sp.date',
                status: 'sp.status',
                created_at: 'sp.created_at',
            };

            const countResult = await query(
                `SELECT COUNT(*) FROM study_procedures sp WHERE sp.study_event_id = $1 AND sp.deleted_at IS NULL`,
                [eventId]
            );
            const total = parseInt(countResult.rows[0].count);

            const dataResult = await query(
                `
                SELECT
                    sp.id,
                    sp.identifier,
                    sp.display_name as name,
                    sp.date,
                    sp.status,
                    sp.locked,
                    spd.display_name as definition_name,
                    u.first_name as evaluator_first_name,
                    u.last_name as evaluator_last_name,
                    COUNT(DISTINCT a.id) as asset_count
                FROM study_procedures sp
                LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
                LEFT JOIN users u ON sp.evaluator_id = u.id
                LEFT JOIN assets a ON a.study_procedure_id = sp.id AND a.soft_deleted_at IS NULL
                WHERE sp.study_event_id = $1 AND sp.deleted_at IS NULL
                GROUP BY sp.id, spd.display_name, u.first_name, u.last_name
                ORDER BY ${sortColumnMap[sort] || 'sp.date'} ${order === 'asc' ? 'ASC' : 'DESC'} NULLS LAST
                LIMIT $2 OFFSET $3
                `,
                [eventId, limit, offset]
            );

            const data = dataResult.rows.map(row => ({
                id: row.id,
                identifier: row.identifier,
                name: row.name || row.definition_name,
                date: formatDate(row.date),
                status: row.status,
                locked: row.locked,
                evaluator:
                    row.evaluator_first_name || row.evaluator_last_name
                        ? {
                              name: [
                                  row.evaluator_first_name,
                                  row.evaluator_last_name,
                              ]
                                  .filter(Boolean)
                                  .join(' '),
                          }
                        : null,
                stats: {
                    assetCount: parseInt(row.asset_count) || 0,
                },
            }));

            const pagination = buildPaginationResponse(
                page,
                limit,
                total,
                `/api/v1/sites/${siteId}/subjects/${subjectId}/events/${eventId}/procedures`,
                req.query
            );

            res.json({
                success: true,
                data,
                ...pagination,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/:siteId/subjects/:subjectId/events/:eventId/procedures/:procedureId/assets',
    async (req, res, next) => {
        try {
            const { siteId, subjectId, eventId, procedureId } = req.params;
            const validation = await validateSiteHierarchy(
                siteId,
                subjectId,
                eventId,
                procedureId
            );
            if (!validation.valid) {
                return res
                    .status(validation.status)
                    .json({ success: false, error: validation.error });
            }

            const { page, limit, offset } = getPaginationParams(req.query);
            const { sort, order } = getSortParams(
                req.query,
                ASSET_SORT_FIELDS,
                'created_at',
                'desc'
            );

            const sortColumnMap = {
                id: 'a.id',
                filename: 'a.filename',
                filesize: 'a.filesize',
                created_at: 'a.created_at',
            };

            const countResult = await query(
                `SELECT COUNT(*) FROM assets a WHERE a.study_procedure_id = $1 AND a.soft_deleted_at IS NULL`,
                [procedureId]
            );
            const total = parseInt(countResult.rows[0].count);

            const dataResult = await query(
                `
                SELECT
                    a.id,
                    a.filename,
                    a.filesize,
                    a.processed,
                    a.created_at,
                    a.s3_url,
                    a.media_info,
                    ar.reviewed,
                    ar.review_date,
                    reviewer.first_name as reviewer_first_name,
                    reviewer.last_name as reviewer_last_name
                FROM assets a
                LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
                LEFT JOIN users reviewer ON ar.user_id = reviewer.id
                WHERE a.study_procedure_id = $1 AND a.soft_deleted_at IS NULL
                ORDER BY ${sortColumnMap[sort] || 'a.created_at'} ${order === 'asc' ? 'ASC' : 'DESC'}
                LIMIT $2 OFFSET $3
                `,
                [procedureId, limit, offset]
            );

            const data = dataResult.rows.map(row => {
                let duration = null;
                if (row.media_info && typeof row.media_info === 'object') {
                    const durationSeconds =
                        row.media_info.duration || row.media_info.Duration;
                    if (durationSeconds) {
                        duration = formatDuration(parseFloat(durationSeconds));
                    }
                }

                return {
                    id: row.id,
                    filename: row.filename,
                    filesize: parseInt(row.filesize) || 0,
                    filesizeFormatted: formatFileSize(parseInt(row.filesize)),
                    duration,
                    url: row.s3_url,
                    processed: row.processed || false,
                    createdAt: formatDateTime(row.created_at),
                    review: {
                        reviewed: row.reviewed || false,
                        reviewDate: formatDate(row.review_date),
                        reviewer:
                            row.reviewer_first_name || row.reviewer_last_name
                                ? [
                                      row.reviewer_first_name,
                                      row.reviewer_last_name,
                                  ]
                                      .filter(Boolean)
                                      .join(' ')
                                : null,
                    },
                };
            });

            const pagination = buildPaginationResponse(
                page,
                limit,
                total,
                `/api/v1/sites/${siteId}/subjects/${subjectId}/events/${eventId}/procedures/${procedureId}/assets`,
                req.query
            );

            res.json({
                success: true,
                data,
                ...pagination,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get('/:siteId/assets', async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const validation = await validateSiteHierarchy(siteId);
        if (!validation.valid) {
            return res
                .status(validation.status)
                .json({ success: false, error: validation.error });
        }

        const { page, limit, offset } = getPaginationParams(req.query);
        const { sort, order } = getSortParams(
            req.query,
            ASSET_SORT_FIELDS,
            'created_at',
            'desc'
        );

        const sortColumnMap = {
            id: 'a.id',
            filename: 'a.filename',
            filesize: 'a.filesize',
            created_at: 'a.created_at',
        };

        const countResult = await query(
            `SELECT COUNT(*) FROM assets a WHERE a.trial_container_id = $1 AND a.soft_deleted_at IS NULL`,
            [siteId]
        );
        const total = parseInt(countResult.rows[0].count);

        const dataResult = await query(
            `
            SELECT
                a.id,
                a.filename,
                a.filesize,
                a.processed,
                a.created_at,
                a.s3_url,
                a.media_info,
                sp.id as procedure_id,
                sp.display_name as procedure_name,
                spd.display_name as procedure_definition,
                se.display_name as event_name,
                ss.number as subject_number,
                ar.reviewed,
                ar.review_date
            FROM assets a
            LEFT JOIN study_procedures sp ON a.study_procedure_id = sp.id
            LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
            LEFT JOIN study_events se ON sp.study_event_id = se.id
            LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
            LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
            WHERE a.trial_container_id = $1 AND a.soft_deleted_at IS NULL
            ORDER BY ${sortColumnMap[sort] || 'a.created_at'} ${order === 'asc' ? 'ASC' : 'DESC'}
            LIMIT $2 OFFSET $3
            `,
            [siteId, limit, offset]
        );

        const data = dataResult.rows.map(row => {
            let duration = null;
            if (row.media_info && typeof row.media_info === 'object') {
                const durationSeconds =
                    row.media_info.duration || row.media_info.Duration;
                if (durationSeconds) {
                    duration = formatDuration(parseFloat(durationSeconds));
                }
            }

            return {
                id: row.id,
                filename: row.filename,
                filesize: parseInt(row.filesize) || 0,
                filesizeFormatted: formatFileSize(parseInt(row.filesize)),
                duration,
                url: row.s3_url,
                processed: row.processed || false,
                createdAt: formatDateTime(row.created_at),
                studyProcedure: row.procedure_id
                    ? {
                          id: row.procedure_id,
                          name: row.procedure_name || row.procedure_definition,
                          event: row.event_name,
                          subjectNumber: row.subject_number,
                      }
                    : null,
                review: {
                    reviewed: row.reviewed || false,
                    reviewDate: formatDate(row.review_date),
                },
            };
        });

        const pagination = buildPaginationResponse(
            page,
            limit,
            total,
            `/api/v1/sites/${siteId}/assets`,
            req.query
        );

        res.json({
            success: true,
            data,
            ...pagination,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
