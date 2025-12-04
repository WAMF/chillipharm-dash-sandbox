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

        const assetWhere =
            filters.length > 0
                ? `WHERE soft_deleted_at IS NULL AND ${filters.join(' AND ')}`
                : 'WHERE soft_deleted_at IS NULL';

        const [
            assetStats,
            trialStats,
            siteStats,
            subjectStats,
            reviewStats,
            uploadTrend,
        ] = await Promise.all([
            query(
                `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE processed = true) as processed,
          SUM(filesize) as total_size
        FROM assets ${assetWhere}
      `,
                params
            ),

            query(
                `SELECT COUNT(*) as total FROM accounts WHERE deleted_at IS NULL`
            ),

            query(
                `SELECT COUNT(*) as total FROM trial_containers WHERE type = 'Site' AND deleted_at IS NULL`
            ),

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
      `),
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
                    processingRate:
                        totalAssets > 0
                            ? Math.round((processedAssets / totalAssets) * 100)
                            : 0,
                    totalSizeBytes: totalSize,
                    totalSizeFormatted: formatSize(totalSize),
                },
                trials: {
                    total: parseInt(trialStats.rows[0].total) || 0,
                },
                sites: {
                    total: parseInt(siteStats.rows[0].total) || 0,
                },
                subjects: {
                    total: parseInt(subjectStats.rows[0].total) || 0,
                },
                reviews: {
                    reviewed: reviewedAssets,
                    total: totalReviews,
                    reviewRate:
                        totalReviews > 0
                            ? Math.round((reviewedAssets / totalReviews) * 100)
                            : 0,
                },
                uploadTrend: uploadTrend.rows.map(r => ({
                    date: r.date,
                    uploads: parseInt(r.uploads),
                })),
            },
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

router.get('/sites', async (req, res, next) => {
    try {
        const params = [];
        let paramIndex = 1;
        let trialFilter = '';

        if (req.query.trial_id) {
            trialFilter = `AND tc.account_id = $${paramIndex++}`;
            params.push(req.query.trial_id);
        }

        const [
            siteCount,
            subjectCount,
            assetCount,
            assetsPerSite,
            subjectsPerSite,
            countriesDistribution,
        ] = await Promise.all([
            query(
                `SELECT COUNT(*) as total FROM trial_containers tc WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}`,
                params
            ),

            query(
                `
                SELECT COUNT(DISTINCT ss.id) as total
                FROM study_subjects ss
                JOIN trial_containers tc ON ss.site_id = tc.id
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
                `,
                params
            ),

            query(
                `
                SELECT COUNT(*) as total
                FROM assets a
                JOIN trial_containers tc ON a.trial_container_id = tc.id
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL AND a.soft_deleted_at IS NULL ${trialFilter}
                `,
                params
            ),

            query(
                `
                SELECT tc.id as site_id, tc.name as site_name, COUNT(a.id) as count
                FROM trial_containers tc
                LEFT JOIN assets a ON a.trial_container_id = tc.id AND a.soft_deleted_at IS NULL
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
                GROUP BY tc.id, tc.name
                ORDER BY count DESC
                LIMIT 20
                `,
                params
            ),

            query(
                `
                SELECT tc.id as site_id, tc.name as site_name, COUNT(ss.id) as count
                FROM trial_containers tc
                LEFT JOIN study_subjects ss ON ss.site_id = tc.id
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL ${trialFilter}
                GROUP BY tc.id, tc.name
                ORDER BY count DESC
                LIMIT 20
                `,
                params
            ),

            query(
                `
                SELECT
                    tc.country_code as country,
                    COUNT(DISTINCT tc.id) as site_count,
                    COUNT(DISTINCT a.id) as asset_count
                FROM trial_containers tc
                LEFT JOIN assets a ON a.trial_container_id = tc.id AND a.soft_deleted_at IS NULL
                WHERE tc.type = 'Site' AND tc.deleted_at IS NULL AND tc.country_code IS NOT NULL ${trialFilter}
                GROUP BY tc.country_code
                ORDER BY site_count DESC
                `,
                params
            ),
        ]);

        res.json({
            success: true,
            data: {
                totalSites: parseInt(siteCount.rows[0].total) || 0,
                totalSubjects: parseInt(subjectCount.rows[0].total) || 0,
                totalAssets: parseInt(assetCount.rows[0].total) || 0,
                assetsPerSite: assetsPerSite.rows.map(r => ({
                    siteId: r.site_id,
                    siteName: r.site_name,
                    count: parseInt(r.count) || 0,
                })),
                subjectsPerSite: subjectsPerSite.rows.map(r => ({
                    siteId: r.site_id,
                    siteName: r.site_name,
                    count: parseInt(r.count) || 0,
                })),
                countriesDistribution: countriesDistribution.rows.map(r => ({
                    country: r.country,
                    siteCount: parseInt(r.site_count) || 0,
                    assetCount: parseInt(r.asset_count) || 0,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
