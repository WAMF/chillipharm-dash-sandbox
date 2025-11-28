import { Router } from 'express';
import { query } from '../db.js';
import {
    getPaginationParams,
    buildPaginationResponse,
    getSortParams,
} from '../utils/pagination.js';
import { formatDateTime } from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'created_at'];

router.get('/', async (req, res, next) => {
    try {
        const { page, limit, offset } = getPaginationParams(req.query);
        const { sort, order } = getSortParams(
            req.query,
            ALLOWED_SORT_FIELDS,
            'created_at',
            'desc'
        );

        const filters = ['c.deleted_at IS NULL'];
        const params = [];
        let paramIndex = 1;

        if (req.query.asset_id) {
            filters.push(`c.asset_id = $${paramIndex++}`);
            params.push(req.query.asset_id);
        }

        if (req.query.author_id) {
            filters.push(`c.author_id = $${paramIndex++}`);
            params.push(req.query.author_id);
        }

        if (req.query.search) {
            filters.push(`c.comment ILIKE $${paramIndex++}`);
            params.push(`%${req.query.search}%`);
        }

        const whereClause = `WHERE ${filters.join(' AND ')}`;

        const countResult = await query(
            `SELECT COUNT(*) FROM comments c ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        const dataResult = await query(
            `
      SELECT 
        c.id,
        c.comment,
        c.asset_id,
        c.author_id,
        c.created_at,
        c.updated_at,
        a.filename as asset_filename,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.email as author_email
      FROM comments c
      LEFT JOIN assets a ON c.asset_id = a.id
      LEFT JOIN users u ON c.author_id = u.id
      ${whereClause}
      ORDER BY c.${sort} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `,
            [...params, limit, offset]
        );

        const data = dataResult.rows.map(row => ({
            id: row.id,
            comment: row.comment,
            asset: {
                id: row.asset_id,
                filename: row.asset_filename,
            },
            author: row.author_id
                ? {
                      id: row.author_id,
                      name:
                          [row.author_first_name, row.author_last_name]
                              .filter(Boolean)
                              .join(' ') || null,
                      email: row.author_email,
                  }
                : null,
            createdAt: formatDateTime(row.created_at),
            updatedAt: formatDateTime(row.updated_at),
        }));

        const pagination = buildPaginationResponse(
            page,
            limit,
            total,
            '/api/v1/comments',
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
        c.*,
        a.filename as asset_filename,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.email as author_email
      FROM comments c
      LEFT JOIN assets a ON c.asset_id = a.id
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = $1 AND c.deleted_at IS NULL
    `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found',
            });
        }

        const row = result.rows[0];

        res.json({
            success: true,
            data: {
                id: row.id,
                comment: row.comment,
                asset: {
                    id: row.asset_id,
                    filename: row.asset_filename,
                },
                author: row.author_id
                    ? {
                          id: row.author_id,
                          name:
                              [row.author_first_name, row.author_last_name]
                                  .filter(Boolean)
                                  .join(' ') || null,
                          email: row.author_email,
                      }
                    : null,
                createdAt: formatDateTime(row.created_at),
                updatedAt: formatDateTime(row.updated_at),
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
