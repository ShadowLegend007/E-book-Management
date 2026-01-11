import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: './backend/.env' });

const DATABASE_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function check() {
    const res = await pool.query(`
        SELECT conname, contype 
        FROM pg_constraint 
        WHERE conrelid = 'uploads'::regclass
    `);
    console.table(res.rows);
    process.exit(0);
}
check();
