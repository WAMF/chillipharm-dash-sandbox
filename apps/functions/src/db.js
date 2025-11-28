import pg from 'pg';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction
        ? { rejectUnauthorized: true }
        : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', err => {
    console.error('Unexpected pool error:', err);
});

export async function query(text, params) {
    const client = await pool.connect();
    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
}

export async function getClient() {
    return pool.connect();
}

export default pool;
