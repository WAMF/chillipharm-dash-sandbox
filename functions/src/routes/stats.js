import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filters = [];
    const params = [];
    let paramIndex = 1;
    
    if (req.query.trial_id) {
      filters.push(`account_id = $${paramIndex++}`);
      params.push(req.query.trial_id);
    }
    
    const assetWhere = filters.length > 0 
      ? `WHERE soft_deleted_at IS NULL AND ${filters.join(' AND ')}`
      : 'WHERE soft_deleted_at IS NULL';
    
    const [
      assetStats,
      trialStats,
      siteStats,
      subjectStats,
      reviewStats,
      uploadTrend
    ] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE processed = true) as processed,
          SUM(filesize) as total_size
        FROM assets ${assetWhere}
      `, params),
      
      query(`SELECT COUNT(*) as total FROM accounts WHERE deleted_at IS NULL`),
      
      query(`SELECT COUNT(*) as total FROM trial_containers WHERE type = 'Site' AND deleted_at IS NULL`),
      
      query(`SELECT COUNT(*) as total FROM study_subjects`),
      
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE reviewed = true) as reviewed,
          COUNT(*) as total
        FROM asset_reviews WHERE deleted_at IS NULL
      `),
      
      query(`
        SELECT 
          DATE_TRUNC('day', created_at)::date as date,
          COUNT(*) as uploads
        FROM assets
        WHERE soft_deleted_at IS NULL 
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
        LIMIT 30
      `)
    ]);
    
    const totalAssets = parseInt(assetStats.rows[0].total) || 0;
    const processedAssets = parseInt(assetStats.rows[0].processed) || 0;
    const totalSize = parseInt(assetStats.rows[0].total_size) || 0;
    const reviewedAssets = parseInt(reviewStats.rows[0].reviewed) || 0;
    const totalReviews = parseInt(reviewStats.rows[0].total) || 0;
    
    res.json({
      success: true,
      data: {
        assets: {
          total: totalAssets,
          processed: processedAssets,
          processingRate: totalAssets > 0 ? Math.round((processedAssets / totalAssets) * 100) : 0,
          totalSizeBytes: totalSize,
          totalSizeFormatted: formatSize(totalSize)
        },
        trials: {
          total: parseInt(trialStats.rows[0].total) || 0
        },
        sites: {
          total: parseInt(siteStats.rows[0].total) || 0
        },
        subjects: {
          total: parseInt(subjectStats.rows[0].total) || 0
        },
        reviews: {
          reviewed: reviewedAssets,
          total: totalReviews,
          reviewRate: totalReviews > 0 ? Math.round((reviewedAssets / totalReviews) * 100) : 0
        },
        uploadTrend: uploadTrend.rows.map(r => ({
          date: r.date,
          uploads: parseInt(r.uploads)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

export default router;
