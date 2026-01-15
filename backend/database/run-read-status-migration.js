const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            port: 3307,
            multipleStatements: true
        });

        console.log('Connected to database...');

        const sql = fs.readFileSync(path.join(__dirname, 'add-read-status.sql'), 'utf8');
        await connection.query(sql);

        console.log('✓ Migration completed successfully!');
        console.log('✓ Added is_read column to contacts table');

        await connection.end();
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

runMigration();
