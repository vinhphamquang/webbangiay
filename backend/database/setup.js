const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
    try {
        // Connect without database first
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            port: 3307,  // Port từ XAMPP config
            multipleStatements: true
        });

        console.log('✓ Kết nối MySQL thành công!');

        // Read and execute schema
        const schemaSQL = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
        await connection.query(schemaSQL);
        console.log('✓ Tạo database và bảng thành công!');

        // Read and execute seed data
        const seedSQL = await fs.readFile(path.join(__dirname, 'seed.sql'), 'utf8');
        await connection.query(seedSQL);
        console.log('✓ Thêm dữ liệu mẫu thành công!');

        await connection.end();
        console.log('\n✓ Setup database hoàn tất!');
        console.log('\nCó thể chạy server bằng lệnh: npm start');
    } catch (error) {
        console.error('✗ Lỗi setup database:', error.message);
        process.exit(1);
    }
}

setupDatabase();
