
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        console.log("Adding missing columns to uploads table...");

        await pool.query(`
            ALTER TABLE uploads 
            ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS downloads INT DEFAULT 0;
        `);

        console.log("✓ Columns added successfully");
    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        pool.end();
    }
}
migrate();
