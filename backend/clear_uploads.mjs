
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function clearUploads() {
    try {
        await pool.query("DELETE FROM uploads");
        console.log("✓ Uploads table cleared");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
clearUploads();
