const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection } = require('../config/database');
const { router: authRouter } = require('./auth');
const adminRouter = require('./admin');
const customerRouter = require('./customer');
const contactRouter = require('./contact');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/customer', customerRouter);
app.use('/api/contact', contactRouter);

// Initialize database connection
async function initializeData() {
    await testConnection();
}

// Error handling middleware
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Helper functions
function getCategoryId(categorySlug) {
    const categoryMap = {
        'running': 1,
        'football': 2,
        'lifestyle': 3,
        'basketball': 4
    };
    return categoryMap[categorySlug] || 1;
}

function getCategorySlug(categoryId) {
    const slugMap = {
        1: 'running',
        2: 'football',
        3: 'lifestyle',
        4: 'basketball'
    };
    return slugMap[categoryId] || 'running';
}

// API Routes

// 1. GET /api/products - Lấy tất cả sản phẩm
app.get('/api/products', asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`
        SELECT 
            p.*, 
            c.name as category_name,
            COALESCE(SUM(pv.stock), 0) as total_stock
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        GROUP BY p.id
        ORDER BY p.id
    `);
    
    // Return products with category_id for dynamic category support
    const products = rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        category_id: row.category_id,
        category_name: row.category_name,
        image: row.image,
        description: row.description,
        stock: parseInt(row.total_stock) || 0
    }));
    
    res.json(products);
}));

// 2. GET /api/products/:id - Lấy sản phẩm theo ID
app.get('/api/products/:id', asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
        'SELECT * FROM products WHERE id = ?',
        [req.params.id]
    );
    
    if (rows.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    const product = {
        id: rows[0].id,
        name: rows[0].name,
        price: parseFloat(rows[0].price),
        category: getCategorySlug(rows[0].category_id),
        image: rows[0].image,
        description: rows[0].description,
        stock: rows[0].stock
    };
    
    res.json(product);
}));

// 3. POST /api/products - Tạo sản phẩm mới
app.post('/api/products', asyncHandler(async (req, res) => {
    const { name, price, category, image, description, stock } = req.body;
    
    if (!name || !price || !category || !image || !description || stock === undefined) {
        return res.status(400).json({ error: 'Thiếu thông tin sản phẩm' });
    }
    
    const categoryId = getCategoryId(category);
    
    const [result] = await pool.query(
        'INSERT INTO products (name, price, category_id, image, description, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [name, price, categoryId, image, description, stock]
    );
    
    const newProduct = {
        id: result.insertId,
        name,
        price: parseFloat(price),
        category,
        image,
        description,
        stock: parseInt(stock)
    };
    
    res.status(201).json(newProduct);
}));

// 4. PUT /api/products/:id - Cập nhật sản phẩm
app.put('/api/products/:id', asyncHandler(async (req, res) => {
    const { name, price, category, image, description, stock } = req.body;
    
    const categoryId = category ? getCategoryId(category) : null;
    
    const [result] = await pool.query(
        `UPDATE products SET 
            name = COALESCE(?, name),
            price = COALESCE(?, price),
            category_id = COALESCE(?, category_id),
            image = COALESCE(?, image),
            description = COALESCE(?, description),
            stock = COALESCE(?, stock)
        WHERE id = ?`,
        [name, price, categoryId, image, description, stock, req.params.id]
    );
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    const product = {
        id: rows[0].id,
        name: rows[0].name,
        price: parseFloat(rows[0].price),
        category: getCategorySlug(rows[0].category_id),
        image: rows[0].image,
        description: rows[0].description,
        stock: rows[0].stock
    };
    
    res.json(product);
}));

// 5. DELETE /api/products/:id - Xóa sản phẩm
app.delete('/api/products/:id', asyncHandler(async (req, res) => {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    res.json({ message: 'Xóa sản phẩm thành công' });
}));

// 6. GET /api/products/category/:category - Lấy sản phẩm theo danh mục
app.get('/api/products/category/:category', asyncHandler(async (req, res) => {
    const categoryId = getCategoryId(req.params.category);
    
    const [rows] = await pool.query(
        'SELECT * FROM products WHERE category_id = ?',
        [categoryId]
    );
    
    const products = rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        category: getCategorySlug(row.category_id),
        image: row.image,
        description: row.description,
        stock: row.stock
    }));
    
    res.json(products);
}));

// 7. GET /api/products/search - Tìm kiếm sản phẩm
app.get('/api/products/search', asyncHandler(async (req, res) => {
    const keyword = req.query.q || '';
    
    const [rows] = await pool.query(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
        [`%${keyword}%`, `%${keyword}%`]
    );
    
    const products = rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        category: getCategorySlug(row.category_id),
        image: row.image,
        description: row.description,
        stock: row.stock
    }));
    
    res.json(products);
}));

// 8. GET /api/cart - Lấy giỏ hàng (Public API - backward compatibility)
app.get('/api/cart', asyncHandler(async (req, res) => {
    const customerId = req.query.customer_id || 1; // Default customer for demo
    
    const [rows] = await pool.query(`
        SELECT c.*, p.name, p.price, p.image, p.stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = ?
    `, [customerId]);
    
    const items = rows.map(row => ({
        product: {
            id: row.product_id,
            name: row.name,
            price: parseFloat(row.price),
            image: row.image,
            stock: row.stock
        },
        quantity: row.quantity
    }));
    
    res.json({ items });
}));

// GET /api/categories - Lấy tất cả danh mục
app.get('/api/categories', asyncHandler(async (req, res) => {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(categories);
}));

// GET /api/products/:id/reviews - Lấy đánh giá của sản phẩm
app.get('/api/products/:id/reviews', asyncHandler(async (req, res) => {
    const [reviews] = await pool.query(`
        SELECT r.*, c.name as customer_name
        FROM reviews r
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.product_id = ? AND r.status = 'approved'
        ORDER BY r.created_at DESC
    `, [req.params.id]);
    
    res.json(reviews);
}));

// 9. POST /api/cart - Thêm sản phẩm vào giỏ hàng
app.post('/api/cart', asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const customerId = req.body.customer_id || 1; // Default customer for demo
    
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (products.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    const product = products[0];
    
    if (product.stock < quantity) {
        return res.status(400).json({ error: 'Không đủ hàng trong kho' });
    }
    
    // Check if item already in cart
    const [existing] = await pool.query(
        'SELECT * FROM cart WHERE customer_id = ? AND product_id = ?',
        [customerId, productId]
    );
    
    if (existing.length > 0) {
        await pool.query(
            'UPDATE cart SET quantity = quantity + ? WHERE customer_id = ? AND product_id = ?',
            [quantity, customerId, productId]
        );
    } else {
        await pool.query(
            'INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, ?)',
            [customerId, productId, quantity]
        );
    }
    
    // Return updated cart
    const [rows] = await pool.query(`
        SELECT c.*, p.name, p.price, p.image, p.stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = ?
    `, [customerId]);
    
    const items = rows.map(row => ({
        product: {
            id: row.product_id,
            name: row.name,
            price: parseFloat(row.price),
            image: row.image,
            stock: row.stock
        },
        quantity: row.quantity
    }));
    
    res.json({ items });
}));

// 10. PUT /api/cart/:productId - Cập nhật số lượng trong giỏ hàng
app.put('/api/cart/:productId', asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const customerId = req.body.customer_id || 1;
    
    if (quantity < 1) {
        return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
    }
    
    const [products] = await pool.query('SELECT stock FROM products WHERE id = ?', [req.params.productId]);
    
    if (products.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    if (products[0].stock < quantity) {
        return res.status(400).json({ error: 'Không đủ hàng trong kho' });
    }
    
    const [result] = await pool.query(
        'UPDATE cart SET quantity = ? WHERE customer_id = ? AND product_id = ?',
        [quantity, customerId, req.params.productId]
    );
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }
    
    // Return updated cart
    const [rows] = await pool.query(`
        SELECT c.*, p.name, p.price, p.image, p.stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = ?
    `, [customerId]);
    
    const items = rows.map(row => ({
        product: {
            id: row.product_id,
            name: row.name,
            price: parseFloat(row.price),
            image: row.image,
            stock: row.stock
        },
        quantity: row.quantity
    }));
    
    res.json({ items });
}));

// 11. DELETE /api/cart/:productId - Xóa sản phẩm khỏi giỏ hàng
app.delete('/api/cart/:productId', asyncHandler(async (req, res) => {
    const customerId = req.query.customer_id || 1;
    
    const [result] = await pool.query(
        'DELETE FROM cart WHERE customer_id = ? AND product_id = ?',
        [customerId, req.params.productId]
    );
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }
    
    // Return updated cart
    const [rows] = await pool.query(`
        SELECT c.*, p.name, p.price, p.image, p.stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = ?
    `, [customerId]);
    
    const items = rows.map(row => ({
        product: {
            id: row.product_id,
            name: row.name,
            price: parseFloat(row.price),
            image: row.image,
            stock: row.stock
        },
        quantity: row.quantity
    }));
    
    res.json({ items });
}));

// 12. DELETE /api/cart - Xóa toàn bộ giỏ hàng
app.delete('/api/cart', asyncHandler(async (req, res) => {
    const customerId = req.query.customer_id || 1;
    
    await pool.query('DELETE FROM cart WHERE customer_id = ?', [customerId]);
    
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
}));

// 13. POST /api/orders - Tạo đơn hàng
app.post('/api/orders', asyncHandler(async (req, res) => {
    const { items, total } = req.body;
    const customerId = req.body.customer_id || 1;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Giỏ hàng trống' });
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
        // Check stock availability
        for (const item of items) {
            const [products] = await connection.query(
                'SELECT stock FROM products WHERE id = ?',
                [item.product.id]
            );
            
            if (products.length === 0) {
                throw new Error(`Không tìm thấy sản phẩm ${item.product.name}`);
            }
            
            if (products[0].stock < item.quantity) {
                throw new Error(`Không đủ hàng cho sản phẩm ${item.product.name}`);
            }
        }
        
        // Get customer address
        const [customers] = await connection.query(
            'SELECT address FROM customers WHERE id = ?',
            [customerId]
        );
        
        const shippingAddress = customers.length > 0 ? customers[0].address : 'Địa chỉ mặc định';
        
        // Create order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_id, total_amount, shipping_address) VALUES (?, ?, ?)',
            [customerId, total, shippingAddress]
        );
        
        const orderId = orderResult.insertId;
        
        // Add order items and update stock
        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product.id, item.quantity, item.product.price]
            );
            
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product.id]
            );
        }
        
        await connection.commit();
        connection.release();
        
        const order = {
            id: orderId,
            items,
            total,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        res.status(201).json(order);
    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
}));

// 14. GET /api/orders - Lấy danh sách đơn hàng
app.get('/api/orders', asyncHandler(async (req, res) => {
    const customerId = req.query.customer_id;
    
    let query = `
        SELECT o.*, c.name as customer_name, c.email
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
    `;
    
    const params = [];
    
    if (customerId) {
        query += ' WHERE o.customer_id = ?';
        params.push(customerId);
    }
    
    query += ' ORDER BY o.order_date DESC';
    
    const [orders] = await pool.query(query, params);
    
    res.json(orders);
}));

// 15. GET /api/stats - Lấy thống kê
app.get('/api/stats', asyncHandler(async (req, res) => {
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [orderCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [revenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
    const [lowStock] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock < 10');
    
    const [categories] = await pool.query(`
        SELECT c.name, COUNT(p.id) as count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id, c.name
    `);
    
    const categoryStats = {};
    categories.forEach(cat => {
        categoryStats[cat.name] = cat.count;
    });
    
    const stats = {
        totalProducts: productCount[0].count,
        totalOrders: orderCount[0].count,
        totalRevenue: revenue[0].total || 0,
        lowStockProducts: lowStock[0].count,
        categories: categoryStats
    };
    
    res.json(stats);
}));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Lỗi máy chủ nội bộ',
        message: err.message 
    });
});

// GET /api/products/:id/variants - Lấy variants của sản phẩm
app.get('/api/products/:id/variants', asyncHandler(async (req, res) => {
    const [variants] = await pool.query(`
        SELECT id, size, color, color_code, stock
        FROM product_variants
        WHERE product_id = ?
        ORDER BY 
            CASE size
                WHEN '38' THEN 1
                WHEN '39' THEN 2
                WHEN '40' THEN 3
                WHEN '41' THEN 4
                WHEN '42' THEN 5
                WHEN '43' THEN 6
                WHEN '44' THEN 7
                WHEN '45' THEN 8
                ELSE 9
            END,
            color
    `, [req.params.id]);

    res.json(variants);
}));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Không tìm thấy endpoint' });
});

// Start server
async function startServer() {
    await initializeData();
    app.listen(PORT, () => {
        console.log(`Server đang chạy tại http://localhost:${PORT}`);
        console.log(`API endpoint: http://localhost:${PORT}/api`);
    });
}

startServer();
