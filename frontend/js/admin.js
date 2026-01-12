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
            localStorage.removeItem('adminToken');
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
        case 'contacts':
            await loadContacts();
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
        document.getElementById('pendingContacts').textContent = data.stats.pendingContacts || 0;
        
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

// Edit category
async function editCategory(id) {
    try {
        const categories = await apiCall('/categories');
        const category = categories.find(c => c.id === id);
        
        if (category) {
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description || '';
            document.getElementById('categoryModalTitle').textContent = 'Sửa danh mục';
            document.getElementById('categoryModal').classList.add('show');
        }
    } catch (error) {
        console.error('Edit category error:', error);
        alert('Lỗi tải thông tin danh mục');
    }
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    
    try {
        await apiCall(`/admin/categories/${id}`, { method: 'DELETE' });
        alert('Xóa danh mục thành công');
        loadCategories();
    } catch (error) {
        console.error('Delete category error:', error);
        alert('Lỗi: ' + error.message);
    }
}

// Show product modal
async function showProductModal(productId = null) {
    try {
        // Load categories for dropdown
        const categories = await apiCall('/categories');
        
        // Create modal HTML
        const modal = document.createElement('div');
        modal.id = 'productModal';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close">&times;</span>
                <h2>${productId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                <form id="productForm">
                    <input type="hidden" id="productId" value="${productId || ''}">
                    <div class="form-group">
                        <label>Tên sản phẩm *</label>
                        <input type="text" id="productName" required>
                    </div>
                    <div class="form-group">
                        <label>Giá *</label>
                        <input type="number" id="productPrice" required min="0">
                    </div>
                    <div class="form-group">
                        <label>Danh mục *</label>
                        <select id="productCategory" required>
                            <option value="">Chọn danh mục</option>
                            ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Hình ảnh sản phẩm *</label>
                        <div style="display: flex; gap: 10px; align-items: flex-start;">
                            <div style="flex: 1;">
                                <input type="file" id="productImageFile" accept="image/*" required style="margin-bottom: 10px;">
                                <input type="hidden" id="productImage" required>
                                <small style="color: #666; display: block; margin-top: 5px;">
                                    Upload ảnh từ máy tính (tối đa 5MB)
                                </small>
                            </div>
                            <div id="imagePreview" style="width: 100px; height: 100px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; display: none;">
                                <img id="previewImg" src="" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                        </div>
                        <div id="uploadProgress" style="display: none; margin-top: 10px;">
                            <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
                                <div id="progressBar" style="background: #4CAF50; height: 100%; width: 0%; transition: width 0.3s;"></div>
                            </div>
                            <small id="uploadStatus" style="color: #666;"></small>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Mô tả *</label>
                        <textarea id="productDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Số lượng *</label>
                        <input type="number" id="productStock" required min="0">
                    </div>
                    <button type="submit" class="btn-primary">Lưu</button>
                </form>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('productModal');
        if (existingModal) existingModal.remove();
        
        document.body.appendChild(modal);
        
        // Setup image upload handler
        const imageFileInput = document.getElementById('productImageFile');
        const imageUrlInput = document.getElementById('productImage');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        imageFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // Upload file
            await uploadProductImage(file);
        });
        
        // If editing, load product data
        if (productId) {
            const products = await apiCall('/products');
            const product = products.find(p => p.id === productId);
            
            if (product) {
                document.getElementById('productName').value = product.name;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productCategory').value = product.category_id;
                document.getElementById('productImage').value = product.image;
                document.getElementById('productDescription').value = product.description;
                document.getElementById('productStock').value = product.stock;
                
                // Show preview
                if (product.image) {
                    previewImg.src = product.image;
                    imagePreview.style.display = 'block';
                }
            }
        }
        
        // Close button
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
        // Form submit
        document.getElementById('productForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProduct();
            modal.remove();
        });
        
    } catch (error) {
        console.error('Show product modal error:', error);
        alert('Lỗi: ' + error.message);
    }
}

// Upload product image
async function uploadProductImage(file) {
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const uploadStatus = document.getElementById('uploadStatus');
    const imageUrlInput = document.getElementById('productImage');
    
    try {
        uploadProgress.style.display = 'block';
        uploadStatus.textContent = 'Đang upload...';
        progressBar.style.width = '30%';
        
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${API_URL}/admin/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        progressBar.style.width = '70%';
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload thất bại');
        }
        
        const data = await response.json();
        
        // Update image URL input
        imageUrlInput.value = data.imageUrl;
        
        progressBar.style.width = '100%';
        uploadStatus.textContent = 'Upload thành công!';
        uploadStatus.style.color = '#4CAF50';
        
        setTimeout(() => {
            uploadProgress.style.display = 'none';
            progressBar.style.width = '0%';
            uploadStatus.style.color = '#666';
        }, 2000);
        
    } catch (error) {
        console.error('Upload error:', error);
        uploadStatus.textContent = 'Lỗi: ' + error.message;
        uploadStatus.style.color = '#f44336';
        progressBar.style.width = '0%';
    }
}

// Save product
async function saveProduct() {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const category_id = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value;
    const description = document.getElementById('productDescription').value;
    const stock = document.getElementById('productStock').value;
    
    try {
        if (id) {
            // Update
            await apiCall(`/admin/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, price, category_id, image, description, stock })
            });
            alert('Cập nhật sản phẩm thành công');
        } else {
            // Create
            await apiCall('/admin/products', {
                method: 'POST',
                body: JSON.stringify({ name, price, category_id, image, description, stock })
            });
            alert('Thêm sản phẩm thành công');
        }
        
        loadProducts();
    } catch (error) {
        console.error('Save product error:', error);
        alert('Lỗi: ' + error.message);
    }
}

// Edit product
function editProduct(id) {
    showProductModal(id);
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
        await apiCall(`/admin/products/${id}`, { method: 'DELETE' });
        alert('Xóa sản phẩm thành công');
        loadProducts();
    } catch (error) {
        console.error('Delete product error:', error);
        alert('Lỗi: ' + error.message);
    }
}

// Contacts
async function loadContacts(status = '') {
    try {
        const endpoint = status ? `/admin/contacts?status=${status}` : '/admin/contacts';
        const contacts = await apiCall(endpoint);
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Số ĐT</th>
                        <th>Chủ đề</th>
                        <th>Trạng thái</th>
                        <th>Ngày gửi</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${contacts.map(contact => `
                        <tr>
                            <td>#${contact.id}</td>
                            <td>${contact.name}</td>
                            <td>${contact.email}</td>
                            <td>${contact.phone || 'N/A'}</td>
                            <td>${contact.subject}</td>
                            <td><span class="status-badge status-${contact.status}">${getContactStatusText(contact.status)}</span></td>
                            <td>${new Date(contact.created_at).toLocaleString('vi-VN')}</td>
                            <td>
                                <button class="btn-secondary" onclick="viewContact(${contact.id})">Xem</button>
                                <select onchange="updateContactStatus(${contact.id}, this.value)">
                                    <option value="">Đổi trạng thái</option>
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="processing">Đang xử lý</option>
                                    <option value="completed">Hoàn thành</option>
                                </select>
                                <button class="btn-danger" onclick="deleteContact(${contact.id})">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('contactsList').innerHTML = html;
    } catch (error) {
        console.error('Load contacts error:', error);
        alert('Lỗi tải liên hệ');
    }
}

// View contact detail
async function viewContact(contactId) {
    try {
        const contact = await apiCall(`/admin/contacts/${contactId}`);
        
        const html = `
            <div class="contact-detail">
                <p><strong>ID:</strong> #${contact.id}</p>
                <p><strong>Tên:</strong> ${contact.name}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Số điện thoại:</strong> ${contact.phone || 'N/A'}</p>
                <p><strong>Chủ đề:</strong> ${contact.subject}</p>
                <p><strong>Trạng thái:</strong> <span class="status-badge status-${contact.status}">${getContactStatusText(contact.status)}</span></p>
                <p><strong>Ngày gửi:</strong> ${new Date(contact.created_at).toLocaleString('vi-VN')}</p>
                <hr>
                <p><strong>Nội dung:</strong></p>
                <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 4px;">${contact.message}</p>
            </div>
        `;
        
        document.getElementById('contactDetail').innerHTML = html;
        document.getElementById('contactModal').classList.add('show');
    } catch (error) {
        console.error('View contact error:', error);
        alert('Lỗi xem chi tiết liên hệ');
    }
}

// Update contact status
async function updateContactStatus(contactId, status) {
    if (!status) return;
    
    try {
        await apiCall(`/admin/contacts/${contactId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        alert('Cập nhật trạng thái thành công');
        loadContacts();
    } catch (error) {
        console.error('Update contact status error:', error);
        alert('Lỗi cập nhật trạng thái');
    }
}

// Delete contact
async function deleteContact(contactId) {
    if (!confirm('Bạn có chắc muốn xóa liên hệ này?')) return;
    
    try {
        await apiCall(`/admin/contacts/${contactId}`, { method: 'DELETE' });
        alert('Xóa liên hệ thành công');
        loadContacts();
    } catch (error) {
        console.error('Delete contact error:', error);
        alert('Lỗi xóa liên hệ');
    }
}

function getContactStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'completed': 'Hoàn thành'
    };
    return statusMap[status] || status;
}

// Event listeners
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
});

// Add Category button
document.getElementById('addCategoryBtn').addEventListener('click', () => {
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDescription').value = '';
    document.getElementById('categoryModalTitle').textContent = 'Thêm danh mục';
    document.getElementById('categoryModal').classList.add('show');
});

// Add Product button
document.getElementById('addProductBtn').addEventListener('click', () => {
    showProductModal();
});

// Category form submit
document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;
    
    try {
        if (id) {
            // Update
            await apiCall(`/admin/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, description })
            });
            alert('Cập nhật danh mục thành công');
        } else {
            // Create
            await apiCall('/admin/categories', {
                method: 'POST',
                body: JSON.stringify({ name, description })
            });
            alert('Thêm danh mục thành công');
        }
        
        document.getElementById('categoryModal').classList.remove('show');
        loadCategories();
    } catch (error) {
        console.error('Save category error:', error);
        alert('Lỗi: ' + error.message);
    }
});

document.getElementById('orderStatusFilter').addEventListener('change', (e) => {
    loadOrders(e.target.value);
});

document.getElementById('reviewStatusFilter').addEventListener('change', (e) => {
    loadReviews(e.target.value);
});

document.getElementById('contactStatusFilter').addEventListener('change', (e) => {
    loadContacts(e.target.value);
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
