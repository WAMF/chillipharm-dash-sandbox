import { Router } from 'express';
import { query } from '../db.js';
import { getPaginationParams, buildPaginationResponse, getSortParams } from '../utils/pagination.js';
import { getCountryName, formatDateTime, formatDate } from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'name', 'country_code', 'created_at'];

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { sort, order } = getSortParams(req.query, ALLOWED_SORT_FIELDS, 'name', 'asc');
    
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
    
    const countResult = await query(`SELECT COUNT(*) FROM trial_containers tc ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await query(`
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
    `, [...params, limit, offset]);
    
    const data = dataResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      identifier: row.identifier,
      country: getCountryName(row.country_code),
      countryCode: row.country_code,
      goLiveDate: formatDate(row.go_live_date),
      accessStatus: row.access_status,
      contact: row.contact_name ? {
        name: row.contact_name,
        email: row.contact_email,
        phone: row.contact_number
      } : null,
      trial: {
        id: row.trial_id,
        name: row.trial_name || row.company_name
      },
      createdAt: formatDateTime(row.created_at),
      updatedAt: formatDateTime(row.updated_at),
      stats: {
        assetCount: parseInt(row.asset_count) || 0,
        subjectCount: parseInt(row.subject_count) || 0
      }
    }));
    
    const pagination = buildPaginationResponse(page, limit, total, '/api/v1/sites', req.query);
    
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
        tc.*,
        a.trial_name,
        a.company_name,
        (SELECT COUNT(*) FROM assets WHERE trial_container_id = tc.id AND soft_deleted_at IS NULL) as asset_count,
        (SELECT COUNT(*) FROM study_subjects WHERE site_id = tc.id) as subject_count
      FROM trial_containers tc
      LEFT JOIN accounts a ON tc.account_id = a.id
      WHERE tc.id = $1 AND tc.type = 'Site' AND tc.deleted_at IS NULL
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Site not found'
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
        contact: row.contact_name ? {
          name: row.contact_name,
          email: row.contact_email,
          phone: row.contact_number
        } : null,
        trial: {
          id: row.account_id,
          name: row.trial_name || row.company_name
        },
        createdAt: formatDateTime(row.created_at),
        updatedAt: formatDateTime(row.updated_at),
        stats: {
          assetCount: parseInt(row.asset_count) || 0,
          subjectCount: parseInt(row.subject_count) || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
