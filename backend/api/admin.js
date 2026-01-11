const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('./auth');

// Áp dụng middleware cho tất cả routes
router.use(authenticateToken);
router.use(requireAdmin);

// ============ QUẢN LÝ DANH MỤC ============

// GET /api/admin/categories - Lấy tất cả danh mục
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY id');
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Lỗi lấy danh mục' });
    }
});

// POST /api/admin/categories - Tạo danh mục mới
router.post('/categories', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Thiếu tên danh mục' });
        }

        const [result] = await pool.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            description
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Lỗi tạo danh mục' });
    }
});

// PUT /api/admin/categories/:id - Cập nhật danh mục
router.put('/categories/:id', async (req, res) => {
    try {
        const { name, description } = req.body;

        const [result] = await pool.query(
            'UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
            [name, description, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy danh mục' });
        }

        const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
        res.json(categories[0]);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Lỗi cập nhật danh mục' });
    }
});

// DELETE /api/admin/categories/:id - Xóa danh mục
router.delete('/categories/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy danh mục' });
        }

        res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Lỗi xóa danh mục' });
    }
});

// ============ QUẢN LÝ SẢN PHẨM ============

// GET /api/admin/products - Lấy tất cả sản phẩm (có phân trang)
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const [products] = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        const [total] = await pool.query('SELECT COUNT(*) as count FROM products');

        res.json({
            products,
            pagination: {
                page,
                limit,
                total: total[0].count,
                totalPages: Math.ceil(total[0].count / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Lỗi lấy sản phẩm' });
    }
});

// ============ QUẢN LÝ KHÁCH HÀNG ============

// GET /api/admin/customers - Lấy danh sách khách hàng
router.get('/customers', async (req, res) => {
    try {
        const [customers] = await pool.query(`
            SELECT c.*, u.email as user_email, u.created_at as registered_at,
                   COUNT(DISTINCT o.id) as total_orders,
                   COALESCE(SUM(o.total_amount), 0) as total_spent
            FROM customers c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN orders o ON c.id = o.customer_id
            GROUP BY c.id
            ORDER BY c.id DESC
        `);

        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Lỗi lấy danh sách khách hàng' });
    }
});

// GET /api/admin/customers/:id - Lấy chi tiết khách hàng
router.get('/customers/:id', async (req, res) => {
    try {
        const [customers] = await pool.query(`
            SELECT c.*, u.email, u.created_at as registered_at
            FROM customers c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [req.params.id]);

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
        }

        // Lấy đơn hàng của khách hàng
        const [orders] = await pool.query(`
            SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC
        `, [req.params.id]);

        res.json({
            customer: customers[0],
            orders
        });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Lỗi lấy thông tin khách hàng' });
    }
});

// PUT /api/admin/customers/:id - Cập nhật thông tin khách hàng
router.put('/customers/:id', async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const [result] = await pool.query(
            'UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?',
            [name, phone, address, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
        }

        const [customers] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        res.json(customers[0]);
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Lỗi cập nhật khách hàng' });
    }
});

// ============ QUẢN LÝ ĐỚN HÀNG ============

// GET /api/admin/orders - Lấy tất cả đơn hàng
router.get('/orders', async (req, res) => {
    try {
        const status = req.query.status;
        
        let query = `
            SELECT o.*, c.name as customer_name, c.email, c.phone
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
        `;
        
        const params = [];
        
        if (status) {
            query += ' WHERE o.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY o.order_date DESC';
        
        const [orders] = await pool.query(query, params);
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Lỗi lấy đơn hàng' });
    }
});

// GET /api/admin/orders/:id - Lấy chi tiết đơn hàng
router.get('/orders/:id', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.*, c.name as customer_name, c.email, c.phone, c.address
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ?
        `, [req.params.id]);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        const [items] = await pool.query(`
            SELECT oi.*, p.name as product_name, p.image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [req.params.id]);

        res.json({
            order: orders[0],
            items
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Lỗi lấy chi tiết đơn hàng' });
    }
});

// PUT /api/admin/orders/:id/status - Cập nhật trạng thái đơn hàng
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const [result] = await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        res.json(orders[0]);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Lỗi cập nhật trạng thái đơn hàng' });
    }
});

// ============ QUẢN LÝ ĐÁNH GIÁ ============

// GET /api/admin/reviews - Lấy tất cả đánh giá
router.get('/reviews', async (req, res) => {
    try {
        const status = req.query.status;
        
        let query = `
            SELECT r.*, p.name as product_name, c.name as customer_name
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN customers c ON r.customer_id = c.id
        `;
        
        const params = [];
        
        if (status) {
            query += ' WHERE r.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY r.created_at DESC';
        
        const [reviews] = await pool.query(query, params);
        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Lỗi lấy đánh giá' });
    }
});

// PUT /api/admin/reviews/:id/status - Cập nhật trạng thái đánh giá
router.put('/reviews/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const [result] = await pool.query(
            'UPDATE reviews SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
        }

        const [reviews] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
        res.json(reviews[0]);
    } catch (error) {
        console.error('Update review status error:', error);
        res.status(500).json({ error: 'Lỗi cập nhật trạng thái đánh giá' });
    }
});

// DELETE /api/admin/reviews/:id - Xóa đánh giá
router.delete('/reviews/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
        }

        res.json({ message: 'Xóa đánh giá thành công' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Lỗi xóa đánh giá' });
    }
});

// ============ THỐNG KÊ ============

// GET /api/admin/dashboard - Lấy thống kê tổng quan
router.get('/dashboard', async (req, res) => {
    try {
        const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
        const [orderCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [customerCount] = await pool.query('SELECT COUNT(*) as count FROM customers');
        const [revenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
        const [pendingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
        const [lowStock] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock < 10');
        
        const [recentOrders] = await pool.query(`
            SELECT o.*, c.name as customer_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            ORDER BY o.order_date DESC
            LIMIT 10
        `);

        const [topProducts] = await pool.query(`
            SELECT p.name, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status = 'completed'
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC
            LIMIT 5
        `);

        res.json({
            stats: {
                totalProducts: productCount[0].count,
                totalOrders: orderCount[0].count,
                totalCustomers: customerCount[0].count,
                totalRevenue: parseFloat(revenue[0].total || 0),
                pendingOrders: pendingOrders[0].count,
                lowStockProducts: lowStock[0].count
            },
            recentOrders,
            topProducts
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Lỗi lấy thống kê' });
    }
});

module.exports = router;
