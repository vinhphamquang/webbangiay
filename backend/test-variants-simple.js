const http = require('http');

const API_URL = 'localhost';
const API_PORT = 3001;

function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_URL,
            port: API_PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject({ status: res.statusCode, data: response });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, error: 'Invalid JSON', body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testVariantsAPI() {
    console.log('🧪 Testing Product Variants API...\n');

    try {
        // 1. Test GET variants endpoint (public)
        console.log('1️⃣ Testing GET /api/products/1/variants...');
        const variants = await makeRequest('GET', '/api/products/1/variants');
        console.log(`✅ Found ${variants.length} variants`);
        if (variants.length > 0) {
            console.log('   Sample:', {
                id: variants[0].id,
                size: variants[0].size,
                color: variants[0].color,
                stock: variants[0].stock
            });
        }
        console.log('');

        // 2. Login as admin
        console.log('2️⃣ Testing Admin Login...');
        const adminLogin = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@adidas.com',
            password: '123456'
        });
        const adminToken = adminLogin.token;
        console.log('✅ Admin login successful');
        console.log('');

        // 3. Admin get variants
        console.log('3️⃣ Testing GET /api/admin/products/1/variants...');
        const adminVariants = await makeRequest('GET', '/api/admin/products/1/variants', null, adminToken);
        console.log(`✅ Admin retrieved ${adminVariants.length} variants`);
        console.log('');

        // 4. Admin create new variant
        console.log('4️⃣ Testing POST /api/admin/products/1/variants...');
        const newVariant = await makeRequest('POST', '/api/admin/products/1/variants', {
            size: '46',
            color: 'Test Color',
            color_code: '#FF0000',
            stock: 10
        }, adminToken);
        console.log('✅ Created variant:', {
            id: newVariant.id,
            size: newVariant.size,
            color: newVariant.color,
            stock: newVariant.stock
        });
        const createdId = newVariant.id;
        console.log('');

        // 5. Admin update variant
        console.log('5️⃣ Testing PUT /api/admin/products/1/variants/' + createdId + '...');
        const updated = await makeRequest('PUT', `/api/admin/products/1/variants/${createdId}`, {
            stock: 25
        }, adminToken);
        console.log('✅ Updated stock to:', updated.stock);
        console.log('');

        // 6. Admin delete variant
        console.log('6️⃣ Testing DELETE /api/admin/products/1/variants/' + createdId + '...');
        await makeRequest('DELETE', `/api/admin/products/1/variants/${createdId}`, null, adminToken);
        console.log('✅ Deleted test variant');
        console.log('');

        // 7. Verify deletion
        console.log('7️⃣ Verifying deletion...');
        const afterDelete = await makeRequest('GET', '/api/admin/products/1/variants', null, adminToken);
        const stillExists = afterDelete.find(v => v.id === createdId);
        if (!stillExists) {
            console.log('✅ Variant successfully deleted');
        } else {
            console.log('❌ Variant still exists!');
        }
        console.log('');

        console.log('🎉 All backend tests passed!\n');
        console.log('✅ Variants API is working correctly');
        console.log('✅ Ready to implement frontend\n');

    } catch (error) {
        console.error('❌ Test failed!');
        if (error.status) {
            console.error('   Status:', error.status);
            console.error('   Error:', error.data || error.body);
        } else {
            console.error('   Error:', error.message || error);
        }
        process.exit(1);
    }
}

// Run tests
testVariantsAPI();
