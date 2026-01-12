const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'adidas-shop-secret-key-2024';

// Middleware xác thực token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Không có token xác thực' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token không hợp lệ' });
        }
        req.user = user;
        next();
    });
}

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    }
    next();
}

// POST /api/auth/register - Đăng ký tài khoản
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Kiểm tra email đã tồn tại
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email đã được sử dụng' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user
        const [userResult] = await pool.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'customer']
        );

        // Tạo customer profile
        await pool.query(
            'INSERT INTO customers (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [userResult.insertId, name, email, phone || null, address || null]
        );

        res.status(201).json({ 
            message: 'Đăng ký thành công',
            userId: userResult.insertId 
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Lỗi đăng ký tài khoản' });
    }
});

// POST /api/auth/login - Đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Thiếu email hoặc password' });
        }

        // Tìm user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        const user = users[0];

        // Kiểm tra password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        // Lấy hoặc tạo customer profile (cả admin cũng cần customer profile để mua hàng)
        let [customers] = await pool.query('SELECT * FROM customers WHERE user_id = ?', [user.id]);
        let customer = customers[0];

        // Nếu chưa có customer profile (ví dụ: admin), tạo mới
        if (!customer) {
            const name = user.email.split('@')[0];
            const [result] = await pool.query(
                'INSERT INTO customers (user_id, name, email) VALUES (?, ?, ?)',
                [user.id, name, user.email]
            );
            
            [customers] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
            customer = customers[0];
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, customerId: customer.id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                customerId: customer.id,
                name: customer.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi đăng nhập' });
    }
});

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [req.user.userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy user' });
        }

        const [customers] = await pool.query('SELECT * FROM customers WHERE user_id = ?', [req.user.userId]);
        
        res.json({
            user: users[0],
            customer: customers[0] || null
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Lỗi lấy thông tin user' });
    }
});

module.exports = { router, authenticateToken, requireAdmin };
