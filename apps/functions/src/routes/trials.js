import { Router } from 'express';
import { query } from '../db.js';
import { getPaginationParams, buildPaginationResponse, getSortParams } from '../utils/pagination.js';
import { formatDateTime } from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'trial_name', 'company_name', 'created_at'];

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { sort, order } = getSortParams(req.query, ALLOWED_SORT_FIELDS, 'trial_name', 'asc');
    
    const filters = ['deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;
    
    if (req.query.search) {
      filters.push(`(trial_name ILIKE $${paramIndex} OR company_name ILIKE $${paramIndex})`);
      params.push(`%${req.query.search}%`);
      paramIndex++;
    }
    
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    
    const countResult = await query(`SELECT COUNT(*) FROM accounts ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await query(`
      SELECT 
        a.id,
        a.trial_name,
        a.company_name,
        a.subdomain,
        a.activated,
        a.suspended,
        a.created_at,
        a.updated_at,
        (SELECT COUNT(*) FROM assets WHERE account_id = a.id AND soft_deleted_at IS NULL) as asset_count,
        (SELECT COUNT(*) FROM trial_containers WHERE account_id = a.id AND type = 'Site' AND deleted_at IS NULL) as site_count,
        (SELECT COUNT(*) FROM study_subjects WHERE account_id = a.id) as subject_count
      FROM accounts a
      ${whereClause}
      ORDER BY a.${sort} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset]);
    
    const data = dataResult.rows.map(row => ({
      id: row.id,
      name: row.trial_name || row.company_name,
      trialName: row.trial_name,
      companyName: row.company_name,
      subdomain: row.subdomain,
      activated: row.activated,
      suspended: row.suspended,
      createdAt: formatDateTime(row.created_at),
      updatedAt: formatDateTime(row.updated_at),
      stats: {
        assetCount: parseInt(row.asset_count) || 0,
        siteCount: parseInt(row.site_count) || 0,
        subjectCount: parseInt(row.subject_count) || 0
      }
    }));
    
    const pagination = buildPaginationResponse(page, limit, total, '/api/v1/trials', req.query);
    
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
        a.*,
        (SELECT COUNT(*) FROM assets WHERE account_id = a.id AND soft_deleted_at IS NULL) as asset_count,
        (SELECT COUNT(*) FROM trial_containers WHERE account_id = a.id AND type = 'Site' AND deleted_at IS NULL) as site_count,
        (SELECT COUNT(*) FROM study_subjects WHERE account_id = a.id) as subject_count,
        (SELECT COUNT(*) FROM study_procedures sp 
         JOIN study_subjects ss ON sp.study_subject_id = ss.id 
         WHERE ss.account_id = a.id AND sp.deleted_at IS NULL) as procedure_count
      FROM accounts a
      WHERE a.id = $1 AND a.deleted_at IS NULL
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Trial not found'
      });
    }
    
    const row = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: row.id,
        name: row.trial_name || row.company_name,
        trialName: row.trial_name,
        companyName: row.company_name,
        subdomain: row.subdomain,
        activated: row.activated,
        suspended: row.suspended,
        timezone: row.timezone,
        createdAt: formatDateTime(row.created_at),
        updatedAt: formatDateTime(row.updated_at),
        stats: {
          assetCount: parseInt(row.asset_count) || 0,
          siteCount: parseInt(row.site_count) || 0,
          subjectCount: parseInt(row.subject_count) || 0,
          procedureCount: parseInt(row.procedure_count) || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
