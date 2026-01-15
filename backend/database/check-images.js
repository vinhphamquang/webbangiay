const mysql = require('mysql2/promise');

async function checkImages() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '',
        database: 'quanlyshopgiay'
    });

    try {
        console.log('🔍 Checking product images...\n');
        
        const [products] = await connection.query(`
            SELECT id, name, image 
            FROM products 
            ORDER BY id 
            LIMIT 5
        `);
        
        console.log('📸 Product images:');
        for (const p of products) {
            console.log(`\nID ${p.id}: ${p.name}`);
            console.log(`  Image: ${p.image}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkImages().catch(console.error);
