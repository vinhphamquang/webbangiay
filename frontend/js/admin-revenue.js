// Simple revenue table rendering - no bar chart
function renderRevenueChart(data) {
    const chartDiv = document.getElementById('revenueChart');
    
    if (!data.data || data.data.length === 0) {
        chartDiv.innerHTML = `
            <div style="background: white; padding: 40px; border: 2px solid #000; border-radius: 8px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
                <h3 style="margin-bottom: 10px;">Chưa có dữ liệu doanh thu</h3>
                <p style="color: #666;">Chưa có đơn hàng hoàn thành trong khoảng thời gian này.</p>
            </div>
        `;
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
            
            <!-- Data Table -->
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #000; color: white;">
                            <th style="padding: 12px; text-align: left; border: 1px solid #000;">Thời gian</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #000;">Số đơn</th>
                            <th style="padding: 12px; text-align: right; border: 1px solid #000;">Doanh thu</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #000;">Xu hướng</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.data.forEach((item, index) => {
        const label = labels[index];
        const trend = trends[index];
        const trendColor = trend > 0 ? '#4CAF50' : trend < 0 ? '#f44336' : '#666';
        const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
        const trendText = index === 0 ? '-' : `${trendIcon} ${Math.abs(trend).toFixed(1)}%`;
        
        html += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600;">${label}</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${item.order_count}</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">
                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}
                </td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: ${trendColor}; font-weight: bold;">
                    ${trendText}
                </td>
            </tr>
        `;
    });
    
    const totalRevenue = revenues.reduce((sum, val) => sum + val, 0);
    const totalOrders = data.data.reduce((sum, item) => sum + item.order_count, 0);
    const avgRevenue = totalRevenue / data.data.length;
    const maxRevenue = Math.max(...revenues);
    const minRevenue = Math.min(...revenues);
    
    html += `
                    </tbody>
                    <tfoot>
                        <tr style="background: #000; color: white; font-weight: bold;">
                            <td style="padding: 12px; border: 1px solid #000;">TỔNG CỘNG</td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #000;">${totalOrders}</td>
                            <td style="padding: 12px; text-align: right; border: 1px solid #000;">
                                ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                            </td>
                            <td style="padding: 12px; text-align: center; border: 1px solid #000;">-</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <!-- Summary Stats -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 30px;">
                <div style="background: #f8f8f8; padding: 20px; border-radius: 4px; border-left: 4px solid #000;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Tổng doanh thu</div>
                    <div style="font-size: 20px; font-weight: bold;">
                        ${new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(totalRevenue)}đ
                    </div>
                </div>
                <div style="background: #f8f8f8; padding: 20px; border-radius: 4px; border-left: 4px solid #4CAF50;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Cao nhất</div>
                    <div style="font-size: 20px; font-weight: bold;">
                        ${new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(maxRevenue)}đ
                    </div>
                </div>
                <div style="background: #f8f8f8; padding: 20px; border-radius: 4px; border-left: 4px solid #f44336;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Thấp nhất</div>
                    <div style="font-size: 20px; font-weight: bold;">
                        ${new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(minRevenue)}đ
                    </div>
                </div>
                <div style="background: #f8f8f8; padding: 20px; border-radius: 4px; border-left: 4px solid #2196F3;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase;">Trung bình</div>
                    <div style="font-size: 20px; font-weight: bold;">
                        ${new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(avgRevenue)}đ
                    </div>
                </div>
            </div>
        </div>
    `;
    
    chartDiv.innerHTML = html;
}
