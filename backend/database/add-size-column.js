const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function addSizeColumn() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            port: 3307,
            database: 'quanlyshopgiay',
            multipleStatements: true
        });

        console.log('✓ Kết nối database thành công!');

        const sql = await fs.readFile(path.join(__dirname, 'add-size-column.sql'), 'utf8');
        await connection.query(sql);
        
        console.log('✓ Thêm cột size thành công!');

        await connection.end();
    } catch (error) {
        console.error('✗ Lỗi:', error.message);
        process.exit(1);
    }
}

addSizeColumn();
