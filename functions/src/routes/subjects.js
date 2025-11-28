import { Router } from 'express';
import { query } from '../db.js';
import { getPaginationParams, buildPaginationResponse, getSortParams } from '../utils/pagination.js';
import { formatDateTime } from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'number', 'created_at'];

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { sort, order } = getSortParams(req.query, ALLOWED_SORT_FIELDS, 'number', 'asc');
    
    const filters = [];
    const params = [];
    let paramIndex = 1;
    
    if (req.query.trial_id) {
      filters.push(`ss.account_id = $${paramIndex++}`);
      params.push(req.query.trial_id);
    }
    
    if (req.query.site_id) {
      filters.push(`ss.site_id = $${paramIndex++}`);
      params.push(req.query.site_id);
    }
    
    if (req.query.arm_id) {
      filters.push(`ss.study_arm_id = $${paramIndex++}`);
      params.push(req.query.arm_id);
    }
    
    if (req.query.active !== undefined) {
      filters.push(`ss.active = $${paramIndex++}`);
      params.push(req.query.active === 'true');
    }
    
    if (req.query.search) {
      filters.push(`ss.number ILIKE $${paramIndex++}`);
      params.push(`%${req.query.search}%`);
    }
    
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    
    const countResult = await query(`SELECT COUNT(*) FROM study_subjects ss ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await query(`
      SELECT 
        ss.id,
        ss.number,
        ss.active,
        ss.account_id as trial_id,
        ss.site_id,
        ss.study_arm_id,
        ss.created_at,
        ss.updated_at,
        a.trial_name,
        a.company_name,
        tc.name as site_name,
        sa.display_name as arm_name,
        (SELECT COUNT(*) FROM study_events WHERE study_subject_id = ss.id AND deleted_at IS NULL) as event_count,
        (SELECT COUNT(*) FROM study_procedures sp 
         JOIN study_events se ON sp.study_event_id = se.id 
         WHERE se.study_subject_id = ss.id AND sp.deleted_at IS NULL) as procedure_count
      FROM study_subjects ss
      LEFT JOIN accounts a ON ss.account_id = a.id
      LEFT JOIN trial_containers tc ON ss.site_id = tc.id
      LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
      ${whereClause}
      ORDER BY ss.${sort} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset]);
    
    const data = dataResult.rows.map(row => ({
      id: row.id,
      number: row.number,
      active: row.active,
      trial: {
        id: row.trial_id,
        name: row.trial_name || row.company_name
      },
      site: row.site_id ? {
        id: row.site_id,
        name: row.site_name
      } : null,
      arm: row.study_arm_id ? {
        id: row.study_arm_id,
        name: row.arm_name
      } : null,
      createdAt: formatDateTime(row.created_at),
      updatedAt: formatDateTime(row.updated_at),
      stats: {
        eventCount: parseInt(row.event_count) || 0,
        procedureCount: parseInt(row.procedure_count) || 0
      }
    }));
    
    const pagination = buildPaginationResponse(page, limit, total, '/api/v1/subjects', req.query);
    
    res.json({
      success: true,
      data,
      ...pagination
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        ss.*,
        a.trial_name,
        a.company_name,
        tc.name as site_name,
        tc.country_code,
        sa.display_name as arm_name
      FROM study_subjects ss
      LEFT JOIN accounts a ON ss.account_id = a.id
      LEFT JOIN trial_containers tc ON ss.site_id = tc.id
      LEFT JOIN study_arms sa ON ss.study_arm_id = sa.id
      WHERE ss.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }
    
    const row = result.rows[0];
    
    const eventsResult = await query(`
      SELECT 
        se.id,
        se.display_name,
        se.date,
        se.status,
        sed.display_name as definition_name
      FROM study_events se
      LEFT JOIN study_event_definitions sed ON se.study_event_definition_id = sed.id
      WHERE se.study_subject_id = $1 AND se.deleted_at IS NULL
      ORDER BY se.date DESC
    `, [req.params.id]);
    
    res.json({
      success: true,
      data: {
        id: row.id,
        number: row.number,
        active: row.active,
        trial: {
          id: row.account_id,
          name: row.trial_name || row.company_name
        },
        site: row.site_id ? {
          id: row.site_id,
          name: row.site_name,
          countryCode: row.country_code
        } : null,
        arm: row.study_arm_id ? {
          id: row.study_arm_id,
          name: row.arm_name
        } : null,
        createdAt: formatDateTime(row.created_at),
        updatedAt: formatDateTime(row.updated_at),
        events: eventsResult.rows.map(e => ({
          id: e.id,
          name: e.display_name || e.definition_name,
          date: e.date,
          status: e.status
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
