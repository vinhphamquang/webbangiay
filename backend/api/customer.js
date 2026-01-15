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
            SELECT c.*, p.name, p.price, p.image, 
                   v.size, v.color, v.color_code, v.stock as variant_stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            LEFT JOIN product_variants v ON c.variant_id = v.id
            WHERE c.customer_id = ?
        `, [req.user.customerId]);

        const items = rows.map(row => ({
            id: row.id,
            product: {
                id: row.product_id,
                name: row.name,
                price: parseFloat(row.price),
                image: row.image
            },
            variant: {
                id: row.variant_id,
                size: row.size || '42',
                color: row.color || 'Đen',
                color_code: row.color_code || '#000000',
                stock: row.variant_stock || 0
            },
            quantity: row.quantity
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
        const { productId, quantity, variantId } = req.body;

        if (!productId || !quantity || quantity < 1 || !variantId) {
            return res.status(400).json({ error: 'Thông tin không hợp lệ' });
        }

        // Kiểm tra variant và tồn kho
        const [variants] = await pool.query(`
            SELECT v.*, p.name as product_name, p.price
            FROM product_variants v
            JOIN products p ON v.product_id = p.id
            WHERE v.id = ? AND v.product_id = ?
        `, [variantId, productId]);
        
        if (variants.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm với size/màu này' });
        }

        const variant = variants[0];

        if (variant.stock < quantity) {
            return res.status(400).json({ error: `Chỉ còn ${variant.stock} sản phẩm trong kho` });
        }

        // Kiểm tra variant đã có trong giỏ hàng chưa
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE customer_id = ? AND variant_id = ?',
            [req.user.customerId, variantId]
        );

        if (existing.length > 0) {
            const newQuantity = existing[0].quantity + quantity;
            if (variant.stock < newQuantity) {
                return res.status(400).json({ error: `Chỉ còn ${variant.stock} sản phẩm trong kho` });
            }
            
            await pool.query(
                'UPDATE cart SET quantity = ? WHERE customer_id = ? AND variant_id = ?',
                [newQuantity, req.user.customerId, variantId]
            );
        } else {
            await pool.query(
                'INSERT INTO cart (customer_id, product_id, variant_id, quantity, size, color) VALUES (?, ?, ?, ?, ?, ?)',
                [req.user.customerId, productId, variantId, quantity, variant.size, variant.color]
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

// PUT /api/customer/cart/:id - Cập nhật số lượng hoặc đổi variant
router.put('/cart/:id', async (req, res) => {
    try {
        const { quantity, variantId } = req.body;

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
        const targetVariantId = variantId || cartItem.variant_id;

        // Kiểm tra tồn kho của variant
        const [variants] = await pool.query(
            'SELECT * FROM product_variants WHERE id = ?',
            [targetVariantId]
        );
        
        if (variants.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy variant' });
        }

        const variant = variants[0];
        const newQuantity = quantity || cartItem.quantity;

        if (variant.stock < newQuantity) {
            return res.status(400).json({ error: `Chỉ còn ${variant.stock} sản phẩm trong kho` });
        }

        // Nếu đổi variant, kiểm tra xem variant mới đã có trong giỏ chưa
        if (variantId && variantId !== cartItem.variant_id) {
            const [existing] = await pool.query(
                'SELECT * FROM cart WHERE customer_id = ? AND variant_id = ? AND id != ?',
                [req.user.customerId, variantId, req.params.id]
            );

            if (existing.length > 0) {
                // Merge vào item đã có
                const totalQuantity = existing[0].quantity + newQuantity;
                if (variant.stock < totalQuantity) {
                    return res.status(400).json({ error: `Chỉ còn ${variant.stock} sản phẩm trong kho` });
                }
                
                await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [totalQuantity, existing[0].id]);
                await pool.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
            } else {
                // Cập nhật variant mới
                await pool.query(
                    'UPDATE cart SET quantity = ?, variant_id = ?, size = ?, color = ? WHERE id = ? AND customer_id = ?',
                    [newQuantity, variantId, variant.size, variant.color, req.params.id, req.user.customerId]
                );
            }
        } else {
            // Chỉ cập nhật số lượng
            await pool.query(
                'UPDATE cart SET quantity = ? WHERE id = ? AND customer_id = ?',
                [newQuantity, req.params.id, req.user.customerId]
            );
        }

        // Trả về giỏ hàng đã cập nhật
        const [rows] = await pool.query(`
            SELECT c.*, p.name, p.price, p.image,
                   v.size, v.color, v.color_code, v.stock as variant_stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            LEFT JOIN product_variants v ON c.variant_id = v.id
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

        // Lấy giỏ hàng (bao gồm variant_id và color)
        const [cartItems] = await connection.query(`
            SELECT c.*, p.name, p.price, pv.stock as variant_stock, pv.size, pv.color
            FROM cart c
            JOIN products p ON c.product_id = p.id
            LEFT JOIN product_variants pv ON c.variant_id = pv.id
            WHERE c.customer_id = ?
        `, [req.user.customerId]);

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Giỏ hàng trống' });
        }

        // Kiểm tra tồn kho (từ variant nếu có)
        for (const item of cartItems) {
            const stock = item.variant_id ? item.variant_stock : item.stock;
            if (stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({ 
                    error: `Không đủ hàng cho sản phẩm ${item.name}${item.size ? ` (Size ${item.size})` : ''}` 
                });
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

        // Thêm chi tiết đơn hàng (bao gồm variant_id và color, KHÔNG giảm kho ở đây)
        for (const item of cartItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, variant_id, color, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.variant_id, item.color, item.quantity, item.price]
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
            SELECT 
                oi.*, 
                p.name, 
                p.image,
                pv.size,
                pv.color,
                pv.color_code
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants pv ON oi.variant_id = pv.id
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

// ============ THÔNG BÁO LIÊN HỆ ============

// GET /api/customer/contact-replies - Lấy các phản hồi từ admin
router.get('/contact-replies', async (req, res) => {
    try {
        // Get customer info
        const [customers] = await pool.query(
            'SELECT email FROM customers WHERE user_id = ?',
            [req.user.userId]
        );

        if (customers.length === 0) {
            return res.json([]);
        }

        const customerEmail = customers[0].email;

        // Get contacts with admin replies (chỉ lấy chưa đọc)
        const [contacts] = await pool.query(`
            SELECT id, subject, message, admin_reply, reply_date, created_at, status, is_read
            FROM contacts
            WHERE email = ? AND admin_reply IS NOT NULL AND is_read = FALSE
            ORDER BY reply_date DESC
        `, [customerEmail]);

        res.json(contacts);
    } catch (error) {
        console.error('Get contact replies error:', error);
        res.status(500).json({ error: 'Lỗi lấy thông báo' });
    }
});

// GET /api/customer/contact-history - Lấy lịch sử phản hồi đã đọc
router.get('/contact-history', async (req, res) => {
    try {
        // Get customer info
        const [customers] = await pool.query(
            'SELECT email FROM customers WHERE user_id = ?',
            [req.user.userId]
        );

        if (customers.length === 0) {
            return res.json([]);
        }

        const customerEmail = customers[0].email;

        // Get contacts with admin replies that are read
        const [contacts] = await pool.query(`
            SELECT id, subject, message, admin_reply, reply_date, created_at, status, is_read
            FROM contacts
            WHERE email = ? AND admin_reply IS NOT NULL AND is_read = TRUE
            ORDER BY reply_date DESC
        `, [customerEmail]);

        res.json(contacts);
    } catch (error) {
        console.error('Get contact history error:', error);
        res.status(500).json({ error: 'Lỗi lấy lịch sử' });
    }
});

// GET /api/customer/unread-replies-count - Đếm số phản hồi chưa đọc
router.get('/unread-replies-count', async (req, res) => {
    try {
        // Get customer info
        const [customers] = await pool.query(
            'SELECT email FROM customers WHERE user_id = ?',
            [req.user.userId]
        );

        if (customers.length === 0) {
            return res.json({ count: 0 });
        }

        const customerEmail = customers[0].email;

        // Count contacts with admin replies that are unread
        const [result] = await pool.query(`
            SELECT COUNT(*) as count
            FROM contacts
            WHERE email = ? AND admin_reply IS NOT NULL AND is_read = FALSE
        `, [customerEmail]);

        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Get unread replies count error:', error);
        res.status(500).json({ error: 'Lỗi đếm thông báo' });
    }
});

// PUT /api/customer/contact-replies/:id/mark-read - Đánh dấu đã đọc
router.put('/contact-replies/:id/mark-read', async (req, res) => {
    try {
        // Get customer info
        const [customers] = await pool.query(
            'SELECT email FROM customers WHERE user_id = ?',
            [req.user.userId]
        );

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
        }

        const customerEmail = customers[0].email;

        // Update is_read status (chỉ cho phép đánh dấu contact của chính mình)
        const [result] = await pool.query(
            'UPDATE contacts SET is_read = TRUE WHERE id = ? AND email = ?',
            [req.params.id, customerEmail]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông báo' });
        }

        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Lỗi đánh dấu đã đọc' });
    }
});

module.exports = router;
