const API_URL = 'http://localhost:3001/api';
let token = localStorage.getItem('userToken');
let currentUser = null;

// Check authentication
async function checkAuth() {
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        currentUser = data;
        
        displayUserInfo();
        loadProfile();
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('userToken');
        window.location.href = 'login.html';
    }
}

// Display user info in sidebar
function displayUserInfo() {
    const name = currentUser.customer?.name || currentUser.user.email.split('@')[0];
    const email = currentUser.user.email;
    
    document.getElementById('userName').textContent = name;
    document.getElementById('userEmail').textContent = email;
    document.getElementById('avatarInitial').textContent = name.charAt(0).toUpperCase();
    
    // Show admin link if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
        document.getElementById('adminNavLink').style.display = 'block';
    }
}

// Load profile data
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/customer/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const profile = await response.json();
        displayProfile(profile);
    } catch (error) {
        console.error('Load profile error:', error);
        showMessage('error', 'Lỗi tải thông tin hồ sơ');
    }
}

// Display profile
function displayProfile(profile) {
    document.getElementById('displayName').textContent = profile.name || '-';
    document.getElementById('displayEmail').textContent = profile.email || '-';
    document.getElementById('displayPhone').textContent = profile.phone || '-';
    document.getElementById('displayAddress').textContent = profile.address || '-';
    
    document.getElementById('editName').value = profile.name || '';
    document.getElementById('editEmail').value = profile.email || '';
    document.getElementById('editPhone').value = profile.phone || '';
    document.getElementById('editAddress').value = profile.address || '';
}

// Tab navigation
document.querySelectorAll('.profile-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        
        // Update active nav
        document.querySelectorAll('.profile-nav .nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Update active tab
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        // Load tab data
        if (tab === 'orders') {
            loadOrders();
        } else if (tab === 'reviews') {
            loadReviews();
        }
    });
});

// Edit mode toggle
document.getElementById('editBtn').addEventListener('click', () => {
    document.getElementById('viewMode').style.display = 'none';
    document.getElementById('editMode').style.display = 'block';
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('editMode').style.display = 'none';
    document.getElementById('viewMode').style.display = 'block';
});

// Update profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('editName').value;
    const phone = document.getElementById('editPhone').value;
    const address = document.getElementById('editAddress').value;
    
    try {
        const response = await fetch(`${API_URL}/customer/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, phone, address })
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const profile = await response.json();
        displayProfile(profile);
        
        document.getElementById('editMode').style.display = 'none';
        document.getElementById('viewMode').style.display = 'block';
        
        showMessage('success', 'Cập nhật thông tin thành công!');
        
        // Update sidebar
        document.getElementById('userName').textContent = profile.name;
        document.getElementById('avatarInitial').textContent = profile.name.charAt(0).toUpperCase();
    } catch (error) {
        console.error('Update profile error:', error);
        showMessage('error', 'Lỗi cập nhật thông tin');
    }
});

// Load orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/customer/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Load orders error:', error);
        document.getElementById('ordersList').innerHTML = '<div class="empty-state"><span>📦</span><p>Lỗi tải đơn hàng</p></div>';
    }
}

// Display orders
function displayOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><span>📦</span><p>Bạn chưa có đơn hàng nào</p></div>';
        return;
    }
    
    const html = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">Đơn hàng #${order.id}</div>
                <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
            </div>
            <div class="order-info">
                <div class="order-info-item">
                    <label>Ngày đặt</label>
                    <span>${new Date(order.order_date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="order-info-item">
                    <label>Tổng tiền</label>
                    <span>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</span>
                </div>
                <div class="order-info-item">
                    <label>Phương thức</label>
                    <span>${order.payment_method || 'COD'}</span>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn-secondary" onclick="viewOrderDetail(${order.id})">Xem chi tiết</button>
                ${order.status === 'completed' ? `<button class="btn-primary" onclick="showReviewModal(${order.id})">Đánh giá</button>` : ''}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// View order detail
async function viewOrderDetail(orderId) {
    try {
        const response = await fetch(`${API_URL}/customer/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load order detail');
        }

        const data = await response.json();
        
        const html = `
            <div class="order-detail">
                <h3>Đơn hàng #${data.order.id}</h3>
                <p><strong>Trạng thái:</strong> <span class="order-status status-${data.order.status}">${getStatusText(data.order.status)}</span></p>
                <p><strong>Ngày đặt:</strong> ${new Date(data.order.order_date).toLocaleString('vi-VN')}</p>
                <p><strong>Địa chỉ giao hàng:</strong> ${data.order.shipping_address}</p>
                ${data.order.notes ? `<p><strong>Ghi chú:</strong> ${data.order.notes}</p>` : ''}
                
                <h4 style="margin-top: 20px;">Sản phẩm:</h4>
                <table style="width: 100%; margin-top: 10px;">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Giá</th>
                            <th>Tổng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                                <td style="text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h3 style="margin-top: 20px; text-align: right;">Tổng cộng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.order.total_amount)}</h3>
            </div>
        `;
        
        document.getElementById('orderDetail').innerHTML = html;
        document.getElementById('orderModal').classList.add('show');
    } catch (error) {
        console.error('View order detail error:', error);
        alert('Lỗi xem chi tiết đơn hàng');
    }
}

// Load reviews
async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/customer/reviews`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }

        const reviews = await response.json();
        displayReviews(reviews);
    } catch (error) {
        console.error('Load reviews error:', error);
        document.getElementById('reviewsList').innerHTML = '<div class="empty-state"><span>⭐</span><p>Lỗi tải đánh giá</p></div>';
    }
}

// Display reviews
function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    
    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-state"><span>⭐</span><p>Bạn chưa có đánh giá nào</p></div>';
        return;
    }
    
    const html = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-product">${review.product_name}</div>
                <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
            </div>
            <div class="review-comment">${review.comment || 'Không có nhận xét'}</div>
            <div class="review-date">
                ${new Date(review.created_at).toLocaleDateString('vi-VN')} - 
                <span class="order-status status-${review.status}">${getReviewStatusText(review.status)}</span>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Change password
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showMessage('error', 'Mật khẩu mới không khớp');
        return;
    }
    
    // TODO: Implement change password API
    showMessage('error', 'Chức năng đổi mật khẩu chưa được triển khai');
});

// Helper functions
function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function getReviewStatusText(status) {
    const statusMap = {
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'rejected': 'Từ chối'
    };
    return statusMap[status] || status;
}

function showMessage(type, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    setTimeout(() => messageDiv.remove(), 5000);
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('userToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
});

// Close modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('orderModal').classList.remove('show');
});

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').classList.remove('show');
    });
});

// Add review button
document.getElementById('addReviewBtn').addEventListener('click', () => {
    loadAvailableProductsForReview();
});

// Load available products for review
async function loadAvailableProductsForReview() {
    try {
        // Get all completed orders
        const response = await fetch(`${API_URL}/customer/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const orders = await response.json();
        const completedOrders = orders.filter(o => o.status === 'completed');

        if (completedOrders.length === 0) {
            alert('Bạn chưa có đơn hàng nào hoàn thành để đánh giá');
            return;
        }

        // Get all products from completed orders
        const productsMap = new Map();
        
        for (const order of completedOrders) {
            const detailResponse = await fetch(`${API_URL}/customer/orders/${order.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (detailResponse.ok) {
                const data = await detailResponse.json();
                data.items.forEach(item => {
                    const key = `${order.id}-${item.product_id}`;
                    if (!productsMap.has(key)) {
                        productsMap.set(key, {
                            orderId: order.id,
                            productId: item.product_id,
                            productName: item.name,
                            productImage: item.image,
                            orderDate: order.order_date
                        });
                    }
                });
            }
        }

        displayAvailableProducts(Array.from(productsMap.values()));
    } catch (error) {
        console.error('Load available products error:', error);
        alert('Lỗi tải danh sách sản phẩm');
    }
}

// Display available products
function displayAvailableProducts(products) {
    const container = document.getElementById('availableProducts');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="empty-state">Không có sản phẩm nào để đánh giá</p>';
        document.getElementById('availableReviewModal').classList.add('show');
        return;
    }
    
    const html = products.map(product => `
        <div class="available-product-item" onclick="openReviewForm(${product.orderId}, ${product.productId})">
            <img src="${product.productImage || 'https://via.placeholder.com/80'}" alt="${product.productName}">
            <div class="available-product-info">
                <h4>${product.productName}</h4>
                <p class="order-info">Đơn hàng #${product.orderId} - ${new Date(product.orderDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <button class="btn-review-product" onclick="event.stopPropagation(); openReviewForm(${product.orderId}, ${product.productId})">
                Đánh giá
            </button>
        </div>
    `).join('');
    
    container.innerHTML = html;
    document.getElementById('availableReviewModal').classList.add('show');
}

// Open review form for specific product
async function openReviewForm(orderId, productId) {
    document.getElementById('availableReviewModal').classList.remove('show');
    
    try {
        const response = await fetch(`${API_URL}/customer/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load order');
        }

        const data = await response.json();
        const item = data.items.find(i => i.product_id === productId);
        
        if (!item) {
            throw new Error('Product not found');
        }
        
        // Display single product review form
        const html = `
            <div class="review-product-item">
                <div class="review-product-info">
                    <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
                    <div>
                        <h4>${item.name}</h4>
                        <p>Đơn hàng #${orderId}</p>
                    </div>
                </div>
                <div class="review-form">
                    <div class="rating-input">
                        <label>Đánh giá:</label>
                        <div class="star-rating" data-product-id="${productId}">
                            ${[5,4,3,2,1].map(star => `
                                <input type="radio" id="star${star}-${productId}" name="rating-${productId}" value="${star}">
                                <label for="star${star}-${productId}">⭐</label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="comment-input">
                        <label>Nhận xét:</label>
                        <textarea id="comment-${productId}" rows="4" placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."></textarea>
                    </div>
                    <button class="btn-primary" onclick="submitReview(${orderId}, ${productId})">Gửi đánh giá</button>
                </div>
            </div>
        `;
        
        document.getElementById('reviewProducts').innerHTML = html;
        document.getElementById('reviewModal').classList.add('show');
    } catch (error) {
        console.error('Open review form error:', error);
        alert('Lỗi tải thông tin sản phẩm');
    }
}

// Show review modal
async function showReviewModal(orderId) {
    try {
        const response = await fetch(`${API_URL}/customer/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load order');
        }

        const data = await response.json();
        
        // Display products for review
        const html = data.items.map(item => `
            <div class="review-product-item">
                <div class="review-product-info">
                    <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
                    <div>
                        <h4>${item.name}</h4>
                        <p>Số lượng: ${item.quantity}</p>
                    </div>
                </div>
                <div class="review-form">
                    <div class="rating-input">
                        <label>Đánh giá:</label>
                        <div class="star-rating" data-product-id="${item.product_id}">
                            ${[5,4,3,2,1].map(star => `
                                <input type="radio" id="star${star}-${item.product_id}" name="rating-${item.product_id}" value="${star}">
                                <label for="star${star}-${item.product_id}">⭐</label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="comment-input">
                        <label>Nhận xét:</label>
                        <textarea id="comment-${item.product_id}" rows="3" placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."></textarea>
                    </div>
                    <button class="btn-primary" onclick="submitReview(${orderId}, ${item.product_id})">Gửi đánh giá</button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('reviewProducts').innerHTML = html;
        document.getElementById('reviewModal').classList.add('show');
    } catch (error) {
        console.error('Show review modal error:', error);
        alert('Lỗi tải thông tin đơn hàng');
    }
}

// Submit review
async function submitReview(orderId, productId) {
    const ratingInput = document.querySelector(`input[name="rating-${productId}"]:checked`);
    const comment = document.getElementById(`comment-${productId}`).value;
    
    if (!ratingInput) {
        alert('Vui lòng chọn số sao đánh giá');
        return;
    }
    
    const rating = parseInt(ratingInput.value);
    
    try {
        const response = await fetch(`${API_URL}/customer/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId,
                orderId,
                rating,
                comment
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Lỗi gửi đánh giá');
        }

        showMessage('success', 'Đánh giá thành công! Cảm ơn bạn đã đánh giá sản phẩm.');
        document.getElementById('reviewModal').classList.remove('show');
        
        // Reload reviews if on reviews tab
        if (document.getElementById('reviews-tab').classList.contains('active')) {
            loadReviews();
        }
    } catch (error) {
        console.error('Submit review error:', error);
        alert(error.message);
    }
}

// Initialize
checkAuth();
