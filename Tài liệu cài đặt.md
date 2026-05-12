# 🛋️ TTTH Furniture Shop - Dự Án Thương Mại Điện Tử Nội Thất

Chào mừng bạn đến với dự án **TTTH Furniture Shop**. Đây là hệ thống quản lý và kinh doanh đồ nội thất trực tuyến, bao gồm đầy đủ các tính năng từ xem sản phẩm, giỏ hàng đến đặt hàng theo yêu cầu (Custom Order).

Tài liệu này hướng dẫn các thành viên trong nhóm cách thiết lập môi trường và chạy dự án trên máy cá nhân.

---

## 🛠 Yêu Cầu Hệ Thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

1.  **Java Development Kit (JDK) 17**: [Tải về tại đây](https://www.oracle.com/java/technologies/downloads/#java17)
2.  **Node.js (Phiên bản 18 trở lên)**: [Tải về tại đây](https://nodejs.org/)
3.  **MySQL Server (Phiên bản 8.0 trở lên)**: [Tải về tại đây](https://dev.mysql.com/downloads/installer/)
4.  **Git**: [Tải về tại đây](https://git-scm.com/)
5.  **IDE Khuyên dùng**: IntelliJ IDEA (cho Backend) và VS Code (cho Frontend).

---

## 🚀 Các Bước Cài Đặt & Chạy Dự Án

### 1. Clone Dự Án
Mở terminal (hoặc Git Bash) và chạy lệnh:
```bash
git clone https://github.com/YourUsername/Web-TMDT-Shop-b-n-n-i-th-t-TTTH.git
cd Web-TMDT-Shop-b-n-n-i-th-t-TTTH
```

### 2. Cấu Hình Cơ Sở Dữ Liệu (Backend)
1.  Mở **MySQL Workbench** hoặc công cụ quản lý MySQL bất kỳ.
2.  Tạo một database mới tên là: `ttth_furniture`.
    ```sql
    CREATE DATABASE ttth_furniture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
3.  Truy cập vào file cấu hình backend tại: `backend/src/main/resources/application.properties`.
4.  Cập nhật `username` và `password` MySQL của bạn:
    ```properties
    spring.datasource.username=root
    spring.datasource.password=your_password_here
    ```
    *(Lưu ý: Không thay đổi các cấu hình khác nếu bạn không chắc chắn).*

### 3. Chạy Backend (Spring Boot)
1.  Di chuyển vào thư mục backend:
    ```bash
    cd backend
    ```
2.  Chạy dự án bằng Maven:
    ```bash
    ./mvnw spring-boot:run
    ```
    Hoặc mở thư mục `backend` bằng IntelliJ IDEA và nhấn nút **Run**.
3.  Backend sẽ chạy tại: `http://localhost:8080`.
4.  **Dữ liệu mẫu**: Hệ thống có tích hợp `DataSeeder`, khi chạy lần đầu tiên, các dữ liệu mẫu về sản phẩm và danh mục sẽ tự động được tạo trong Database.

### 4. Chạy Frontend (React + Vite)
1.  Mở một terminal mới (vẫn ở thư mục gốc của dự án).
2.  Di chuyển vào thư mục frontend:
    ```bash
    cd frontend
    ```
3.  Cài đặt các thư viện cần thiết:
    ```bash
    npm install
    ```
4.  Chạy ứng dụng:
    ```bash
    npm run dev
    ```
5.  Truy cập ứng dụng tại địa chỉ hiển thị trong terminal (thường là `http://localhost:5173`).

---

## 📂 Cấu Trúc Thư Mục Chính

```text
.
├── backend/            # Mã nguồn Spring Boot (Java)
│   ├── src/main/java   # Business logic, Controller, Entity, Repository
│   └── src/resources   # Cấu hình application.properties, Static files
├── frontend/           # Mã nguồn React (TypeScript + Vite)
│   ├── src/components  # Các thành phần giao diện dùng chung
│   ├── src/pages       # Các trang chính của ứng dụng
│   ├── src/services    # Gọi API từ backend
│   └── src/context     # Quản lý trạng thái (Cart, Auth...)
└── README.md           # Tài liệu hướng dẫn này
```

---

## 📝 Lưu Ý Quan Trọng
- **Cổng (Port)**: Backend mặc định chạy cổng `8080`, Frontend chạy cổng `5173`. Đảm bảo các cổng này không bị chiếm dụng bởi ứng dụng khác.
- **Upload Ảnh**: Các ảnh sản phẩm tải lên sẽ được lưu trong thư mục `backend/uploads/`.
- **API URL**: Nếu bạn thay đổi cổng của backend, hãy cập nhật lại biến `API_URL` trong các file tại `frontend/src/services/`.

---

## 👥 Thành Viên Nhóm
- [Tên Thành Viên 1]
- [Tên Thành Viên 2]
- [Tên Thành Viên 3]

*Chúc các bạn làm việc hiệu quả!* 🚀
