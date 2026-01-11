import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const email = process.argv[2];

const run = async () => {
    if (!email) {
        console.log("Usage: node make_admin.mjs <email>");
        // List users for convenience
        const res = await pool.query("SELECT id, name, email, role FROM users");
        console.log("Current Users:");
        res.rows.forEach(u => console.log(`${u.id}: ${u.email} (Role: ${u.role})`));
        pool.end();
        return;
    }

    try {
        const res = await pool.query("UPDATE users SET role = 1 WHERE email = $1 RETURNING *", [email]);
        if (res.rows.length > 0) {
            console.log(`✅ Success! User ${email} is now an ADMIN (role 1).`);
        } else {
            console.log(`❌ User ${email} not found.`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
};

run();
