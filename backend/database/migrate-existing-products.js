const mysql = require('mysql2/promise');

async function migrateProducts() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            port: 3307,
            database: 'quanlyshopgiay'
        });

        console.log('Connected to database...');

        // Lấy tất cả sản phẩm hiện tại
        const [products] = await connection.query('SELECT id, stock FROM products');

        console.log(`Found ${products.length} products to migrate...`);

        // Tạo variants mặc định cho mỗi sản phẩm
        // Size: 38-45, Màu: Đen (mặc định)
        const sizes = ['38', '39', '40', '41', '42', '43', '44', '45'];
        const defaultColor = 'Đen';
        const defaultColorCode = '#000000';

        for (const product of products) {
            console.log(`Migrating product ID ${product.id}...`);
            
            // Chia đều stock cho các size
            const stockPerSize = Math.floor(product.stock / sizes.length);
            const remainder = product.stock % sizes.length;

            for (let i = 0; i < sizes.length; i++) {
                const size = sizes[i];
                // Size đầu tiên nhận thêm phần dư
                const variantStock = i === 0 ? stockPerSize + remainder : stockPerSize;

                await connection.query(
                    `INSERT INTO product_variants (product_id, size, color, color_code, stock) 
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE stock = stock`,
                    [product.id, size, defaultColor, defaultColorCode, variantStock]
                );
            }
        }

        console.log('✓ Migration completed successfully!');
        console.log(`✓ Created variants for ${products.length} products`);
        console.log(`✓ Each product now has ${sizes.length} size variants`);

        await connection.end();
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrateProducts();
