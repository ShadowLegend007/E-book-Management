
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function createAdmin() {
    try {
        console.log("Connecting to database...");

        const hashedPassword = await bcrypt.hash("Rudra@2026", 10);

        const queryText = `
            INSERT INTO users (name, email, password, role, is_verified, institute, department)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (email) 
            DO UPDATE SET 
                role = $4,
                password = $3,
                is_verified = $5;
        `;

        await pool.query(queryText, [
            "Rudra Narayan",
            "rudranaryan2005@gmail.com",
            hashedPassword,
            2, // Admin role
            true,
            "System Admin",
            "Administration"
        ]);

        console.log("✅ Admin user 'rudranaryan2005@gmail.com' created/updated successfully!");

    } catch (err) {
        console.error("❌ Failed to create admin:", err.message);
    } finally {
        await pool.end();
    }
}

createAdmin();
