import pg from 'pg';
import 'dotenv/config';

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function explore() {
    await client.connect();

    const tables = ['study_subjects', 'study_arms', 'study_procedures'];

    for (const table of tables) {
        const result = await client.query(
            `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `,
            [table]
        );
        console.log(
            `\n${table} columns:`,
            result.rows.map(r => r.column_name)
        );
    }

    await client.end();
}

explore().catch(console.error);
