const API_URL = 'http://localhost:3001/api';
let token = localStorage.getItem('adminToken');
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
        currentUser = data.user;

        if (currentUser.role !== 'admin') {
            alert('Bạn không có quyền truy cập trang này');
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('adminName').textContent = currentUser.email;
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    }
}

// API helper
async function apiCall(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API Error');
    }

    return response.json();
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}-page`).classList.add('active');
        
        document.getElementById('pageTitle').textContent = item.textContent.trim();
        
        loadPageData(page);
    });
});

// Load page data
async function loadPageData(page) {
    switch(page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'categories':
            await loadCategories();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'customers':
            await loadCustomers();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'reviews':
            await loadReviews();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        const data = await apiCall('/admin/dashboard');
        
        document.getElementById('totalProducts').textContent = data.stats.totalProducts;
        document.getElementById('totalOrders').textContent = data.stats.totalOrders;
        document.getElementById('totalCustomers').textContent = data.stats.totalCustomers;
        document.getElementById('totalRevenue').textContent = 
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.stats.totalRevenue);
        
        // Recent orders
        const ordersHtml = data.recentOrders.map(order => `
            <div class="list-item">
                <strong>#${order.id}</strong> - ${order.customer_name}<br>
                <small>${new Date(order.order_date).toLocaleString('vi-VN')}</small><br>
                <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
            </div>
        `).join('');
        document.getElementById('recentOrders').innerHTML = ordersHtml || '<p>Chưa có đơn hàng</p>';
        
        // Top products
        const productsHtml = data.topProducts.map(product => `
            <div class="list-item">
                <strong>${product.name}</strong><br>
                <small>Đã bán: ${product.total_sold} sản phẩm</small>
            </div>
        `).join('');
        document.getElementById('topProducts').innerHTML = productsHtml || '<p>Chưa có dữ liệu</p>';
    } catch (error) {
        console.error('Load dashboard error:', error);
        alert('Lỗi tải dashboard');
    }
}

// Categories
async function loadCategories() {
    try {
        const categories = await apiCall('/admin/categories');
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên danh mục</th>
                        <th>Mô tả</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(cat => `
                        <tr>
                            <td>${cat.id}</td>
                            <td>${cat.name}</td>
                            <td>${cat.description || ''}</td>
                            <td>
                                <button class="btn-secondary" onclick="editCategory(${cat.id})">Sửa</button>
                                <button class="btn-danger" onclick="deleteCategory(${cat.id})">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('categoriesList').innerHTML = html;
    } catch (error) {
        console.error('Load categories error:', error);
        alert('Lỗi tải danh mục');
    }
}

// Products
async function loadProducts() {
    try {
        const data = await apiCall('/admin/products');
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Danh mục</th>
                        <th>Tồn kho</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.products.map(product => `
                        <tr>
                            <td>${product.id}</td>
                            <td>${product.name}</td>
                            <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</td>
                            <td>${product.category_name || ''}</td>
                            <td>${product.stock}</td>
                            <td>
                                <button class="btn-secondary" onclick="editProduct(${product.id})">Sửa</button>
                                <button class="btn-danger" onclick="deleteProduct(${product.id})">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('productsList').innerHTML = html;
    } catch (error) {
        console.error('Load products error:', error);
        alert('Lỗi tải sản phẩm');
    }
}

// Customers
async function loadCustomers() {
    try {
        const customers = await apiCall('/admin/customers');
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Tổng đơn</th>
                        <th>Tổng chi tiêu</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(customer => `
                        <tr>
                            <td>${customer.id}</td>
                            <td>${customer.name}</td>
                            <td>${customer.email}</td>
                            <td>${customer.phone || 'N/A'}</td>
                            <td>${customer.total_orders}</td>
                            <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.total_spent)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('customersList').innerHTML = html;
    } catch (error) {
        console.error('Load customers error:', error);
        alert('Lỗi tải khách hàng');
    }
}

// Orders
async function loadOrders(status = '') {
    try {
        const endpoint = status ? `/admin/orders?status=${status}` : '/admin/orders';
        const orders = await apiCall(endpoint);
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày đặt</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.customer_name}</td>
                            <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}</td>
                            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
                            <td>${new Date(order.order_date).toLocaleString('vi-VN')}</td>
                            <td>
                                <button class="btn-secondary" onclick="viewOrder(${order.id})">Xem</button>
                                <select onchange="updateOrderStatus(${order.id}, this.value)">
                                    <option value="">Đổi trạng thái</option>
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="processing">Đang xử lý</option>
                                    <option value="completed">Hoàn thành</option>
                                    <option value="cancelled">Hủy</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('ordersList').innerHTML = html;
    } catch (error) {
        console.error('Load orders error:', error);
        alert('Lỗi tải đơn hàng');
    }
}

// Reviews
async function loadReviews(status = '') {
    try {
        const endpoint = status ? `/admin/reviews?status=${status}` : '/admin/reviews';
        const reviews = await apiCall(endpoint);
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sản phẩm</th>
                        <th>Khách hàng</th>
                        <th>Đánh giá</th>
                        <th>Nhận xét</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviews.map(review => `
                        <tr>
                            <td>${review.id}</td>
                            <td>${review.product_name}</td>
                            <td>${review.customer_name}</td>
                            <td>${'⭐'.repeat(review.rating)}</td>
                            <td>${review.comment || ''}</td>
                            <td><span class="status-badge status-${review.status}">${getReviewStatusText(review.status)}</span></td>
                            <td>
                                <button class="btn-success" onclick="updateReviewStatus(${review.id}, 'approved')">Duyệt</button>
                                <button class="btn-danger" onclick="updateReviewStatus(${review.id}, 'rejected')">Từ chối</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('reviewsList').innerHTML = html;
    } catch (error) {
        console.error('Load reviews error:', error);
        alert('Lỗi tải đánh giá');
    }
}

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

// Update order status
async function updateOrderStatus(orderId, status) {
    if (!status) return;
    
    try {
        await apiCall(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        alert('Cập nhật trạng thái thành công');
        loadOrders();
    } catch (error) {
        console.error('Update order status error:', error);
        alert('Lỗi cập nhật trạng thái');
    }
}

// Update review status
async function updateReviewStatus(reviewId, status) {
    try {
        await apiCall(`/admin/reviews/${reviewId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        alert('Cập nhật trạng thái thành công');
        loadReviews();
    } catch (error) {
        console.error('Update review status error:', error);
        alert('Lỗi cập nhật trạng thái');
    }
}

// View order detail
async function viewOrder(orderId) {
    try {
        const data = await apiCall(`/admin/orders/${orderId}`);
        
        const html = `
            <h3>Đơn hàng #${data.order.id}</h3>
            <p><strong>Khách hàng:</strong> ${data.order.customer_name}</p>
            <p><strong>Email:</strong> ${data.order.email}</p>
            <p><strong>Số điện thoại:</strong> ${data.order.phone || 'N/A'}</p>
            <p><strong>Địa chỉ:</strong> ${data.order.shipping_address}</p>
            <p><strong>Trạng thái:</strong> <span class="status-badge status-${data.order.status}">${getStatusText(data.order.status)}</span></p>
            <p><strong>Ngày đặt:</strong> ${new Date(data.order.order_date).toLocaleString('vi-VN')}</p>
            
            <h4>Sản phẩm:</h4>
            <table>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th>Tổng</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td>${item.product_name}</td>
                            <td>${item.quantity}</td>
                            <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                            <td>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h3>Tổng cộng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.order.total_amount)}</h3>
        `;
        
        document.getElementById('orderDetail').innerHTML = html;
        document.getElementById('orderModal').classList.add('show');
    } catch (error) {
        console.error('View order error:', error);
        alert('Lỗi xem chi tiết đơn hàng');
    }
}

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
});

document.getElementById('orderStatusFilter').addEventListener('change', (e) => {
    loadOrders(e.target.value);
});

document.getElementById('reviewStatusFilter').addEventListener('change', (e) => {
    loadReviews(e.target.value);
});

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').classList.remove('show');
    });
});

// Initialize
checkAuth().then(() => {
    loadDashboard();
});
