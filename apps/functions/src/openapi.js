export default {
    openapi: '3.0.3',
    info: {
        title: 'ChilliPharm Data API',
        version: '1.0.0',
        description: 'REST API for accessing ChilliPharm clinical trial data',
    },
    servers: [
        {
            url: 'https://api-rr3wuhq42a-nw.a.run.app',
            description: 'Production',
        },
    ],
    security: [{ bearerAuth: [] }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Firebase Auth JWT token',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string' },
                    message: { type: 'string' },
                },
            },
            Pagination: {
                type: 'object',
                properties: {
                    meta: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer' },
                            limit: { type: 'integer' },
                            total: { type: 'integer' },
                            totalPages: { type: 'integer' },
                        },
                    },
                    links: {
                        type: 'object',
                        properties: {
                            self: { type: 'string' },
                            first: { type: 'string' },
                            last: { type: 'string', nullable: true },
                            prev: { type: 'string', nullable: true },
                            next: { type: 'string', nullable: true },
                        },
                    },
                },
            },
            Asset: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    filename: { type: 'string' },
                    filesize: { type: 'integer' },
                    filesizeFormatted: { type: 'string' },
                    duration: { type: 'string', nullable: true },
                    url: { type: 'string' },
                    processed: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    trial: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                        },
                    },
                    site: {
                        type: 'object',
                        nullable: true,
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            country: { type: 'string' },
                            countryCode: { type: 'string' },
                        },
                    },
                },
            },
            Trial: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    trialName: { type: 'string' },
                    companyName: { type: 'string' },
                    subdomain: { type: 'string' },
                    activated: { type: 'boolean' },
                    suspended: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    stats: {
                        type: 'object',
                        properties: {
                            assetCount: { type: 'integer' },
                            siteCount: { type: 'integer' },
                            subjectCount: { type: 'integer' },
                        },
                    },
                },
            },
            Site: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    identifier: { type: 'string' },
                    country: { type: 'string' },
                    countryCode: { type: 'string' },
                    goLiveDate: {
                        type: 'string',
                        format: 'date',
                        nullable: true,
                    },
                    accessStatus: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Subject: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    number: { type: 'string' },
                    active: { type: 'boolean' },
                    trial: { type: 'object' },
                    site: { type: 'object', nullable: true },
                    arm: { type: 'object', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Procedure: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    identifier: { type: 'string' },
                    name: { type: 'string' },
                    date: { type: 'string', format: 'date' },
                    status: { type: 'integer' },
                    locked: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Event: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    identifier: { type: 'string' },
                    name: { type: 'string' },
                    date: { type: 'string', format: 'date' },
                    status: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Review: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    reviewed: { type: 'boolean' },
                    reviewDate: {
                        type: 'string',
                        format: 'date',
                        nullable: true,
                    },
                    asset: { type: 'object' },
                    reviewer: { type: 'object', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Comment: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    comment: { type: 'string' },
                    asset: { type: 'object' },
                    author: { type: 'object', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    company: { type: 'string', nullable: true },
                    jobTitle: { type: 'string', nullable: true },
                    activated: { type: 'boolean' },
                    suspended: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Stats: {
                type: 'object',
                properties: {
                    assets: {
                        type: 'object',
                        properties: {
                            total: { type: 'integer' },
                            processed: { type: 'integer' },
                            processingRate: { type: 'integer' },
                            totalSizeBytes: { type: 'integer' },
                            totalSizeFormatted: { type: 'string' },
                        },
                    },
                    trials: {
                        type: 'object',
                        properties: { total: { type: 'integer' } },
                    },
                    sites: {
                        type: 'object',
                        properties: { total: { type: 'integer' } },
                    },
                    subjects: {
                        type: 'object',
                        properties: { total: { type: 'integer' } },
                    },
                    reviews: {
                        type: 'object',
                        properties: {
                            reviewed: { type: 'integer' },
                            total: { type: 'integer' },
                            reviewRate: { type: 'integer' },
                        },
                    },
                    uploadTrend: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                date: { type: 'string', format: 'date' },
                                uploads: { type: 'integer' },
                            },
                        },
                    },
                },
            },
            QueryFilter: {
                type: 'object',
                description: 'Filter criteria for querying assets',
                properties: {
                    trials: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Filter by trial names',
                    },
                    sites: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Filter by site names',
                    },
                    countries: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Filter by country names',
                    },
                    studyArms: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Filter by study arm names',
                    },
                    procedures: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Filter by procedure names',
                    },
                    dateRange: {
                        type: 'object',
                        properties: {
                            start: {
                                type: 'string',
                                format: 'date',
                                nullable: true,
                            },
                            end: {
                                type: 'string',
                                format: 'date',
                                nullable: true,
                            },
                        },
                        description: 'Filter by upload date range',
                    },
                    reviewStatus: {
                        type: 'string',
                        enum: ['all', 'reviewed', 'pending'],
                        description: 'Filter by review status',
                    },
                    processedStatus: {
                        type: 'string',
                        enum: ['all', 'yes', 'no'],
                        description: 'Filter by processing status',
                    },
                    searchTerm: {
                        type: 'string',
                        description:
                            'Search term for filename, subject number, etc.',
                    },
                    sortBy: {
                        type: 'string',
                        description: 'Field to sort by',
                    },
                    sortOrder: {
                        type: 'string',
                        enum: ['asc', 'desc'],
                        description: 'Sort direction',
                    },
                    page: {
                        type: 'integer',
                        default: 1,
                        description: 'Page number for pagination',
                    },
                    limit: {
                        type: 'integer',
                        default: 1000,
                        maximum: 5000,
                        description: 'Maximum items to return',
                    },
                },
            },
        },
        parameters: {
            pageParam: {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 },
                description: 'Page number',
            },
            limitParam: {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 50, maximum: 500 },
                description: 'Items per page',
            },
            sortParam: {
                name: 'sort',
                in: 'query',
                schema: { type: 'string' },
                description: 'Sort field',
            },
            orderParam: {
                name: 'order',
                in: 'query',
                schema: { type: 'string', enum: ['asc', 'desc'] },
                description: 'Sort order',
            },
            searchParam: {
                name: 'search',
                in: 'query',
                schema: { type: 'string' },
                description: 'Search term',
            },
        },
    },
    paths: {
        '/api/v1/assets': {
            get: {
                summary: 'List assets',
                tags: ['Assets'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    { $ref: '#/components/parameters/sortParam' },
                    { $ref: '#/components/parameters/orderParam' },
                    { $ref: '#/components/parameters/searchParam' },
                    {
                        name: 'trial_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'site_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'processed',
                        in: 'query',
                        schema: { type: 'boolean' },
                    },
                    {
                        name: 'date_from',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                    {
                        name: 'date_to',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                ],
                responses: {
                    200: { description: 'List of assets' },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/api/v1/assets/{id}': {
            get: {
                summary: 'Get asset by ID',
                tags: ['Assets'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Asset details' },
                    404: { description: 'Asset not found' },
                },
            },
        },
        '/api/v1/assets/query': {
            post: {
                summary: 'Query assets with complex filters',
                description:
                    'Advanced query endpoint supporting multi-select filters, date ranges, and full-text search. Use this endpoint for dashboard filtering.',
                tags: ['Assets'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/QueryFilter',
                            },
                            examples: {
                                basicFilter: {
                                    summary: 'Basic trial filter',
                                    value: {
                                        trials: ['Trial A'],
                                        limit: 100,
                                    },
                                },
                                complexFilter: {
                                    summary: 'Complex multi-filter query',
                                    value: {
                                        trials: ['Trial A', 'Trial B'],
                                        sites: ['Site 001'],
                                        countries: [
                                            'United States',
                                            'United Kingdom',
                                        ],
                                        dateRange: {
                                            start: '2024-01-01',
                                            end: '2024-12-31',
                                        },
                                        reviewStatus: 'pending',
                                        processedStatus: 'yes',
                                        searchTerm: 'baseline',
                                        sortBy: 'uploadDate',
                                        sortOrder: 'desc',
                                        page: 1,
                                        limit: 500,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Filtered list of assets with pagination',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/Asset',
                                            },
                                        },
                                        meta: {
                                            $ref: '#/components/schemas/Pagination/properties/meta',
                                        },
                                        links: {
                                            $ref: '#/components/schemas/Pagination/properties/links',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: 'Invalid filter parameters' },
                    401: { description: 'Unauthorized' },
                },
            },
        },
        '/api/v1/trials': {
            get: {
                summary: 'List trials',
                tags: ['Trials'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    { $ref: '#/components/parameters/searchParam' },
                ],
                responses: { 200: { description: 'List of trials' } },
            },
        },
        '/api/v1/trials/{id}': {
            get: {
                summary: 'Get trial by ID',
                tags: ['Trials'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Trial details' },
                    404: { description: 'Trial not found' },
                },
            },
        },
        '/api/v1/sites': {
            get: {
                summary: 'List sites',
                tags: ['Sites'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    { $ref: '#/components/parameters/searchParam' },
                    {
                        name: 'trial_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'country_code',
                        in: 'query',
                        schema: { type: 'string' },
                    },
                ],
                responses: { 200: { description: 'List of sites' } },
            },
        },
        '/api/v1/sites/{id}': {
            get: {
                summary: 'Get site by ID',
                tags: ['Sites'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Site details' },
                    404: { description: 'Site not found' },
                },
            },
        },
        '/api/v1/subjects': {
            get: {
                summary: 'List subjects',
                tags: ['Subjects'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    { $ref: '#/components/parameters/searchParam' },
                    {
                        name: 'trial_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'site_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'arm_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'active',
                        in: 'query',
                        schema: { type: 'boolean' },
                    },
                ],
                responses: { 200: { description: 'List of subjects' } },
            },
        },
        '/api/v1/subjects/{id}': {
            get: {
                summary: 'Get subject by ID',
                tags: ['Subjects'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Subject details' },
                    404: { description: 'Subject not found' },
                },
            },
        },
        '/api/v1/procedures': {
            get: {
                summary: 'List procedures',
                tags: ['Procedures'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    {
                        name: 'subject_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'event_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'date_from',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                    {
                        name: 'date_to',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                ],
                responses: { 200: { description: 'List of procedures' } },
            },
        },
        '/api/v1/procedures/{id}': {
            get: {
                summary: 'Get procedure by ID',
                tags: ['Procedures'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Procedure details' },
                    404: { description: 'Procedure not found' },
                },
            },
        },
        '/api/v1/events': {
            get: {
                summary: 'List events',
                tags: ['Events'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    {
                        name: 'subject_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'site_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'status',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'date_from',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                    {
                        name: 'date_to',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                ],
                responses: { 200: { description: 'List of events' } },
            },
        },
        '/api/v1/events/{id}': {
            get: {
                summary: 'Get event by ID',
                tags: ['Events'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Event details' },
                    404: { description: 'Event not found' },
                },
            },
        },
        '/api/v1/reviews': {
            get: {
                summary: 'List reviews',
                tags: ['Reviews'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    {
                        name: 'asset_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'user_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'reviewed',
                        in: 'query',
                        schema: { type: 'boolean' },
                    },
                ],
                responses: { 200: { description: 'List of reviews' } },
            },
        },
        '/api/v1/reviews/{id}': {
            get: {
                summary: 'Get review by ID',
                tags: ['Reviews'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Review details' },
                    404: { description: 'Review not found' },
                },
            },
        },
        '/api/v1/comments': {
            get: {
                summary: 'List comments',
                tags: ['Comments'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    { $ref: '#/components/parameters/searchParam' },
                    {
                        name: 'asset_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                    {
                        name: 'author_id',
                        in: 'query',
                        schema: { type: 'integer' },
                    },
                ],
                responses: { 200: { description: 'List of comments' } },
            },
        },
        '/api/v1/comments/{id}': {
            get: {
                summary: 'Get comment by ID',
                tags: ['Comments'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'Comment details' },
                    404: { description: 'Comment not found' },
                },
            },
        },
        '/api/v1/users': {
            get: {
                summary: 'List users',
                tags: ['Users'],
                parameters: [
                    { $ref: '#/components/parameters/pageParam' },
                    { $ref: '#/components/parameters/limitParam' },
                    { $ref: '#/components/parameters/searchParam' },
                    {
                        name: 'activated',
                        in: 'query',
                        schema: { type: 'boolean' },
                    },
                ],
                responses: { 200: { description: 'List of users' } },
            },
        },
        '/api/v1/users/{id}': {
            get: {
                summary: 'Get user by ID',
                tags: ['Users'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                    },
                ],
                responses: {
                    200: { description: 'User details' },
                    404: { description: 'User not found' },
                },
            },
        },
        '/api/v1/stats': {
            get: {
                summary: 'Get aggregate statistics',
                tags: ['Stats'],
                parameters: [
                    {
                        name: 'trial_id',
                        in: 'query',
                        schema: { type: 'integer' },
                        description: 'Filter by trial',
                    },
                ],
                responses: { 200: { description: 'Statistics' } },
            },
        },
        '/api/openapi.json': {
            get: {
                summary: 'Get OpenAPI specification',
                tags: ['Documentation'],
                security: [],
                responses: {
                    200: { description: 'OpenAPI 3.0 specification' },
                },
            },
        },
        '/api/health': {
            get: {
                summary: 'Health check',
                tags: ['Health'],
                security: [],
                responses: { 200: { description: 'API is healthy' } },
            },
        },
    },
};
