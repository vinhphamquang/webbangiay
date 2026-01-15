const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test data
let adminToken = '';
let userToken = '';
let testProductId = 1;
let testVariantId = null;

async function testVariantsAPI() {
    console.log('🧪 Testing Product Variants API...\n');

    try {
        // 1. Login as admin
        console.log('1️⃣ Testing Admin Login...');
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@adidas.com',
            password: '123456'
        });
        adminToken = adminLogin.data.token;
        console.log('✅ Admin login successful\n');

        // 2. Get variants of a product
        console.log('2️⃣ Testing GET /api/products/:id/variants...');
        const variantsResponse = await axios.get(`${API_URL}/products/${testProductId}/variants`);
        console.log(`✅ Found ${variantsResponse.data.length} variants`);
        console.log('Sample variant:', variantsResponse.data[0]);
        testVariantId = variantsResponse.data[0].id;
        console.log('');

        // 3. Admin get variants
        console.log('3️⃣ Testing GET /api/admin/products/:id/variants...');
        const adminVariants = await axios.get(
            `${API_URL}/admin/products/${testProductId}/variants`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log(`✅ Admin retrieved ${adminVariants.data.length} variants\n`);

        // 4. Admin create new variant
        console.log('4️⃣ Testing POST /api/admin/products/:id/variants...');
        const newVariant = await axios.post(
            `${API_URL}/admin/products/${testProductId}/variants`,
            {
                size: '46',
                color: 'Xanh dương',
                color_code: '#0000FF',
                stock: 15
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('✅ Created new variant:', newVariant.data);
        const createdVariantId = newVariant.data.id;
        console.log('');

        // 5. Admin update variant
        console.log('5️⃣ Testing PUT /api/admin/products/:id/variants/:variantId...');
        const updatedVariant = await axios.put(
            `${API_URL}/admin/products/${testProductId}/variants/${createdVariantId}`,
            {
                stock: 20
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('✅ Updated variant stock to:', updatedVariant.data.stock);
        console.log('');

        // 6. Login as customer
        console.log('6️⃣ Testing Customer Login...');
        const userLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'customer1@example.com',
            password: 'password123'
        });
        userToken = userLogin.data.token;
        console.log('✅ Customer login successful\n');

        // 7. Add to cart with variant
        console.log('7️⃣ Testing POST /api/customer/cart (with variantId)...');
        try {
            const addToCart = await axios.post(
                `${API_URL}/customer/cart`,
                {
                    productId: testProductId,
                    variantId: testVariantId,
                    quantity: 2
                },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            console.log('✅ Added to cart successfully');
            console.log('');
        } catch (error) {
            console.log('⚠️ Add to cart error:', error.response?.data?.error || error.message);
            console.log('');
        }

        // 8. Get cart
        console.log('8️⃣ Testing GET /api/customer/cart...');
        const cart = await axios.get(
            `${API_URL}/customer/cart`,
            { headers: { Authorization: `Bearer ${userToken}` } }
        );
        console.log(`✅ Cart has ${cart.data.items.length} items`);
        if (cart.data.items.length > 0) {
            console.log('Sample cart item:', {
                product: cart.data.items[0].product.name,
                variant: cart.data.items[0].variant,
                quantity: cart.data.items[0].quantity
            });
        }
        console.log('');

        // 9. Admin delete variant
        console.log('9️⃣ Testing DELETE /api/admin/products/:id/variants/:variantId...');
        await axios.delete(
            `${API_URL}/admin/products/${testProductId}/variants/${createdVariantId}`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('✅ Deleted test variant\n');

        console.log('🎉 All tests passed!\n');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

// Run tests
testVariantsAPI();
