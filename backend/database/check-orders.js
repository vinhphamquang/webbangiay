const mysql = require('mysql2/promise');

async function checkOrders() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '',
        database: 'quanlyshopgiay'
    });

    try {
        console.log('🔍 Checking completed orders...\n');
        
        // Get completed orders
        const [orders] = await connection.query(`
            SELECT * FROM orders 
            WHERE status = 'completed' 
            ORDER BY id DESC 
            LIMIT 5
        `);
        
        console.log(`Found ${orders.length} completed orders:\n`);
        
        for (const order of orders) {
            console.log(`📦 Order #${order.id} - Total: ${order.total_amount} - Date: ${order.order_date}`);
            
            // Get order items
            const [items] = await connection.query(`
                SELECT 
                    oi.*,
                    p.name as product_name,
                    pv.size,
                    pv.color,
                    pv.stock as current_stock
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                LEFT JOIN product_variants pv ON oi.variant_id = pv.id
                WHERE oi.order_id = ?
            `, [order.id]);
            
            for (const item of items) {
                console.log(`  - ${item.product_name}`);
                console.log(`    Product ID: ${item.product_id}`);
                console.log(`    Variant ID: ${item.variant_id || 'NULL (OLD ORDER)'}`);
                console.log(`    Color: ${item.color || item.color || 'N/A'}`);
                console.log(`    Size: ${item.size || 'N/A'}`);
                console.log(`    Quantity: ${item.quantity}`);
                console.log(`    Current Stock: ${item.current_stock || 'N/A'}`);
            }
            console.log('');
        }
        
        // Check product variants stock
        console.log('\n📊 Current stock for product ID 1:');
        const [variants] = await connection.query(`
            SELECT * FROM product_variants 
            WHERE product_id = 1 
            ORDER BY size
        `);
        
        for (const v of variants) {
            console.log(`  Size ${v.size} (${v.color}): ${v.stock} units`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkOrders().catch(console.error);
