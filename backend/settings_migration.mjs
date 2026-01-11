import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: './backend/.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function migrate() {
    try {
        console.log("Connecting to database...");
        await pool.query("SELECT NOW()");
        console.log("✓ Connected to PostgreSQL");

        console.log("Creating settings table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value JSONB,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Seeding maintenance_mode...");
        await pool.query(`
            INSERT INTO settings (key, value)
            VALUES ('maintenance_mode', 'false'::jsonb)
            ON CONFLICT (key) DO NOTHING
        `);

        console.log("✓ Settings migration completed");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
