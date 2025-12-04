import { Router } from 'express';
import { query } from '../db.js';
import {
    getPaginationParams,
    buildPaginationResponse,
    getSortParams,
} from '../utils/pagination.js';
import {
    getCountryName,
    formatDuration,
    formatFileSize,
    formatDate,
    formatDateTime,
} from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = [
    'id',
    'filename',
    'filesize',
    'created_at',
    'processed',
];

const SORT_COLUMN_MAP = {
    id: 'a.id',
    filename: 'a.filename',
    filesize: 'a.filesize',
    created_at: 'a.created_at',
    processed: 'a.processed',
};

router.get('/', async (req, res, next) => {
    try {
        const { page, limit, offset } = getPaginationParams(req.query);
        const { sort, order } = getSortParams(
            req.query,
            ALLOWED_SORT_FIELDS,
            'created_at',
            'desc'
        );

        const filters = [];
        const params = [];
        let paramIndex = 1;

        filters.push('a.soft_deleted_at IS NULL');

        if (req.query.trial_id) {
            filters.push(`a.account_id = $${paramIndex++}`);
            params.push(req.query.trial_id);
        }

        if (req.query.site_id) {
            filters.push(`a.trial_container_id = $${paramIndex++}`);
            params.push(req.query.site_id);
        }

        if (req.query.processed === 'true') {
            filters.push('a.processed = true');
        } else if (req.query.processed === 'false') {
            filters.push('(a.processed = false OR a.processed IS NULL)');
        }

        if (req.query.date_from) {
            filters.push(`a.created_at >= $${paramIndex++}`);
            params.push(req.query.date_from);
        }

        if (req.query.date_to) {
            filters.push(`a.created_at <= $${paramIndex++}`);
            params.push(req.query.date_to);
        }

        if (req.query.search) {
            filters.push(`a.filename ILIKE $${paramIndex++}`);
            params.push(`%${req.query.search}%`);
        }

        filters.push("tc.type = 'Site' AND tc.id IS NOT NULL");

        const whereClause =
            filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

        const countQuery = `
      SELECT COUNT(*)
      FROM assets a
      LEFT JOIN trial_containers tc ON a.trial_container_id = tc.id
      ${whereClause}
    `;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
      SELECT
        a.id,
        a.filename,
        a.filesize,
        a.created_at,
        a.processed,
        a.media_info,
        a.s3_url,
        a.account_id as trial_id,
        acc.trial_name,
        acc.company_name,
        tc.id as container_id,
        tc.name as container_name,
        tc.type as container_type,
        tc.country_code,
        uploader.email as uploader_email,
        uploader.first_name as uploader_first_name,
        uploader.last_name as uploader_last_name,
        sp.id as study_procedure_id,
        sp.date as study_procedure_date,
        spd.display_name as study_procedure,
        se.display_name as study_event,
        sa.display_name as study_arm,
        ss.number as subject_number,
        evaluator.first_name as evaluator_first_name,
        evaluator.last_name as evaluator_last_name,
        ar.reviewed,
        ar.review_date,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name,
        (
          SELECT string_agg(c.comment, ' | ')
          FROM comments c
          WHERE c.asset_id = a.id AND c.deleted_at IS NULL
        ) as comments
      FROM assets a
      LEFT JOIN accounts acc ON a.account_id = acc.id
      LEFT JOIN trial_containers tc ON a.trial_container_id = tc.id
      LEFT JOIN users uploader ON a.uploader_id = uploader.id
      LEFT JOIN study_procedures sp ON a.study_procedure_id = sp.id
      LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
      LEFT JOIN study_events se ON sp.study_event_id = se.id
      LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
      LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
      LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
      LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
      LEFT JOIN users reviewer ON ar.user_id = reviewer.id
      ${whereClause}
      ORDER BY ${SORT_COLUMN_MAP[sort] || 'a.created_at'} ${order === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

        const dataResult = await query(dataQuery, [...params, limit, offset]);

        const data = dataResult.rows.map(row => {
            let duration = null;
            if (row.media_info && typeof row.media_info === 'object') {
                const durationSeconds =
                    row.media_info.duration || row.media_info.Duration;
                if (durationSeconds) {
                    duration = formatDuration(parseFloat(durationSeconds));
                }
            }

            const isSite = row.container_type === 'Site';

            return {
                id: row.id,
                filename: row.filename,
                filesize: parseInt(row.filesize) || 0,
                filesizeFormatted: formatFileSize(parseInt(row.filesize)),
                duration,
                url: row.s3_url,
                processed: row.processed || false,
                createdAt: formatDateTime(row.created_at),
                trial: {
                    id: row.trial_id,
                    name: row.trial_name || row.company_name,
                },
                site:
                    row.container_id && isSite
                        ? {
                              id: row.container_id,
                              name: row.container_name,
                              country: getCountryName(row.country_code),
                              countryCode: row.country_code,
                          }
                        : null,
                library:
                    row.container_id && !isSite
                        ? {
                              id: row.container_id,
                              name: row.container_name,
                          }
                        : null,
                uploader: row.uploader_email
                    ? {
                          email: row.uploader_email,
                          name:
                              [row.uploader_first_name, row.uploader_last_name]
                                  .filter(Boolean)
                                  .join(' ') || null,
                      }
                    : null,
                studyProcedure: row.study_procedure_id
                    ? {
                          id: row.study_procedure_id,
                          name: row.study_procedure,
                          date: formatDate(row.study_procedure_date),
                          event: row.study_event,
                          arm: row.study_arm,
                          subjectNumber: row.subject_number,
                          evaluator:
                              [
                                  row.evaluator_first_name,
                                  row.evaluator_last_name,
                              ]
                                  .filter(Boolean)
                                  .join(' ') || null,
                      }
                    : null,
                review: {
                    reviewed: row.reviewed || false,
                    reviewDate: formatDate(row.review_date),
                    reviewer:
                        [row.reviewer_first_name, row.reviewer_last_name]
                            .filter(Boolean)
                            .join(' ') || null,
                },
                comments: row.comments || null,
            };
        });

        const pagination = buildPaginationResponse(
            page,
            limit,
            total,
            '/api/v1/assets',
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

const QUERY_SORT_MAP = {
    uploadDate: 'a.created_at',
    filename: 'a.filename',
    filesize: 'a.filesize',
    trialName: 'acc.trial_name',
    siteName: 'tc.name',
    siteCountry: 'tc.country_code',
    subjectNumber: 'ss.number',
    studyArm: 'sa.display_name',
    studyEvent: 'se.display_name',
    studyProcedure: 'spd.display_name',
    studyProcedureDate: 'sp.date',
    reviewed: 'ar.reviewed',
};

router.post('/query', async (req, res, next) => {
    try {
        const {
            trials = [],
            sites = [],
            libraries = [],
            countries = [],
            studyArms = [],
            procedures = [],
            dateRange = {},
            reviewStatus = 'all',
            processedStatus = 'all',
            searchTerm = '',
            sortBy = 'uploadDate',
            sortOrder = 'desc',
            page = 1,
            limit = 1000,
            dataViewMode = 'all',
        } = req.body;

        if (dataViewMode === 'sites' && libraries.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot filter by libraries when dataViewMode is "sites"',
            });
        }

        const safeLimit = Math.min(Math.max(1, limit), 5000);
        const safePage = Math.max(1, page);
        const offset = (safePage - 1) * safeLimit;

        const filters = ['a.soft_deleted_at IS NULL'];
        const params = [];
        let paramIndex = 1;

        if (trials.length > 0) {
            filters.push(
                `(acc.trial_name = ANY($${paramIndex}) OR acc.company_name = ANY($${paramIndex}))`
            );
            params.push(trials);
            paramIndex++;
        }

        if (sites.length > 0) {
            filters.push(`tc.name = ANY($${paramIndex++})`);
            params.push(sites);
        }

        if (countries.length > 0) {
            const countryCodes = countries.map(c => {
                const entry = Object.entries({
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
                    CZ: 'Czech Republic',
                    DK: 'Denmark',
                    EG: 'Egypt',
                    EE: 'Estonia',
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
                    LV: 'Latvia',
                    LT: 'Lithuania',
                    MY: 'Malaysia',
                    MX: 'Mexico',
                    NL: 'Netherlands',
                    NZ: 'New Zealand',
                    NO: 'Norway',
                    PK: 'Pakistan',
                    PE: 'Peru',
                    PH: 'Philippines',
                    PL: 'Poland',
                    PT: 'Portugal',
                    RO: 'Romania',
                    RU: 'Russia',
                    SA: 'Saudi Arabia',
                    SG: 'Singapore',
                    SK: 'Slovakia',
                    SI: 'Slovenia',
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
                }).find(([, name]) => name === c);
                return entry ? entry[0] : c;
            });
            filters.push(`tc.country_code = ANY($${paramIndex++})`);
            params.push(countryCodes);
        }

        if (studyArms.length > 0) {
            filters.push(`sa.display_name = ANY($${paramIndex++})`);
            params.push(studyArms);
        }

        if (procedures.length > 0) {
            filters.push(`spd.display_name = ANY($${paramIndex++})`);
            params.push(procedures);
        }

        if (dateRange.start) {
            filters.push(`a.created_at >= $${paramIndex++}`);
            params.push(dateRange.start);
        }

        if (dateRange.end) {
            filters.push(
                `a.created_at <= $${paramIndex++}::date + interval '1 day' - interval '1 second'`
            );
            params.push(dateRange.end);
        }

        if (reviewStatus === 'reviewed') {
            filters.push('ar.reviewed = true');
        } else if (reviewStatus === 'pending') {
            filters.push('(ar.reviewed IS NULL OR ar.reviewed = false)');
        }

        if (processedStatus === 'yes') {
            filters.push('a.processed = true');
        } else if (processedStatus === 'no') {
            filters.push('(a.processed = false OR a.processed IS NULL)');
        }

        if (searchTerm) {
            filters.push(`(
        a.filename ILIKE $${paramIndex} OR
        ss.number ILIKE $${paramIndex} OR
        acc.trial_name ILIKE $${paramIndex} OR
        tc.name ILIKE $${paramIndex}
      )`);
            params.push(`%${searchTerm}%`);
            paramIndex++;
        }

        if (dataViewMode === 'sites') {
            filters.push("tc.type = 'Site' AND tc.id IS NOT NULL");
        } else if (dataViewMode === 'library') {
            filters.push("(tc.id IS NULL OR tc.type != 'Site')");
        }

        if (libraries.length > 0) {
            if (dataViewMode === 'library') {
                filters.push(`tc.name = ANY($${paramIndex++})`);
            } else {
                filters.push(`(tc.type != 'Site' AND tc.name = ANY($${paramIndex++}))`);
            }
            params.push(libraries);
        }

        const whereClause = `WHERE ${filters.join(' AND ')}`;

        const sortColumn = QUERY_SORT_MAP[sortBy] || 'a.created_at';
        const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

        const countQuery = `
      SELECT COUNT(DISTINCT a.id)
      FROM assets a
      LEFT JOIN accounts acc ON a.account_id = acc.id
      LEFT JOIN trial_containers tc ON a.trial_container_id = tc.id
      LEFT JOIN study_procedures sp ON a.study_procedure_id = sp.id
      LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
      LEFT JOIN study_events se ON sp.study_event_id = se.id
      LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
      LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
      LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
      ${whereClause}
    `;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        const dataQuery = `
      SELECT
        a.id,
        a.filename,
        a.filesize,
        a.created_at,
        a.processed,
        a.media_info,
        a.s3_url,
        a.account_id as trial_id,
        acc.trial_name,
        acc.company_name,
        tc.id as container_id,
        tc.name as container_name,
        tc.type as container_type,
        tc.country_code,
        uploader.email as uploader_email,
        uploader.first_name as uploader_first_name,
        uploader.last_name as uploader_last_name,
        sp.id as study_procedure_id,
        sp.date as study_procedure_date,
        spd.display_name as study_procedure,
        se.display_name as study_event,
        sa.display_name as study_arm,
        ss.number as subject_number,
        evaluator.first_name as evaluator_first_name,
        evaluator.last_name as evaluator_last_name,
        ar.reviewed,
        ar.review_date,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name,
        (
          SELECT string_agg(c.comment, ' | ')
          FROM comments c
          WHERE c.asset_id = a.id AND c.deleted_at IS NULL
        ) as comments
      FROM assets a
      LEFT JOIN accounts acc ON a.account_id = acc.id
      LEFT JOIN trial_containers tc ON a.trial_container_id = tc.id
      LEFT JOIN users uploader ON a.uploader_id = uploader.id
      LEFT JOIN study_procedures sp ON a.study_procedure_id = sp.id
      LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
      LEFT JOIN study_events se ON sp.study_event_id = se.id
      LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
      LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
      LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
      LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
      LEFT JOIN users reviewer ON ar.user_id = reviewer.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection} NULLS LAST
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

        const dataResult = await query(dataQuery, [
            ...params,
            safeLimit,
            offset,
        ]);

        const data = dataResult.rows.map(row => {
            let duration = null;
            if (row.media_info && typeof row.media_info === 'object') {
                const durationSeconds =
                    row.media_info.duration || row.media_info.Duration;
                if (durationSeconds) {
                    duration = formatDuration(parseFloat(durationSeconds));
                }
            }

            const isSite = row.container_type === 'Site';

            return {
                id: row.id,
                filename: row.filename,
                filesize: parseInt(row.filesize) || 0,
                filesizeFormatted: formatFileSize(parseInt(row.filesize)),
                duration,
                url: row.s3_url,
                processed: row.processed || false,
                createdAt: formatDateTime(row.created_at),
                trial: {
                    id: row.trial_id,
                    name: row.trial_name || row.company_name,
                },
                site:
                    row.container_id && isSite
                        ? {
                              id: row.container_id,
                              name: row.container_name,
                              country: getCountryName(row.country_code),
                              countryCode: row.country_code,
                          }
                        : null,
                library:
                    row.container_id && !isSite
                        ? {
                              id: row.container_id,
                              name: row.container_name,
                          }
                        : null,
                uploader: row.uploader_email
                    ? {
                          email: row.uploader_email,
                          name:
                              [row.uploader_first_name, row.uploader_last_name]
                                  .filter(Boolean)
                                  .join(' ') || null,
                      }
                    : null,
                studyProcedure: row.study_procedure_id
                    ? {
                          id: row.study_procedure_id,
                          name: row.study_procedure,
                          date: formatDate(row.study_procedure_date),
                          event: row.study_event,
                          arm: row.study_arm,
                          subjectNumber: row.subject_number,
                          evaluator:
                              [
                                  row.evaluator_first_name,
                                  row.evaluator_last_name,
                              ]
                                  .filter(Boolean)
                                  .join(' ') || null,
                      }
                    : null,
                review: {
                    reviewed: row.reviewed || false,
                    reviewDate: formatDate(row.review_date),
                    reviewer:
                        [row.reviewer_first_name, row.reviewer_last_name]
                            .filter(Boolean)
                            .join(' ') || null,
                },
                comments: row.comments || null,
            };
        });

        const totalPages = Math.ceil(total / safeLimit);
        const baseUrl = '/api/v1/assets/query';

        res.json({
            success: true,
            data,
            meta: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages,
            },
            links: {
                self: baseUrl,
                first: baseUrl,
                last: baseUrl,
                prev: safePage > 1 ? baseUrl : null,
                next: safePage < totalPages ? baseUrl : null,
            },
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
        a.*,
        acc.trial_name,
        acc.company_name,
        tc.id as site_id,
        tc.name as site_name,
        tc.country_code,
        uploader.email as uploader_email,
        uploader.first_name as uploader_first_name,
        uploader.last_name as uploader_last_name,
        sp.id as study_procedure_id,
        sp.date as study_procedure_date,
        spd.display_name as study_procedure,
        se.display_name as study_event,
        sa.display_name as study_arm,
        ss.number as subject_number,
        evaluator.first_name as evaluator_first_name,
        evaluator.last_name as evaluator_last_name,
        ar.reviewed,
        ar.review_date,
        reviewer.first_name as reviewer_first_name,
        reviewer.last_name as reviewer_last_name
      FROM assets a
      LEFT JOIN accounts acc ON a.account_id = acc.id
      LEFT JOIN trial_containers tc ON a.trial_container_id = tc.id AND tc.type = 'Site'
      LEFT JOIN users uploader ON a.uploader_id = uploader.id
      LEFT JOIN study_procedures sp ON a.study_procedure_id = sp.id
      LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
      LEFT JOIN study_events se ON sp.study_event_id = se.id
      LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
      LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
      LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
      LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
      LEFT JOIN users reviewer ON ar.user_id = reviewer.id
      WHERE a.id = $1 AND a.soft_deleted_at IS NULL
    `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Asset not found',
            });
        }

        const row = result.rows[0];

        const commentsResult = await query(
            `
      SELECT c.id, c.comment, c.created_at,
             u.first_name, u.last_name, u.email
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.asset_id = $1 AND c.deleted_at IS NULL
      ORDER BY c.created_at ASC
    `,
            [req.params.id]
        );

        let duration = null;
        if (row.media_info && typeof row.media_info === 'object') {
            const durationSeconds =
                row.media_info.duration || row.media_info.Duration;
            if (durationSeconds) {
                duration = formatDuration(parseFloat(durationSeconds));
            }
        }

        res.json({
            success: true,
            data: {
                id: row.id,
                filename: row.filename,
                filesize: parseInt(row.filesize) || 0,
                filesizeFormatted: formatFileSize(parseInt(row.filesize)),
                duration,
                mediaInfo: row.media_info,
                url: row.s3_url,
                processed: row.processed || false,
                createdAt: formatDateTime(row.created_at),
                updatedAt: formatDateTime(row.updated_at),
                trial: {
                    id: row.account_id,
                    name: row.trial_name || row.company_name,
                },
                site: row.site_id
                    ? {
                          id: row.site_id,
                          name: row.site_name,
                          country: getCountryName(row.country_code),
                          countryCode: row.country_code,
                      }
                    : null,
                uploader: row.uploader_email
                    ? {
                          email: row.uploader_email,
                          name:
                              [row.uploader_first_name, row.uploader_last_name]
                                  .filter(Boolean)
                                  .join(' ') || null,
                      }
                    : null,
                studyProcedure: row.study_procedure_id
                    ? {
                          id: row.study_procedure_id,
                          name: row.study_procedure,
                          date: formatDate(row.study_procedure_date),
                          event: row.study_event,
                          arm: row.study_arm,
                          subjectNumber: row.subject_number,
                          evaluator:
                              [
                                  row.evaluator_first_name,
                                  row.evaluator_last_name,
                              ]
                                  .filter(Boolean)
                                  .join(' ') || null,
                      }
                    : null,
                review: {
                    reviewed: row.reviewed || false,
                    reviewDate: formatDate(row.review_date),
                    reviewer:
                        [row.reviewer_first_name, row.reviewer_last_name]
                            .filter(Boolean)
                            .join(' ') || null,
                },
                comments: commentsResult.rows.map(c => ({
                    id: c.id,
                    comment: c.comment,
                    createdAt: formatDateTime(c.created_at),
                    author: {
                        name:
                            [c.first_name, c.last_name]
                                .filter(Boolean)
                                .join(' ') || null,
                        email: c.email,
                    },
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
