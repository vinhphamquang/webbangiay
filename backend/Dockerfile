# Sử dụng Node.js image
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port
EXPOSE 3001

# Chạy ứng dụng
CMD ["npm", "start"]
