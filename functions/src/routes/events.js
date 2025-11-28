import { Router } from 'express';
import { query } from '../db.js';
import { getPaginationParams, buildPaginationResponse, getSortParams } from '../utils/pagination.js';
import { formatDateTime, formatDate } from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'date', 'status', 'created_at'];

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { sort, order } = getSortParams(req.query, ALLOWED_SORT_FIELDS, 'date', 'desc');
    
    const filters = ['se.deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;
    
    if (req.query.subject_id) {
      filters.push(`se.study_subject_id = $${paramIndex++}`);
      params.push(req.query.subject_id);
    }
    
    if (req.query.site_id) {
      filters.push(`se.site_id = $${paramIndex++}`);
      params.push(req.query.site_id);
    }
    
    if (req.query.status !== undefined) {
      filters.push(`se.status = $${paramIndex++}`);
      params.push(parseInt(req.query.status));
    }
    
    if (req.query.date_from) {
      filters.push(`se.date >= $${paramIndex++}`);
      params.push(req.query.date_from);
    }
    
    if (req.query.date_to) {
      filters.push(`se.date <= $${paramIndex++}`);
      params.push(req.query.date_to);
    }
    
    const whereClause = `WHERE ${filters.join(' AND ')}`;
    
    const countResult = await query(`SELECT COUNT(*) FROM study_events se ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await query(`
      SELECT 
        se.id,
        se.identifier,
        se.display_name,
        se.date,
        se.status,
        se.study_event_type,
        se.position,
        se.created_at,
        se.updated_at,
        sed.display_name as definition_name,
        ss.id as subject_id,
        ss.number as subject_number,
        tc.id as site_id,
        tc.name as site_name,
        (SELECT COUNT(*) FROM study_procedures WHERE study_event_id = se.id AND deleted_at IS NULL) as procedure_count
      FROM study_events se
      LEFT JOIN study_event_definitions sed ON se.study_event_definition_id = sed.id
      LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
      LEFT JOIN trial_containers tc ON se.site_id = tc.id
      ${whereClause}
      ORDER BY se.${sort} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset]);
    
    const data = dataResult.rows.map(row => ({
      id: row.id,
      identifier: row.identifier,
      name: row.display_name || row.definition_name,
      date: formatDate(row.date),
      status: row.status,
      type: row.study_event_type,
      position: row.position,
      subject: row.subject_id ? {
        id: row.subject_id,
        number: row.subject_number
      } : null,
      site: row.site_id ? {
        id: row.site_id,
        name: row.site_name
      } : null,
      procedureCount: parseInt(row.procedure_count) || 0,
      createdAt: formatDateTime(row.created_at),
      updatedAt: formatDateTime(row.updated_at)
    }));
    
    const pagination = buildPaginationResponse(page, limit, total, '/api/v1/events', req.query);
    
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
        se.*,
        sed.display_name as definition_name,
        sed.identifier as definition_identifier,
        ss.id as subject_id,
        ss.number as subject_number,
        tc.id as site_id,
        tc.name as site_name,
        tc.country_code
      FROM study_events se
      LEFT JOIN study_event_definitions sed ON se.study_event_definition_id = sed.id
      LEFT JOIN study_subjects ss ON se.study_subject_id = ss.id
      LEFT JOIN trial_containers tc ON se.site_id = tc.id
      WHERE se.id = $1 AND se.deleted_at IS NULL
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    const row = result.rows[0];
    
    const proceduresResult = await query(`
      SELECT 
        sp.id,
        sp.display_name,
        sp.date,
        sp.status,
        spd.display_name as definition_name
      FROM study_procedures sp
      LEFT JOIN study_procedure_definitions spd ON sp.study_procedure_definition_id = spd.id
      WHERE sp.study_event_id = $1 AND sp.deleted_at IS NULL
      ORDER BY sp.date DESC
    `, [req.params.id]);
    
    res.json({
      success: true,
      data: {
        id: row.id,
        identifier: row.identifier,
        name: row.display_name || row.definition_name,
        date: formatDate(row.date),
        status: row.status,
        type: row.study_event_type,
        position: row.position,
        definition: {
          id: row.study_event_definition_id,
          name: row.definition_name,
          identifier: row.definition_identifier
        },
        subject: row.subject_id ? {
          id: row.subject_id,
          number: row.subject_number
        } : null,
        site: row.site_id ? {
          id: row.site_id,
          name: row.site_name,
          countryCode: row.country_code
        } : null,
        createdAt: formatDateTime(row.created_at),
        updatedAt: formatDateTime(row.updated_at),
        procedures: proceduresResult.rows.map(p => ({
          id: p.id,
          name: p.display_name || p.definition_name,
          date: formatDate(p.date),
          status: p.status
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
