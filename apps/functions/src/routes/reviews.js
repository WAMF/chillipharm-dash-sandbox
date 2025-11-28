import { Router } from 'express';
import { query } from '../db.js';
import { getPaginationParams, buildPaginationResponse, getSortParams } from '../utils/pagination.js';
import { formatDateTime, formatDate } from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'review_date', 'created_at'];

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { sort, order } = getSortParams(req.query, ALLOWED_SORT_FIELDS, 'review_date', 'desc');
    
    const filters = ['ar.deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;
    
    if (req.query.asset_id) {
      filters.push(`ar.asset_id = $${paramIndex++}`);
      params.push(req.query.asset_id);
    }
    
    if (req.query.user_id) {
      filters.push(`ar.user_id = $${paramIndex++}`);
      params.push(req.query.user_id);
    }
    
    if (req.query.reviewed !== undefined) {
      filters.push(`ar.reviewed = $${paramIndex++}`);
      params.push(req.query.reviewed === 'true');
    }
    
    if (req.query.date_from) {
      filters.push(`ar.review_date >= $${paramIndex++}`);
      params.push(req.query.date_from);
    }
    
    if (req.query.date_to) {
      filters.push(`ar.review_date <= $${paramIndex++}`);
      params.push(req.query.date_to);
    }
    
    const whereClause = `WHERE ${filters.join(' AND ')}`;
    
    const countResult = await query(`SELECT COUNT(*) FROM asset_reviews ar ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await query(`
      SELECT 
        ar.id,
        ar.asset_id,
        ar.user_id,
        ar.reviewed,
        ar.review_date,
        ar.created_at,
        ar.updated_at,
        a.filename as asset_filename,
        u.first_name as reviewer_first_name,
        u.last_name as reviewer_last_name,
        u.email as reviewer_email
      FROM asset_reviews ar
      LEFT JOIN assets a ON ar.asset_id = a.id
      LEFT JOIN users u ON ar.user_id = u.id
      ${whereClause}
      ORDER BY ar.${sort} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset]);
    
    const data = dataResult.rows.map(row => ({
      id: row.id,
      reviewed: row.reviewed,
      reviewDate: formatDate(row.review_date),
      asset: {
        id: row.asset_id,
        filename: row.asset_filename
      },
      reviewer: row.user_id ? {
        id: row.user_id,
        name: [row.reviewer_first_name, row.reviewer_last_name].filter(Boolean).join(' ') || null,
        email: row.reviewer_email
      } : null,
      createdAt: formatDateTime(row.created_at),
      updatedAt: formatDateTime(row.updated_at)
    }));
    
    const pagination = buildPaginationResponse(page, limit, total, '/api/v1/reviews', req.query);
    
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
        ar.*,
        a.filename as asset_filename,
        a.filesize as asset_filesize,
        u.first_name as reviewer_first_name,
        u.last_name as reviewer_last_name,
        u.email as reviewer_email
      FROM asset_reviews ar
      LEFT JOIN assets a ON ar.asset_id = a.id
      LEFT JOIN users u ON ar.user_id = u.id
      WHERE ar.id = $1 AND ar.deleted_at IS NULL
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    const row = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: row.id,
        reviewed: row.reviewed,
        reviewDate: formatDate(row.review_date),
        asset: {
          id: row.asset_id,
          filename: row.asset_filename,
          filesize: parseInt(row.asset_filesize) || 0
        },
        reviewer: row.user_id ? {
          id: row.user_id,
          name: [row.reviewer_first_name, row.reviewer_last_name].filter(Boolean).join(' ') || null,
          email: row.reviewer_email
        } : null,
        createdAt: formatDateTime(row.created_at),
        updatedAt: formatDateTime(row.updated_at)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
