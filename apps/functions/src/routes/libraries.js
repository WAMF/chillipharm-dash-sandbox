import { Router } from 'express';
import { query } from '../db.js';
import {
    getPaginationParams,
    buildPaginationResponse,
    getSortParams,
} from '../utils/pagination.js';
import {
    formatDateTime,
    formatDate,
    formatDuration,
    formatFileSize,
} from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'name', 'created_at'];
const ASSET_SORT_FIELDS = ['id', 'filename', 'filesize', 'created_at'];

async function validateLibrary(libraryId) {
    const library = await query(
        `SELECT id FROM trial_containers WHERE id = $1 AND type != 'Site' AND deleted_at IS NULL`,
        [libraryId]
    );
    if (library.rows.length === 0) {
        return { valid: false, error: 'Library not found', status: 404 };
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

        const filters = ["tc.type != 'Site'", 'tc.deleted_at IS NULL'];
        const params = [];
        let paramIndex = 1;

        if (req.query.trial_id) {
            filters.push(`tc.account_id = $${paramIndex++}`);
            params.push(req.query.trial_id);
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
        tc.type,
        tc.account_id as trial_id,
        tc.created_at,
        tc.updated_at,
        a.trial_name,
        a.company_name,
        (SELECT COUNT(*) FROM assets WHERE trial_container_id = tc.id AND soft_deleted_at IS NULL) as asset_count
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
            type: row.type,
            trial: {
                id: row.trial_id,
                name: row.trial_name || row.company_name,
            },
            createdAt: formatDateTime(row.created_at),
            updatedAt: formatDateTime(row.updated_at),
            stats: {
                assetCount: parseInt(row.asset_count) || 0,
            },
        }));

        const pagination = buildPaginationResponse(
            page,
            limit,
            total,
            '/api/v1/libraries',
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
        (SELECT COUNT(*) FROM assets WHERE trial_container_id = tc.id AND soft_deleted_at IS NULL) as asset_count
      FROM trial_containers tc
      LEFT JOIN accounts a ON tc.account_id = a.id
      WHERE tc.id = $1 AND tc.type != 'Site' AND tc.deleted_at IS NULL
    `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Library not found',
            });
        }

        const row = result.rows[0];

        res.json({
            success: true,
            data: {
                id: row.id,
                name: row.name,
                type: row.type,
                trial: {
                    id: row.account_id,
                    name: row.trial_name || row.company_name,
                },
                createdAt: formatDateTime(row.created_at),
                updatedAt: formatDateTime(row.updated_at),
                stats: {
                    assetCount: parseInt(row.asset_count) || 0,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:libraryId/assets', async (req, res, next) => {
    try {
        const { libraryId } = req.params;
        const validation = await validateLibrary(libraryId);
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
            [libraryId]
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
                uploader.email as uploader_email,
                uploader.first_name as uploader_first_name,
                uploader.last_name as uploader_last_name,
                ar.reviewed,
                ar.review_date,
                reviewer.first_name as reviewer_first_name,
                reviewer.last_name as reviewer_last_name
            FROM assets a
            LEFT JOIN users uploader ON a.uploader_id = uploader.id
            LEFT JOIN asset_reviews ar ON ar.asset_id = a.id AND ar.deleted_at IS NULL
            LEFT JOIN users reviewer ON ar.user_id = reviewer.id
            WHERE a.trial_container_id = $1 AND a.soft_deleted_at IS NULL
            ORDER BY ${sortColumnMap[sort] || 'a.created_at'} ${order === 'asc' ? 'ASC' : 'DESC'}
            LIMIT $2 OFFSET $3
            `,
            [libraryId, limit, offset]
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
                uploader:
                    row.uploader_email || row.uploader_first_name
                        ? {
                              email: row.uploader_email,
                              name:
                                  [
                                      row.uploader_first_name,
                                      row.uploader_last_name,
                                  ]
                                      .filter(Boolean)
                                      .join(' ') || null,
                          }
                        : null,
                review: {
                    reviewed: row.reviewed || false,
                    reviewDate: formatDate(row.review_date),
                    reviewer:
                        row.reviewer_first_name || row.reviewer_last_name
                            ? [row.reviewer_first_name, row.reviewer_last_name]
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
            `/api/v1/libraries/${libraryId}/assets`,
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
