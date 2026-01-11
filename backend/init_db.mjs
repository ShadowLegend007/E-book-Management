import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

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

async function init() {
    try {
        console.log("Connecting to database...");
        await pool.query("SELECT NOW()");
        console.log("✓ Connected to PostgreSQL");

        // 1. Create Users Table
        console.log("Creating users table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(1000) NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                department TEXT DEFAULT NULL,
                institute TEXT NOT NULL,
                password TEXT NOT NULL,
                otp INT DEFAULT NULL,
                role INT DEFAULT 0,
                is_verified BOOLEAN DEFAULT FALSE,
                email_verification_token TEXT,
                email_verification_expiry TIMESTAMP,
                reset_password_token TEXT,
                reset_password_expiry TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✓ Users table ready");

        // 2. Create Uploads Table
        console.log("Creating uploads table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS uploads (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                user_id BIGINT REFERENCES users(id),
                upload_id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                language TEXT,
                year TEXT,
                document_type TEXT,
                book_file TEXT,
                cover_file TEXT,
                is_a_book INT DEFAULT 0,
                full_drive_id TEXT,
                preview_drive_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✓ Uploads table ready");

        // 3. Create Favorites Table
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


        console.log("\n✅ Database initialization completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Initialization failed:", err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

init();
