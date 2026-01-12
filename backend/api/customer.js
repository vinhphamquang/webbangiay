const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('./auth');

// Áp dụng middleware xác thực cho tất cả routes
router.use(authenticateToken);

// ============ QUẢN LÝ HỒ SƠ ============

// GET /api/customer/profile - Lấy thông tin cá nhân
router.get('/profile', async (req, res) => {
    try {
        const [customers] = await pool.query(
            'SELECT * FROM customers WHERE user_id = ?',
            [req.user.userId]
        );

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin khách hàng' });
        }

        res.json(customers[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Lỗi lấy thông tin cá nhân' });
    }
});

// PUT /api/customer/profile - Cập nhật thông tin cá nhân
router.put('/profile', async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const [result] = await pool.query(
            'UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE user_id = ?',
            [name, phone, address, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin khách hàng' });
        }

        const [customers] = await pool.query('SELECT * FROM customers WHERE user_id = ?', [req.user.userId]);
        res.json(customers[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Lỗi cập nhật thông tin cá nhân' });
    }
});

// ============ GIỎ HÀNG ============

// GET /api/customer/cart - Lấy giỏ hàng
router.get('/cart', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, p.name, p.price, p.image, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.customer_id = ?
        `, [req.user.customerId]);

        const items = rows.map(row => ({
            id: row.id,
            product: {
                id: row.product_id,
                name: row.name,
                price: parseFloat(row.price),
                image: row.image,
                stock: row.stock
            },
            quantity: row.quantity,
            size: row.size || '42'
        }));

        const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        res.json({ items, total });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Lỗi lấy giỏ hàng' });
    }
});

// POST /api/customer/cart - Thêm sản phẩm vào giỏ hàng
router.post('/cart', async (req, res) => {
    try {
        const { productId, quantity, size } = req.body;

        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ error: 'Thông tin không hợp lệ' });
        }

        const selectedSize = size || '42';

        // Kiểm tra sản phẩm và tồn kho
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }

        if (products[0].stock < quantity) {
            return res.status(400).json({ error: 'Không đủ hàng trong kho' });
        }

        // Kiểm tra sản phẩm với size đã có trong giỏ hàng chưa
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE customer_id = ? AND product_id = ? AND size = ?',
            [req.user.customerId, productId, selectedSize]
        );

        if (existing.length > 0) {
            const newQuantity = existing[0].quantity + quantity;
            if (products[0].stock < newQuantity) {
                return res.status(400).json({ error: 'Không đủ hàng trong kho' });
            }
            
            await pool.query(
                'UPDATE cart SET quantity = ? WHERE customer_id = ? AND product_id = ? AND size = ?',
                [newQuantity, req.user.customerId, productId, selectedSize]
            );
        } else {
            await pool.query(
                'INSERT INTO cart (customer_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
                [req.user.customerId, productId, quantity, selectedSize]
            );
        }

        // Trả về giỏ hàng đã cập nhật
        const [rows] = await pool.query(`
            SELECT c.*, p.name, p.price, p.image, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.customer_id = ?
        `, [req.user.customerId]);

        const items = rows.map(row => ({
            id: row.id,
            product: {
                id: row.product_id,
                name: row.name,
                price: parseFloat(row.price),
                image: row.image,
                stock: row.stock
            },
            quantity: row.quantity,
            size: row.size || '42'
        }));

        const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        res.json({ items, total });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Lỗi thêm vào giỏ hàng' });
    }
});

// PUT /api/customer/cart/:id - Cập nhật số lượng và size
router.put('/cart/:id', async (req, res) => {
    try {
        const { quantity, size } = req.body;

        if (quantity && quantity < 1) {
            return res.status(400).json({ error: 'Số lượng không hợp lệ' });
        }

        // Lấy thông tin cart item hiện tại
        const [cartItems] = await pool.query(
            'SELECT * FROM cart WHERE id = ? AND customer_id = ?',
            [req.params.id, req.user.customerId]
        );

        if (cartItems.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' });
        }

        const cartItem = cartItems[0];

        // Kiểm tra tồn kho
        const [products] = await pool.query('SELECT stock FROM products WHERE id = ?', [cartItem.product_id]);
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }

        const newQuantity = quantity || cartItem.quantity;
        const newSize = size || cartItem.size;

        if (products[0].stock < newQuantity) {
            return res.status(400).json({ error: 'Không đủ hàng trong kho' });
        }

        await pool.query(
            'UPDATE cart SET quantity = ?, size = ? WHERE id = ? AND customer_id = ?',
            [newQuantity, newSize, req.params.id, req.user.customerId]
        );

        // Trả về giỏ hàng đã cập nhật
        const [rows] = await pool.query(`
            SELECT c.*, p.name, p.price, p.image, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.customer_id = ?
        `, [req.user.customerId]);

        const items = rows.map(row => ({
            id: row.id,
            product: {
                id: row.product_id,
                name: row.name,
                price: parseFloat(row.price),
                image: row.image,
                stock: row.stock
            },
            quantity: row.quantity,
            size: row.size || '42'
        }));

        const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        res.json({ items, total });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Lỗi cập nhật giỏ hàng' });
    }
});

// DELETE /api/customer/cart/:id - Xóa sản phẩm khỏi giỏ hàng
router.delete('/cart/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM cart WHERE id = ? AND customer_id = ?',
            [req.params.id, req.user.customerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' });
        }

        res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
    } catch (error) {
        console.error('Delete from cart error:', error);
        res.status(500).json({ error: 'Lỗi xóa khỏi giỏ hàng' });
    }
});

// ============ ĐẶT HÀNG ============

// POST /api/customer/orders - Tạo đơn hàng
router.post('/orders', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { shippingAddress, paymentMethod, notes } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({ error: 'Thiếu địa chỉ giao hàng' });
        }

        await connection.beginTransaction();

        // Lấy giỏ hàng
        const [cartItems] = await connection.query(`
            SELECT c.*, p.name, p.price, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.customer_id = ?
        `, [req.user.customerId]);

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Giỏ hàng trống' });
        }

        // Kiểm tra tồn kho
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ error: `Không đủ hàng cho sản phẩm ${item.name}` });
            }
        }

        // Tính tổng tiền
        const totalAmount = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        // Tạo đơn hàng
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_id, total_amount, shipping_address, payment_method, notes) VALUES (?, ?, ?, ?, ?)',
            [req.user.customerId, totalAmount, shippingAddress, paymentMethod || 'COD', notes]
        );

        const orderId = orderResult.insertId;

        // Thêm chi tiết đơn hàng (KHÔNG giảm kho ở đây)
        for (const item of cartItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, item.size || '42']
            );
        }

        // Xóa giỏ hàng
        await connection.query('DELETE FROM cart WHERE customer_id = ?', [req.user.customerId]);

        await connection.commit();

        res.status(201).json({
            id: orderId,
            totalAmount,
            status: 'pending',
            message: 'Đặt hàng thành công'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Lỗi tạo đơn hàng' });
    } finally {
        connection.release();
    }
});

// GET /api/customer/orders - Lấy lịch sử đơn hàng
router.get('/orders', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT * FROM orders 
            WHERE customer_id = ? 
            ORDER BY order_date DESC
        `, [req.user.customerId]);

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Lỗi lấy lịch sử đơn hàng' });
    }
});

// GET /api/customer/orders/:id - Lấy chi tiết đơn hàng
router.get('/orders/:id', async (req, res) => {
    try {
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
            [req.params.id, req.user.customerId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        const [items] = await pool.query(`
            SELECT oi.*, p.name, p.image
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

// ============ ĐÁNH GIÁ SẢN PHẨM ============

// POST /api/customer/reviews - Tạo đánh giá
router.post('/reviews', async (req, res) => {
    try {
        const { productId, orderId, rating, comment } = req.body;

        if (!productId || !orderId || !rating) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Đánh giá phải từ 1-5 sao' });
        }

        // Kiểm tra đơn hàng có thuộc về khách hàng và đã hoàn thành
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND customer_id = ? AND status = "completed"',
            [orderId, req.user.customerId]
        );

        if (orders.length === 0) {
            return res.status(400).json({ error: 'Chỉ có thể đánh giá sản phẩm từ đơn hàng đã hoàn thành' });
        }

        // Kiểm tra sản phẩm có trong đơn hàng
        const [orderItems] = await pool.query(
            'SELECT * FROM order_items WHERE order_id = ? AND product_id = ?',
            [orderId, productId]
        );

        if (orderItems.length === 0) {
            return res.status(400).json({ error: 'Sản phẩm không có trong đơn hàng này' });
        }

        // Kiểm tra đã đánh giá chưa
        const [existing] = await pool.query(
            'SELECT * FROM reviews WHERE order_id = ? AND product_id = ? AND customer_id = ?',
            [orderId, productId, req.user.customerId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Bạn đã đánh giá sản phẩm này rồi' });
        }

        const [result] = await pool.query(
            'INSERT INTO reviews (product_id, customer_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [productId, req.user.customerId, orderId, rating, comment]
        );

        res.status(201).json({
            id: result.insertId,
            productId,
            rating,
            comment,
            message: 'Đánh giá thành công'
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Lỗi tạo đánh giá' });
    }
});

// GET /api/customer/reviews - Lấy đánh giá của khách hàng
router.get('/reviews', async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT r.*, p.name as product_name, p.image as product_image
            FROM reviews r
            LEFT JOIN products p ON r.product_id = p.id
            WHERE r.customer_id = ?
            ORDER BY r.created_at DESC
        `, [req.user.customerId]);

        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Lỗi lấy đánh giá' });
    }
});

module.exports = router;
