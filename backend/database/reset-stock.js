const mysql = require('mysql2/promise');

async function resetStock() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            port: 3307,
            database: 'quanlyshopgiay'
        });

        console.log('✓ Kết nối database thành công!');

        // Reset stock về giá trị ban đầu từ seed data
        const products = [
            { id: 1, stock: 50 },
            { id: 2, stock: 30 },
            { id: 3, stock: 100 },
            { id: 4, stock: 40 },
            { id: 5, stock: 60 },
            { id: 6, stock: 25 },
            { id: 7, stock: 80 },
            { id: 8, stock: 35 },
            { id: 9, stock: 45 },
            { id: 10, stock: 20 },
            { id: 11, stock: 70 },
            { id: 12, stock: 30 }
        ];

        for (const product of products) {
            await connection.query(
                'UPDATE products SET stock = ? WHERE id = ?',
                [product.stock, product.id]
            );
        }

        console.log('✓ Reset stock thành công!');

        // Tính lại stock dựa trên các đơn hàng đã completed
        const [completedOrders] = await connection.query(`
            SELECT oi.product_id, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'completed'
            GROUP BY oi.product_id
        `);

        for (const order of completedOrders) {
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [order.total_sold, order.product_id]
            );
            console.log(`  - Sản phẩm #${order.product_id}: Đã bán ${order.total_sold} đôi`);
        }

        console.log('✓ Cập nhật stock theo đơn hàng completed thành công!');

        await connection.end();
    } catch (error) {
        console.error('✗ Lỗi:', error.message);
        process.exit(1);
    }
}

resetStock();
