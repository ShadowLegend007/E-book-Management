
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function seedUploads() {
    try {
        // Get Admin ID
        const userRes = await pool.query("SELECT id FROM users WHERE role = 2 LIMIT 1");
        const userId = userRes.rows[0]?.id;

        if (!userId) {
            console.log("No admin found, skipping seed");
            return;
        }

        const entries = [
            {
                title: "Introduction to Algorithms",
                author: "Thomas H. Cormen",
                category: "Computer Science",
                isBook: 1,
                desc: "Comprehensive guide to algorithms."
            },
            {
                title: "Clean Code",
                author: "Robert C. Martin",
                category: "Software Engineering",
                isBook: 1,
                desc: "A Handbook of Agile Software Craftsmanship."
            },
            {
                title: "Data Structures Notes",
                author: "Prof. Smith",
                category: "Computer Science",
                isBook: 0,
                desc: "Lecture notes on Trees and Graphs."
            },
            {
                title: "Operating Systems Summary",
                author: "Jane Doe",
                category: "Computer Science",
                isBook: 0,
                desc: "Quick revision notes for OS."
            }
        ];

        for (const [i, item] of entries.entries()) {
            const uploadId = `SEED${100 + i}`;
            await pool.query(`
                INSERT INTO uploads 
                (user_id, upload_id, title, author, description, category, language, year, is_a_book, cover_file, book_file, status, downloads)
                VALUES ($1, $2, $3, $4, $5, $6, 'English', '2025', $7, $8, $9, 'active', 10)
                ON CONFLICT (upload_id) DO NOTHING
            `, [userId, uploadId, item.title, item.author, item.desc, item.category, item.isBook, 'SDASD798561.png', 'dummy.pdf']);
        }
        console.log("Seeded uploads");

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
seedUploads();
