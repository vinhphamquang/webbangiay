const mysql = require('mysql2/promise');

async function setAllStockZero() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '',
        database: 'quanlyshopgiay'
    });

    try {
        console.log('🔄 Setting ALL variants to stock = 0 for product ID 1...\n');
        
        // Set all sizes to stock = 0
        await connection.query(`
            UPDATE product_variants 
            SET stock = 0 
            WHERE product_id = 1
        `);
        
        console.log('✅ Updated ALL stock to 0');
        
        // Show current stock
        const [variants] = await connection.query(`
            SELECT size, color, stock 
            FROM product_variants 
            WHERE product_id = 1 
            ORDER BY size
        `);
        
        console.log('\n📊 Current stock for product ID 1:');
        for (const v of variants) {
            console.log(`  Size ${v.size} (${v.color}): ❌ HẾT HÀNG`);
        }
        
        console.log('\n🎯 Bây giờ sản phẩm sẽ hiển thị "HẾT HÀNG" trên trang chủ!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

setAllStockZero().catch(console.error);
