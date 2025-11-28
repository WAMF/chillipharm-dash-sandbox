import { Router } from 'express';
import { query } from '../db.js';
import {
    getPaginationParams,
    buildPaginationResponse,
    getSortParams,
} from '../utils/pagination.js';
import { formatDateTime, formatDate } from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'date', 'status', 'created_at'];

router.get('/', async (req, res, next) => {
    try {
        const { page, limit, offset } = getPaginationParams(req.query);
        const { sort, order } = getSortParams(
            req.query,
            ALLOWED_SORT_FIELDS,
            'date',
            'desc'
        );

        const filters = ['sp.deleted_at IS NULL'];
        const params = [];
        let paramIndex = 1;

        if (req.query.trial_id) {
            filters.push(
                `sp.study_protocol_id IN (SELECT id FROM study_protocols WHERE account_id = $${paramIndex++})`
            );
            params.push(req.query.trial_id);
        }

        if (req.query.subject_id) {
            filters.push(`se.study_subject_id = $${paramIndex++}`);
            params.push(req.query.subject_id);
        }

        if (req.query.event_id) {
            filters.push(`sp.study_event_id = $${paramIndex++}`);
            params.push(req.query.event_id);
        }

        if (req.query.status !== undefined) {
            filters.push(`sp.status = $${paramIndex++}`);
            params.push(parseInt(req.query.status));
        }

        if (req.query.date_from) {
            filters.push(`sp.date >= $${paramIndex++}`);
            params.push(req.query.date_from);
        }

        if (req.query.date_to) {
            filters.push(`sp.date <= $${paramIndex++}`);
            params.push(req.query.date_to);
        }

        const whereClause = `WHERE ${filters.join(' AND ')}`;

        const countResult = await query(
            `
      SELECT COUNT(*) FROM study_procedures sp
      LEFT JOIN study_events se ON sp.study_event_id = se.id
      ${whereClause}
    `,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        const dataResult = await query(
            `
      SELECT 
        sp.id,
        sp.identifier,
        sp.display_name,
        sp.date,
        sp.status,
        sp.locked,
        sp.assets_count,
        sp.created_at,
        sp.updated_at,
        spd.display_name as definition_name,
        spd.identifier as definition_identifier,
        se.id as event_id,
        se.display_name as event_name,
        ss.id as subject_id,
        ss.number as subject_number,
        evaluator.first_name as evaluator_first_name,
        evaluator.last_name as evaluator_last_name
      FROM study_procedures sp
      LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
      LEFT JOIN study_events se ON sp.study_event_id = se.id
      LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
      LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
      ${whereClause}
      ORDER BY sp.${sort} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `,
            [...params, limit, offset]
        );

        const data = dataResult.rows.map(row => ({
            id: row.id,
            identifier: row.identifier,
            name: row.display_name || row.definition_name,
            date: formatDate(row.date),
            status: row.status,
            locked: row.locked,
            assetCount: row.assets_count || 0,
            definition: {
                name: row.definition_name,
                identifier: row.definition_identifier,
            },
            event: row.event_id
                ? {
                      id: row.event_id,
                      name: row.event_name,
                  }
                : null,
            subject: row.subject_id
                ? {
                      id: row.subject_id,
                      number: row.subject_number,
                  }
                : null,
            evaluator: row.evaluator_first_name
                ? {
                      name: [row.evaluator_first_name, row.evaluator_last_name]
                          .filter(Boolean)
                          .join(' '),
                  }
                : null,
            createdAt: formatDateTime(row.created_at),
            updatedAt: formatDateTime(row.updated_at),
        }));

        const pagination = buildPaginationResponse(
            page,
            limit,
            total,
            '/api/v1/procedures',
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
        sp.*,
        spd.display_name as definition_name,
        spd.identifier as definition_identifier,
        se.id as event_id,
        se.display_name as event_name,
        ss.id as subject_id,
        ss.number as subject_number,
        sa.display_name as arm_name,
        evaluator.first_name as evaluator_first_name,
        evaluator.last_name as evaluator_last_name,
        evaluator.email as evaluator_email
      FROM study_procedures sp
      LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
      LEFT JOIN study_events se ON sp.study_event_id = se.id
      LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
      LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
      LEFT JOIN users evaluator ON sp.evaluator_id = evaluator.id
      WHERE sp.id = $1 AND sp.deleted_at IS NULL
    `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Procedure not found',
            });
        }

        const row = result.rows[0];

        const assetsResult = await query(
            `
      SELECT id, filename, filesize, processed, created_at
      FROM assets
      WHERE study_procedure_id = $1 AND soft_deleted_at IS NULL
      ORDER BY created_at DESC
    `,
            [req.params.id]
        );

        res.json({
            success: true,
            data: {
                id: row.id,
                identifier: row.identifier,
                name: row.display_name || row.definition_name,
                date: formatDate(row.date),
                status: row.status,
                locked: row.locked,
                statusChangeDate: formatDateTime(row.status_change_date),
                definition: {
                    id: row.study_procedure_definition_id,
                    name: row.definition_name,
                    identifier: row.definition_identifier,
                },
                event: row.event_id
                    ? {
                          id: row.event_id,
                          name: row.event_name,
                      }
                    : null,
                subject: row.subject_id
                    ? {
                          id: row.subject_id,
                          number: row.subject_number,
                          arm: row.arm_name,
                      }
                    : null,
                evaluator: row.evaluator_first_name
                    ? {
                          name: [
                              row.evaluator_first_name,
                              row.evaluator_last_name,
                          ]
                              .filter(Boolean)
                              .join(' '),
                          email: row.evaluator_email,
                      }
                    : null,
                createdAt: formatDateTime(row.created_at),
                updatedAt: formatDateTime(row.updated_at),
                assets: assetsResult.rows.map(a => ({
                    id: a.id,
                    filename: a.filename,
                    filesize: parseInt(a.filesize) || 0,
                    processed: a.processed,
                    createdAt: formatDateTime(a.created_at),
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
