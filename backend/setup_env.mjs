import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== .env File Setup Wizard ===\n");
console.log("This will help you create a properly formatted .env file.\n");

rl.question('Paste your COMPLETE Neon connection string here (one line, no quotes):\n', (dbUrl) => {
    dbUrl = dbUrl.trim().replace(/^['"]|['"]$/g, ''); // Remove quotes if present

    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
        console.error('\n❌ Error: Connection string should start with postgresql://');
        console.error('Please copy the connection string from Neon (NOT the psql format)');
        rl.close();
        process.exit(1);
    }

    rl.question('\nJWT Secret (press Enter for random): ', (jwtSecret) => {
        if (!jwtSecret.trim()) {
            jwtSecret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        }

        const envContent = `DATABASE_URL=${dbUrl}
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=30d
PORT=8000
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_NAME=EduHub
FROM_EMAIL=
FRONTEND_URL=http://localhost:5173
`;

        fs.writeFileSync('.env', envContent, 'utf8');
        console.log('\n✅ .env file created successfully!');
        console.log('\nYou can now run:');
        console.log('  node test_connection.mjs');
        console.log('  node init_db.mjs');
        console.log('  node migrate_v2.mjs');
        console.log('  npm run dev');

        rl.close();
    });
});
