const API_URL = 'http://localhost:3001/api';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and load user info
    checkAuthAndLoadUser();
    
    // Handle contact form submission
    const contactForm = document.getElementById('myForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleSubmit);
    }
});

async function checkAuthAndLoadUser() {
    const token = localStorage.getItem('userToken');
    const authNav = document.getElementById('authNav');
    
    if (!authNav) return;
    
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const name = data.customer?.name || data.user.email.split('@')[0];
                const isAdmin = data.user.role === 'admin';
                
                if (isAdmin) {
                    authNav.innerHTML = `
                        <a href="admin.html" class="btn-admin" style="background: #ff6b00; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-right: 10px;">⚙️ Quản trị</a>
                        <a href="profile.html" class="btn-login">👤 ${name}</a>
                    `;
                } else {
                    authNav.innerHTML = `
                        <a href="profile.html" class="btn-login">👤 ${name}</a>
                    `;
                }
                
                // Load user info into form
                await loadUserInfo();
                
                // Load notifications
                await loadNotifications();
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
}

async function loadUserInfo() {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/customer/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const customer = await response.json();
            
            // Auto-fill form
            document.getElementById('nameInput').value = customer.name || '';
            document.getElementById('emailInput').value = customer.email || '';
            document.getElementById('phoneInput').value = customer.phone || '';
        }
    } catch (error) {
        console.error('Load user info error:', error);
    }
}

async function loadNotifications() {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/customer/contact-replies`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const replies = await response.json();
            
            if (replies.length > 0) {
                const notificationSection = document.getElementById('notificationSection');
                const notificationList = document.getElementById('notificationList');
                
                notificationSection.style.display = 'block';
                
                const html = replies.map(reply => `
                    <div class="notification-item">
                        <div class="notification-header">
                            <div class="notification-subject">📩 ${reply.subject}</div>
                            <div class="notification-date">${new Date(reply.reply_date).toLocaleString('vi-VN')}</div>
                        </div>
                        <div class="notification-message">
                            <strong>Câu hỏi của bạn:</strong><br>
                            ${reply.message}
                        </div>
                        <div class="notification-reply">
                            <div class="notification-reply-label">✓ Phản hồi từ Admin:</div>
                            <div class="notification-reply-text">${reply.admin_reply}</div>
                        </div>
                    </div>
                `).join('');
                
                notificationList.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Load notifications error:', error);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;
    const phone = document.getElementById('phoneInput').value;
    const subject = document.getElementById('subjectInput').value;
    const message = document.getElementById('messageInput').value;
    
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, subject, message })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Gửi yêu cầu thất bại');
        }
        
        const data = await response.json();
        
        // Show success message
        alert('✅ ' + data.message);
        
        // Only clear subject and message, keep user info
        document.getElementById('subjectInput').value = '';
        document.getElementById('messageInput').value = '';
        
    } catch (error) {
        console.error('Contact error:', error);
        alert('❌ ' + error.message);
    }
}
