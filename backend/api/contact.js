const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// POST /api/contact - Gửi yêu cầu tư vấn (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email không hợp lệ' });
        }

        const [result] = await pool.query(
            'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone || null, subject, message]
        );

        res.status(201).json({
            success: true,
            message: 'Gửi yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
            contactId: result.insertId
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ error: 'Lỗi gửi yêu cầu tư vấn' });
    }
});

module.exports = router;
