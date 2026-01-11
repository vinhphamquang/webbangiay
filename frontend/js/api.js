// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// API Service Class
class APIService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    // Generic request handler with error handling
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            // Handle different status codes
            if (response.status === 404) {
                throw new Error('Không tìm thấy tài nguyên (404)');
            }
            
            if (response.status === 401) {
                throw new Error('Không có quyền truy cập (401)');
            }
            
            if (response.status === 403) {
                throw new Error('Truy cập bị từ chối (403)');
            }
            
            if (response.status === 500) {
                throw new Error('Lỗi máy chủ nội bộ (500)');
            }
            
            if (response.status === 503) {
                throw new Error('Dịch vụ không khả dụng (503)');
            }

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
            }
            throw error;
        }
    }

    // 1. GET /products - Lấy tất cả sản phẩm
    async getAllProducts() {
        return this.request('/products');
    }

    // 2. GET /products/:id - Lấy sản phẩm theo ID
    async getProductById(id) {
        return this.request(`/products/${id}`);
    }

    // 3. POST /products - Tạo sản phẩm mới
    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    // 4. PUT /products/:id - Cập nhật sản phẩm
    async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    // 5. DELETE /products/:id - Xóa sản phẩm
    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // 6. GET /products/category/:category - Lấy sản phẩm theo danh mục
    async getProductsByCategory(category) {
        return this.request(`/products/category/${category}`);
    }

    // 7. GET /products/search?q=keyword - Tìm kiếm sản phẩm
    async searchProducts(keyword) {
        return this.request(`/products/search?q=${encodeURIComponent(keyword)}`);
    }

    // 8. GET /cart - Lấy giỏ hàng
    async getCart() {
        return this.request('/cart');
    }

    // 9. POST /cart - Thêm sản phẩm vào giỏ hàng
    async addToCart(productId, quantity = 1) {
        return this.request('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    // 10. PUT /cart/:productId - Cập nhật số lượng trong giỏ hàng
    async updateCartItem(productId, quantity) {
        return this.request(`/cart/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    // 11. DELETE /cart/:productId - Xóa sản phẩm khỏi giỏ hàng
    async removeFromCart(productId) {
        return this.request(`/cart/${productId}`, {
            method: 'DELETE'
        });
    }

    // 12. DELETE /cart - Xóa toàn bộ giỏ hàng
    async clearCart() {
        return this.request('/cart', {
            method: 'DELETE'
        });
    }

    // 13. POST /orders - Tạo đơn hàng
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    // 14. GET /orders - Lấy danh sách đơn hàng
    async getOrders() {
        return this.request('/orders');
    }

    // 15. GET /stats - Lấy thống kê
    async getStats() {
        return this.request('/stats');
    }
}

// Create API instance
const api = new APIService(API_BASE_URL);
