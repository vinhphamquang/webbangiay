const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '',
        database: 'quanlyshopgiay',
        multipleStatements: true
    });

    try {
        console.log('🔄 Running order_items variant migration...');
        
        // Check if columns already exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'quanlyshopgiay' 
            AND TABLE_NAME = 'order_items' 
            AND COLUMN_NAME IN ('variant_id', 'color')
        `);
        
        if (columns.length > 0) {
            console.log('⚠️  Columns already exist. Skipping migration.');
            await connection.end();
            return;
        }

        // Read and execute SQL file
        const sqlFile = path.join(__dirname, 'add-variant-to-orders.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        await connection.query(sql);
        
        console.log('✅ Migration completed successfully!');
        console.log('✅ Added variant_id and color columns to order_items');
        console.log('✅ Added variant_id and color columns to cart');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
