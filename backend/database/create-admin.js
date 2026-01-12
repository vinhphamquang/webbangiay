const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            port: 3307,
            database: 'quanlyshopgiay'
        });

        console.log('✓ Kết nối database thành công!');

        // Hash password
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin exists
        const [existing] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            ['admin@adidas.com']
        );

        let userId;
        if (existing.length > 0) {
            // Update existing admin
            await connection.query(
                'UPDATE users SET password = ?, role = ? WHERE email = ?',
                [hashedPassword, 'admin', 'admin@adidas.com']
            );
            userId = existing[0].id;
            console.log('✓ Cập nhật tài khoản admin thành công!');
        } else {
            // Create new admin
            const [result] = await connection.query(
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                ['admin@adidas.com', hashedPassword, 'admin']
            );
            userId = result.insertId;
            console.log('✓ Tạo tài khoản admin mới thành công!');
        }

        // Check if customer profile exists
        const [customerExists] = await connection.query(
            'SELECT id FROM customers WHERE user_id = ?',
            [userId]
        );

        if (customerExists.length === 0) {
            // Create customer profile for admin
            await connection.query(
                'INSERT INTO customers (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
                [userId, 'Admin', 'admin@adidas.com', '0900000000', 'Adidas HQ']
            );
            console.log('✓ Tạo customer profile cho admin thành công!');
        } else {
            console.log('✓ Customer profile đã tồn tại!');
        }

        await connection.end();
        
        console.log('\n=================================');
        console.log('Thông tin đăng nhập Admin:');
        console.log('Email: admin@adidas.com');
        console.log('Password: 123456');
        console.log('Admin có thể:');
        console.log('- Truy cập trang quản trị');
        console.log('- Mua sắm như người dùng thường');
        console.log('=================================\n');
    } catch (error) {
        console.error('✗ Lỗi:', error.message);
        process.exit(1);
    }
}

createAdmin();
