
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'uploads';
        `);
        console.log("Columns in uploads:", res.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
