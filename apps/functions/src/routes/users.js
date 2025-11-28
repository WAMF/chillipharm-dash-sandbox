import { Router } from 'express';
import { query } from '../db.js';
import { getPaginationParams, buildPaginationResponse, getSortParams } from '../utils/pagination.js';
import { formatDateTime, formatDate } from '../utils/formatting.js';

const router = Router();

const ALLOWED_SORT_FIELDS = ['id', 'first_name', 'last_name', 'email', 'created_at'];

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { sort, order } = getSortParams(req.query, ALLOWED_SORT_FIELDS, 'last_name', 'asc');
    
    const filters = ['deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;
    
    if (req.query.activated !== undefined) {
      filters.push(`activated = $${paramIndex++}`);
      params.push(req.query.activated === 'true');
    }
    
    if (req.query.search) {
      filters.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${req.query.search}%`);
      paramIndex++;
    }
    
    const whereClause = `WHERE ${filters.join(' AND ')}`;
    
    const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    
    const dataResult = await query(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        company,
        job_title,
        activated,
        suspended,
        activation_date,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset]);
    
    const data = dataResult.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      name: [row.first_name, row.last_name].filter(Boolean).join(' ') || null,
      email: row.email,
      company: row.company,
      jobTitle: row.job_title,
      activated: row.activated,
      suspended: row.suspended,
      activationDate: formatDate(row.activation_date),
      createdAt: formatDateTime(row.created_at),
      updatedAt: formatDateTime(row.updated_at)
    }));
    
    const pagination = buildPaginationResponse(page, limit, total, '/api/v1/users', req.query);
    
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
        id,
        first_name,
        last_name,
        email,
        company,
        job_title,
        phone,
        timezone,
        activated,
        suspended,
        activation_date,
        created_at,
        updated_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const row = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        name: [row.first_name, row.last_name].filter(Boolean).join(' ') || null,
        email: row.email,
        company: row.company,
        jobTitle: row.job_title,
        phone: row.phone,
        timezone: row.timezone,
        activated: row.activated,
        suspended: row.suspended,
        activationDate: formatDate(row.activation_date),
        createdAt: formatDateTime(row.created_at),
        updatedAt: formatDateTime(row.updated_at)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
