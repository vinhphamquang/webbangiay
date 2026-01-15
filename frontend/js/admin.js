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
                                <button class="btn-secondary" onclick="manageVariants(${product.id}, '${product.name.replace(/'/g, "\\'")}')">Size/Màu</button>
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
        
        // Nếu đổi sang completed hoặc từ completed, reload products để cập nhật stock
        if (status === 'completed') {
            // Reload products nếu đang ở tab products
            const productsPage = document.getElementById('products-page');
            if (productsPage && productsPage.classList.contains('active')) {
                await loadProducts();
            }
        }
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
                        <th>Trả lời</th>
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
                            <td style="text-align: center;">
                                ${contact.admin_reply ? '<span style="color: #4CAF50; font-size: 18px;" title="Đã trả lời">✓</span>' : '<span style="color: #999;" title="Chưa trả lời">-</span>'}
                            </td>
                            <td>${new Date(contact.created_at).toLocaleString('vi-VN')}</td>
                            <td>
                                <button class="btn-secondary" onclick="viewContact(${contact.id})">${contact.admin_reply ? 'Xem' : 'Trả lời'}</button>
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
                
                ${contact.admin_reply ? `
                    <hr>
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 4px; border-left: 4px solid #4CAF50;">
                        <p><strong>✓ Đã trả lời:</strong></p>
                        <p style="white-space: pre-wrap; margin: 10px 0;">${contact.admin_reply}</p>
                        <small style="color: #666;">Ngày trả lời: ${new Date(contact.reply_date).toLocaleString('vi-VN')}</small>
                    </div>
                ` : `
                    <hr>
                    <form id="replyForm" style="margin-top: 20px;">
                        <div class="form-group">
                            <label><strong>Trả lời khách hàng:</strong></label>
                            <textarea id="replyMessage" rows="5" placeholder="Nhập nội dung trả lời..." required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                        </div>
                        <button type="submit" class="btn-primary" style="margin-top: 10px;">
                            📧 Gửi trả lời
                        </button>
                    </form>
                `}
            </div>
        `;
        
        document.getElementById('contactDetail').innerHTML = html;
        document.getElementById('contactModal').classList.add('show');
        
        // Add reply form handler if not replied yet
        if (!contact.admin_reply) {
            document.getElementById('replyForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await replyToContact(contactId);
            });
        }
    } catch (error) {
        console.error('View contact error:', error);
        alert('Lỗi xem chi tiết liên hệ');
    }
}

// Reply to contact
async function replyToContact(contactId) {
    const replyMessage = document.getElementById('replyMessage').value.trim();
    
    if (!replyMessage) {
        alert('Vui lòng nhập nội dung trả lời');
        return;
    }
    
    try {
        await apiCall(`/admin/contacts/${contactId}/reply`, {
            method: 'PUT',
            body: JSON.stringify({ admin_reply: replyMessage })
        });
        
        alert('✓ Đã gửi trả lời thành công!\nKhách hàng sẽ nhận được thông báo.');
        document.getElementById('contactModal').classList.remove('show');
        loadContacts();
    } catch (error) {
        console.error('Reply contact error:', error);
        alert('Lỗi gửi trả lời: ' + error.message);
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

// ===== REVENUE ANALYTICS =====

// Populate year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('revenueYear');
    const currentYear = new Date().getFullYear();
    
    yearSelect.innerHTML = '';
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `Năm ${year}`;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

// Handle period change
document.getElementById('revenuePeriod').addEventListener('change', (e) => {
    const monthSelect = document.getElementById('revenueMonth');
    if (e.target.value === 'week') {
        monthSelect.style.display = 'block';
        // Set current month
        monthSelect.value = new Date().getMonth() + 1;
    } else {
        monthSelect.style.display = 'none';
    }
});

// Load revenue data
async function loadRevenue() {
    const period = document.getElementById('revenuePeriod').value;
    const year = document.getElementById('revenueYear').value;
    const month = document.getElementById('revenueMonth').value;
    
    try {
        let endpoint = `/admin/revenue?period=${period}&year=${year}`;
        if (period === 'week') {
            endpoint += `&month=${month}`;
        }
        
        const data = await apiCall(endpoint);
        renderRevenueChart(data);
    } catch (error) {
        console.error('Load revenue error:', error);
        alert('Lỗi tải doanh thu');
    }
}

// Render revenue chart
function renderRevenueChart(data) {
    const chartDiv = document.getElementById('revenueChart');
    
    if (!data.data || data.data.length === 0) {
        chartDiv.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">Chưa có dữ liệu doanh thu</p>';
        return;
    }
    
    let labels = [];
    let title = '';
    
    if (data.period === 'week') {
        title = `Doanh thu theo tuần - Tháng ${data.month}/${data.year}`;
        labels = data.data.map(item => `Tuần ${item.week_number}`);
    } else if (data.period === 'month') {
        title = `Doanh thu theo tháng - Năm ${data.year}`;
        labels = data.data.map(item => `Tháng ${item.month_number}`);
    } else if (data.period === 'year') {
        title = `Doanh thu theo năm`;
        labels = data.data.map(item => `${item.year_number}`);
    }
    
    const revenues = data.data.map(item => item.revenue);
    const maxRevenue = Math.max(...revenues);
    
    // Calculate trends
    const trends = revenues.map((revenue, index) => {
        if (index === 0) return 0;
        const prev = revenues[index - 1];
        if (prev === 0) return revenue > 0 ? 100 : 0;
        return ((revenue - prev) / prev * 100);
    });
    
    let html = `
        <div style="background: white; padding: 30px; border: 2px solid #000; border-radius: 8px;">
            <h4 style="margin-bottom: 30px; text-align: center; font-size: 20px; font-weight: 900; text-transform: uppercase;">${title}</h4>
            
            <!-- Visual Bar Chart -->
            <div style="margin-bottom: 40px; padding: 20px; background: #f8f8f8; border-radius: 8px;">
                <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 300px; border-bottom: 2px solid #000; padding: 0 10px;">
    `;
    
    // Draw bars
    data.data.forEach((item, index) => {
        const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue * 100) : 0;
        const height = percentage;
        const label = labels[index];
        const trend = trends[index];
        const trendColor = trend > 0 ? '#4CAF50' : trend < 0 ? '#f44336' : '#666';
        const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
        
        html += `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; margin: 0 5px;">
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 5px; color: #000;">
                    ${new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(item.revenue)}đ
                </div>
                ${index > 0 ? `
                    <div style="font-size: 10px; color: ${trendColor}; margin-bottom: 5px;">
                        ${trendIcon} ${Math.abs(trend).toFixed(1)}%
                    </div>
                ` : '<div style="height: 18px;"></div>'}
                <div style="width: 100%; height: ${height}%; background: linear-gradient(180deg, #000 0%, #333 100%); border-radius: 4px 4px 0 0; min-height: 5px; position: relative; transition: all 0.3s ease; box-shadow: 0 -2px 10px rgba(0,0,0,0.2);">
                    <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: bold; white-space: nowrap;">
                        ${item.order_count} đơn
                    </div>
                </div>
                <div style="margin-top: 8px; font-size: 12px; font-weight: 600; text-align: center; color: #000;">
                    ${label}
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
                <div style="margin-top: 15px; text-align: center; font-size: 12px; color: #666;">
                    <span style="margin-right: 20px;">📊 Biểu đồ cột doanh thu</span>
                    <span style="color: #4CAF50;">↑ Tăng</span>
                    <span style="margin: 0 10px; color: #f44336;">↓ Giảm</span>
                </div>
            </div>
            
            <!-- Data Table -->
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #000; color: white;">
                            <th style="padding: 12px; text-align: left; border: 1px solid #000;">Thời gian</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #000;">Số đơn</th>
                            <th style="padding: 12px; text-align: right; border: 1px solid #000;">Doanh thu</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #000;">Xu hướng</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #000;">% So với max</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.data.forEach((item, index) => {
        const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue * 100) : 0;
        const label = labels[index];
        const trend = trends[index];
        const trendColor = trend > 0 ? '#4CAF50' : trend < 0 ? '#f44336' : '#666';
        const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
        const trendText = index === 0 ? '-' : `${trendIcon} ${Math.abs(trend).toFixed(1)}%`;
        
        html += `
            <tr style="border-bottom: 1px solid #ddd; ${percentage === 100 ? 'background: #fff9e6;' : ''}">
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: ${percentage === 100 ? 'bold' : 'normal'};">${label}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.order_count}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">
                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}
                </td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: ${trendColor}; font-weight: bold;">
                    ${trendText}
                </td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">
                    <div style="background: #f0f0f0; height: 24px; border-radius: 12px; overflow: hidden; position: relative;">
                        <div style="background: linear-gradient(90deg, #000 0%, #333 100%); height: 100%; width: ${percentage}%; transition: width 0.5s ease;"></div>
                        <span style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: bold; color: ${percentage > 50 ? 'white' : '#000'};">
                            ${percentage.toFixed(0)}%
                        </span>
                    </div>
                </td>
            </tr>
        `;
    });
    
    const totalRevenue = revenues.reduce((sum, val) => sum + val, 0);
    const totalOrders = data.data.reduce((sum, item) => sum + item.order_count, 0);
    const avgRevenue = totalRevenue / data.data.length;
    
    html += `
                    </tbody>
                    <tfoot>
                        <tr style="background: #000; color: white; font-weight: bold;">
                            <td style="padding: 12px; border: 1px solid #000;">TỔNG CỘNG</td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #000;">${totalOrders}</td>
                            <td style="padding: 12px; text-align: right; border: 1px solid #000;">
                                ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                            </td>
                            <td colspan="2" style="padding: 12px; text-align: right; border: 1px solid #000;">
                                Trung bình: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(avgRevenue)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <!-- Summary Stats -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                <div style="background: #f8f8f8; padding: 15px; border-radius: 4px; border-left: 4px solid #000;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Cao nhất</div>
                    <div style="font-size: 18px; font-weight: bold;">
                        ${new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(maxRevenue)}đ
                    </div>
                </div>
                <div style="background: #f8f8f8; padding: 15px; border-radius: 4px; border-left: 4px solid #666;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Thấp nhất</div>
                    <div style="font-size: 18px; font-weight: bold;">
                        ${new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(Math.min(...revenues))}đ
                    </div>
                </div>
                <div style="background: #f8f8f8; padding: 15px; border-radius: 4px; border-left: 4px solid #4CAF50;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Trung bình</div>
                    <div style="font-size: 18px; font-weight: bold;">
                        ${new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(avgRevenue)}đ
                    </div>
                </div>
            </div>
        </div>
    `;
    
    chartDiv.innerHTML = html;
}

// Load revenue button
document.getElementById('loadRevenueBtn').addEventListener('click', loadRevenue);

// ============ QUẢN LÝ VARIANTS (SIZE & MÀU) ============

// Manage variants modal
async function manageVariants(productId, productName) {
    try {
        const variants = await apiCall(`/admin/products/${productId}/variants`);
        
        const modal = document.createElement('div');
        modal.id = 'variantsModal';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <span class="close">&times;</span>
                <h2>Quản lý Size & Màu: ${productName}</h2>
                
                <div style="margin-bottom: 20px;">
                    <button class="btn-primary" onclick="showAddVariantForm(${productId})">+ Thêm Size/Màu</button>
                </div>
                
                <div id="variantsList">
                    ${renderVariantsTable(variants, productId)}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
    } catch (error) {
        console.error('Manage variants error:', error);
        alert('Lỗi: ' + error.message);
    }
}

function renderVariantsTable(variants, productId) {
    if (variants.length === 0) {
        return '<p style="text-align: center; padding: 40px; color: #666;">Chưa có variants. Hãy thêm size và màu cho sản phẩm.</p>';
    }
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Size</th>
                    <th>Màu</th>
                    <th>Mã màu</th>
                    <th>Tồn kho</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${variants.map(v => `
                    <tr>
                        <td><strong>${v.size}</strong></td>
                        <td>
                            <span style="display: inline-flex; align-items: center; gap: 8px;">
                                <span style="display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: ${v.color_code}; border: 1px solid #ddd;"></span>
                                ${v.color}
                            </span>
                        </td>
                        <td><code>${v.color_code}</code></td>
                        <td>
                            <span style="color: ${v.stock > 10 ? '#4CAF50' : v.stock > 0 ? '#FF9800' : '#f44336'}; font-weight: bold;">
                                ${v.stock}
                            </span>
                        </td>
                        <td>
                            <button class="btn-secondary" onclick="editVariant(${productId}, ${v.id})">Sửa</button>
                            <button class="btn-danger" onclick="deleteVariant(${productId}, ${v.id})">Xóa</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Show add variant form
function showAddVariantForm(productId) {
    const modal = document.createElement('div');
    modal.id = 'variantFormModal';
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close">&times;</span>
            <h2>Thêm Size/Màu mới</h2>
            <form id="variantForm">
                <div class="form-group">
                    <label>Size *</label>
                    <select id="variantSize" required>
                        <option value="">Chọn size</option>
                        <option value="38">38</option>
                        <option value="39">39</option>
                        <option value="40">40</option>
                        <option value="41">41</option>
                        <option value="42">42</option>
                        <option value="43">43</option>
                        <option value="44">44</option>
                        <option value="45">45</option>
                        <option value="46">46</option>
                        <option value="47">47</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Màu sắc *</label>
                    <input type="text" id="variantColor" required placeholder="VD: Đen, Trắng, Xanh dương">
                </div>
                <div class="form-group">
                    <label>Mã màu *</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="color" id="variantColorPicker" value="#000000" style="width: 60px; height: 40px; border: none; cursor: pointer;">
                        <input type="text" id="variantColorCode" value="#000000" required pattern="^#[0-9A-Fa-f]{6}$" placeholder="#000000" style="flex: 1;">
                    </div>
                    <small style="color: #666;">Chọn màu hoặc nhập mã hex</small>
                </div>
                <div class="form-group">
                    <label>Số lượng *</label>
                    <input type="number" id="variantStock" required min="0" value="0">
                </div>
                <button type="submit" class="btn-primary">Thêm</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Sync color picker and code input
    const picker = document.getElementById('variantColorPicker');
    const codeInput = document.getElementById('variantColorCode');
    
    picker.addEventListener('input', (e) => {
        codeInput.value = e.target.value.toUpperCase();
    });
    
    codeInput.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            picker.value = e.target.value;
        }
    });
    
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('variantForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveVariant(productId);
        modal.remove();
    });
}

// Save variant
async function saveVariant(productId, variantId = null) {
    const size = document.getElementById('variantSize').value;
    const color = document.getElementById('variantColor').value;
    const color_code = document.getElementById('variantColorCode').value;
    const stock = document.getElementById('variantStock').value;
    
    try {
        if (variantId) {
            await apiCall(`/admin/products/${productId}/variants/${variantId}`, {
                method: 'PUT',
                body: JSON.stringify({ size, color, color_code, stock })
            });
            alert('Cập nhật variant thành công');
        } else {
            await apiCall(`/admin/products/${productId}/variants`, {
                method: 'POST',
                body: JSON.stringify({ size, color, color_code, stock })
            });
            alert('Thêm variant thành công');
        }
        
        // Reload variants list
        const variants = await apiCall(`/admin/products/${productId}/variants`);
        document.getElementById('variantsList').innerHTML = renderVariantsTable(variants, productId);
        
    } catch (error) {
        console.error('Save variant error:', error);
        alert('Lỗi: ' + error.message);
    }
}

// Edit variant
async function editVariant(productId, variantId) {
    try {
        const variants = await apiCall(`/admin/products/${productId}/variants`);
        const variant = variants.find(v => v.id === variantId);
        
        if (!variant) {
            alert('Không tìm thấy variant');
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'variantFormModal';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close">&times;</span>
                <h2>Sửa Size/Màu</h2>
                <form id="variantForm">
                    <div class="form-group">
                        <label>Size *</label>
                        <select id="variantSize" required>
                            <option value="">Chọn size</option>
                            ${['38','39','40','41','42','43','44','45','46','47'].map(s => 
                                `<option value="${s}" ${s === variant.size ? 'selected' : ''}>${s}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Màu sắc *</label>
                        <input type="text" id="variantColor" required value="${variant.color}">
                    </div>
                    <div class="form-group">
                        <label>Mã màu *</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="color" id="variantColorPicker" value="${variant.color_code}" style="width: 60px; height: 40px; border: none; cursor: pointer;">
                            <input type="text" id="variantColorCode" value="${variant.color_code}" required pattern="^#[0-9A-Fa-f]{6}$" style="flex: 1;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Số lượng *</label>
                        <input type="number" id="variantStock" required min="0" value="${variant.stock}">
                    </div>
                    <button type="submit" class="btn-primary">Cập nhật</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Sync color picker and code input
        const picker = document.getElementById('variantColorPicker');
        const codeInput = document.getElementById('variantColorCode');
        
        picker.addEventListener('input', (e) => {
            codeInput.value = e.target.value.toUpperCase();
        });
        
        codeInput.addEventListener('input', (e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                picker.value = e.target.value;
            }
        });
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('variantForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveVariant(productId, variantId);
            modal.remove();
        });
        
    } catch (error) {
        console.error('Edit variant error:', error);
        alert('Lỗi: ' + error.message);
    }
}

// Delete variant
async function deleteVariant(productId, variantId) {
    if (!confirm('Bạn có chắc muốn xóa variant này?')) return;
    
    try {
        await apiCall(`/admin/products/${productId}/variants/${variantId}`, {
            method: 'DELETE'
        });
        
        alert('Xóa variant thành công');
        
        // Reload variants list
        const variants = await apiCall(`/admin/products/${productId}/variants`);
        document.getElementById('variantsList').innerHTML = renderVariantsTable(variants, productId);
        
    } catch (error) {
        console.error('Delete variant error:', error);
        alert('Lỗi: ' + error.message);
    }
}

// Initialize
checkAuth().then(() => {
    loadDashboard();
    populateYearDropdown();
    // Set current month for week view
    document.getElementById('revenueMonth').value = new Date().getMonth() + 1;
    // Load default revenue (current year by month)
    loadRevenue();
});
