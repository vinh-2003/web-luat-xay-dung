# Hệ Thống Tra Cứu Luật Xây Dựng 🏢⚖️

Hệ thống cung cấp nền tảng toàn diện để tra cứu, tìm kiếm và phân tích các văn bản pháp luật trong lĩnh vực Xây dựng tại Việt Nam. Dự án được thiết kế với giao diện hiện đại, tối ưu UX/UI và tích hợp Trí tuệ Nhân tạo (AI) giúp người dùng dễ dàng hiểu và áp dụng pháp luật.

---

## 🌟 Tính Năng Nổi Bật

### Dành cho Người dùng (User)
* **🔍 Tìm kiếm thông minh (Semantic Search):** Tích hợp AI (Vector Database) cho phép tìm kiếm theo ngữ nghĩa, tự động hiểu ý định của người dùng thay vì chỉ tìm theo từ khóa cứng nhắc.
* **🤖 Trợ lý AI Luật sư:** Chatbot AI (Tích hợp Google Gemini) giúp giải đáp thắc mắc, tóm tắt và giải thích các điều khoản luật xây dựng phức tạp thành ngôn ngữ dễ hiểu.
* **🔐 Xác thực an toàn:** Đăng nhập, đăng ký bằng Email hoặc tài khoản Google (OAuth2).
* **📱 Giao diện hiện đại (Responsive):** Thiết kế tối ưu cho cả máy tính, máy tính bảng và điện thoại di động với hỗ trợ chế độ Tối (Dark Mode).
* **📚 Quản lý tài liệu:** Lưu lại lịch sử tra cứu, đánh dấu các văn bản quan trọng.

### Dành cho Quản trị viên (Admin)
* **📊 Bảng điều khiển (Dashboard):** Quản lý toàn diện hệ thống, theo dõi lượng người dùng và số lượng văn bản pháp luật.
* **🕷️ Trình cào dữ liệu tự động (Web Scraper):** Tích hợp Playwright để tự động cào và cập nhật dữ liệu văn bản pháp luật từ các trang web chính phủ (`vbpl.vn`, `moc.gov.vn`).
* **👥 Quản lý người dùng:** Thống kê, thêm, sửa, xóa và khóa tài khoản người dùng vi phạm.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 🎨 Frontend
* **Framework:** Next.js (React)
* **Ngôn ngữ:** TypeScript
* **Styling:** Tailwind CSS, Framer Motion (Animations)
* **State Management:** React Hooks
* **Tích hợp:** Google OAuth, Lucide React (Icons)

### ⚙️ Backend
* **Framework:** FastAPI (Hiệu năng cao, Hỗ trợ bất đồng bộ Async)
* **Ngôn ngữ:** Python 3.12+
* **Cơ sở dữ liệu:** PostgreSQL (Tích hợp `pgvector` cho tìm kiếm ngữ nghĩa)
* **ORM:** SQLAlchemy
* **Web Scraping:** Playwright
* **AI Engine:** Google Gemini Pro

### ☁️ Infrastructure & Database
* **Database Hosting:** Supabase
* **Frontend Hosting:** Vercel
* **Backend Hosting:** Render

---

## 🚀 Hướng Dẫn Cài Đặt (Local Development)

### 1. Cài đặt Backend
Mở Terminal, di chuyển vào thư mục `backend`:
```bash
cd backend
# Tạo môi trường ảo
python -m venv venv
venv\Scripts\activate   # (Windows)
source venv/bin/activate # (Mac/Linux)

# Cài đặt thư viện
pip install -r requirements.txt

# Cài đặt Playwright (Trình duyệt cào dữ liệu)
playwright install chromium

# Chạy server
uvicorn app.main:app --reload
```
*Backend sẽ chạy tại: `http://localhost:8000` (Swagger UI: `http://localhost:8000/docs`)*

### 2. Cài đặt Frontend
Mở Terminal mới, di chuyển vào thư mục `frontend`:
```bash
cd frontend
# Cài đặt thư viện
npm install

# Chạy server
npm run dev
```
*Frontend sẽ chạy tại: `http://localhost:3000`*

---

## 🔑 Biến Môi Trường (Environment Variables)

Bạn cần tạo file `.env` ở Backend và `.env.local` ở Frontend để dự án hoạt động:

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
SECRET_KEY=[YOUR_JWT_SECRET_KEY]
GOOGLE_API_KEY=[YOUR_GEMINI_API_KEY]
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
TZ=Asia/Ho_Chi_Minh
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
```

---

## 📝 Lưu ý Về Trình Cào Dữ Liệu (Scraper)
Do hệ thống tường lửa của các trang web chính phủ Việt Nam (`vbpl.vn`) thường xuyên chặn IP đến từ các Data Center quốc tế (như Render), **tính năng Cào Dữ Liệu tự động được khuyến nghị chạy trên máy tính cá nhân (Local)** thông qua mạng Internet nội địa Việt Nam. 

Dữ liệu sau khi cào ở máy Local sẽ được đồng bộ thẳng lên Supabase (Cloud Database), từ đó Website chính trên Vercel có thể hiển thị dữ liệu mới nhất mà không bị chặn tường lửa.
