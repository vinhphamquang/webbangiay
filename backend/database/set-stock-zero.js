const mysql = require('mysql2/promise');

async function setStockZero() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '',
        database: 'quanlyshopgiay'
    });

    try {
        console.log('🔄 Setting some variants to stock = 0 for testing...\n');
        
        // Set size 39 and 40 to stock = 0
        await connection.query(`
            UPDATE product_variants 
            SET stock = 0 
            WHERE product_id = 1 AND size IN (39, 40)
        `);
        
        console.log('✅ Updated stock to 0 for size 39 and 40');
        
        // Show current stock
        const [variants] = await connection.query(`
            SELECT size, color, stock 
            FROM product_variants 
            WHERE product_id = 1 
            ORDER BY size
        `);
        
        console.log('\n📊 Current stock for product ID 1:');
        for (const v of variants) {
            const status = v.stock === 0 ? '❌ HẾT HÀNG' : `✓ Còn ${v.stock}`;
            console.log(`  Size ${v.size} (${v.color}): ${status}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

setStockZero().catch(console.error);
