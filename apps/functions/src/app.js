import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { verifyAuth, verifyDocsAuth } from './middleware/auth.js';

import assetsRouter from './routes/assets.js';
import trialsRouter from './routes/trials.js';
import sitesRouter from './routes/sites.js';
import subjectsRouter from './routes/subjects.js';
import proceduresRouter from './routes/procedures.js';
import eventsRouter from './routes/events.js';
import commentsRouter from './routes/comments.js';
import statsRouter from './routes/stats.js';
import reportsRouter from './routes/reports.js';
import openapiSpec from './openapi.js';

const app = express();

// Rate limiting for documentation and OpenAPI endpoints to prevent abuse
const expressRateLimit = require('express-rate-limit');
const docsRateLimiter = expressRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(
    '/docs',
    docsRateLimiter,
    cookieParser(),
    verifyDocsAuth,
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'ChilliPharm API Documentation',
    })
);

app.get(
    '/openapi.json',
    docsRateLimiter,
    cookieParser(),
    verifyDocsAuth,
    (req, res) => {
        res.json(openapiSpec);
    }
);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', verifyAuth);

app.use('/api/v1/assets', assetsRouter);
app.use('/api/v1/trials', trialsRouter);
app.use('/api/v1/sites', sitesRouter);
app.use('/api/v1/subjects', subjectsRouter);
app.use('/api/v1/procedures', proceduresRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/reports', reportsRouter);

app.use((err, req, res, next) => {
    console.error('API Error:', err);
    const isProduction = process.env.NODE_ENV === 'production';
    const statusCode = err.status || 500;
    const showDetail = !isProduction || statusCode < 500;
    res.status(statusCode).json({
        success: false,
        error: showDetail
            ? err.message || 'Internal server error'
            : 'Internal server error',
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Endpoint ${req.method} ${req.path} not found`,
    });
});

export default app;
