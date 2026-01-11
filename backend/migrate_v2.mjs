import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: './backend/.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updateSchema() {
    try {
        console.log("Connecting to database...");
        await pool.query("SELECT NOW()");
        console.log("✓ Connected to PostgreSQL");

        // 0. Ensure upload_id is UNIQUE
        console.log("Checking upload_id uniqueness...");
        await pool.query(`
            ALTER TABLE uploads ADD CONSTRAINT uploads_upload_id_key UNIQUE (upload_id);
        `);

        // 1. Create Favorites Table
        console.log("Creating favorites table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
                upload_id TEXT REFERENCES uploads(upload_id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, upload_id)
            )
        `);
        console.log("✓ Favorites table ready");

        // 2. Set default status to 'active' for future uploads
        console.log("Updating uploads status default...");
        await pool.query(`
            ALTER TABLE uploads ALTER COLUMN status SET DEFAULT 'active';
        `);

        // 3. Update existing 'pending' or 'approved' to 'active'
        await pool.query(`
            UPDATE uploads SET status = 'active' WHERE status IN ('pending', 'approved');
        `);

        console.log("✓ Schema updates completed");
        process.exit(0);
    } catch (err) {
        console.error("❌ Update failed:", err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

updateSchema();
