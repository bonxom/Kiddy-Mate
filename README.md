# 🤖 Kiddy-Mate

> **AI-Powered Child Development Platform** - Hệ thống phát triển trẻ em thông minh với AI, tích hợp tương tác 3D Avatar và phân tích cảm xúc

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [API Documentation](#-api-documentation)
- [Phát triển](#-phát-triển)

## 🎯 Tổng quan

**Kiddy-Mate** là một nền tảng phát triển trẻ em toàn diện, sử dụng AI và LLM để:

- **Tương tác thông minh**: Trẻ em có thể trò chuyện với Avatar 3D Robot thông qua text-to-speech và speech-to-text
- **Phân tích cảm xúc**: Hệ thống tự động phát hiện và phân tích cảm xúc từ tương tác và hoạt động của trẻ
- **Tạo nhiệm vụ thông minh**: AI tự động tạo nhiệm vụ phù hợp dựa trên đánh giá và sở thích của trẻ
- **Báo cáo chi tiết**: Tạo báo cáo phát triển tự động với insights từ AI
- **Giao diện riêng biệt**: Tách biệt hoàn toàn giao diện cho Phụ huynh và Trẻ em

## ✨ Tính năng chính

### 🎭 Giao diện phân chia theo vai trò

#### 👨‍👩‍👧 Giao diện Phụ huynh (Parent Interface)

- **Dashboard Analytics**:
  - Thống kê hoàn thành nhiệm vụ theo tuần
  - Biểu đồ phân tích cảm xúc (Emotion Pie Chart)
  - Tiến độ theo danh mục nhiệm vụ
  - Timeline hoạt động
- **Quản lý Nhiệm vụ**:
  - Thư viện nhiệm vụ với tìm kiếm và lọc
  - Gán nhiệm vụ cho trẻ với tùy chỉnh (tên, phần thưởng, danh mục)
  - Xác thực và phê duyệt nhiệm vụ đã hoàn thành
  - Tạo nhiệm vụ tùy chỉnh
- **Báo cáo & Phân tích**:
  - Tạo báo cáo phát triển tự động (AI-generated)
  - Phân tích cảm xúc từ tương tác và hoạt động
  - Gợi ý nhiệm vụ dựa trên báo cáo cảm xúc
- **Quản lý Phần thưởng**:
  - Cửa hàng phần thưởng
  - Quản lý yêu cầu đổi thưởng
  - Theo dõi phần thưởng đã kiếm được
- **Cài đặt**:
  - Quản lý hồ sơ trẻ em
  - Cài đặt thông báo
  - Quản lý tài khoản

#### 🧒 Giao diện Trẻ em (Child Interface)

- **Tương tác với Avatar 3D Robot**:
  - Chat với Robot thông qua text input
  - Tương tác bằng giọng nói (text-to-speech & speech-to-text)
  - Robot phản hồi thông minh bằng AI (CLOVA)
- **Nhiệm vụ & Trò chơi**:
  - Xem và thực hiện nhiệm vụ được giao
  - Tích hợp Unity cho minigames 3D
  - Theo dõi tiến độ và phần thưởng
- **Hồ sơ cá nhân**:
  - Xem số xu và cấp độ
  - Xem badge và phần thưởng đã kiếm được
  - Lịch sử hoàn thành nhiệm vụ

### 🤖 Tính năng AI & LLM

#### 1. **Phát hiện và Phân tích Cảm xúc (Emotion Detection & Analysis)**

- **Phát hiện cảm xúc từ text**: Sử dụng Naver AI để phân tích cảm xúc từ tin nhắn của trẻ
  - Các cảm xúc được phát hiện: Happy, Sad, Angry, Excited, Scared, Neutral, Curious, Frustrated, Proud, Worried
- **Suy luận cảm xúc từ hoạt động**: Khi không có tương tác trực tiếp, AI suy luận cảm xúc từ:
  - Mẫu hoàn thành nhiệm vụ (tỷ lệ cao = cảm xúc tích cực)
  - Danh mục nhiệm vụ (Social/Creativity = tích cực, Academic khó = căng thẳng)
  - Xu hướng hoàn thành (cải thiện = tự tin, giảm = chán nản)
- **Phân tích xu hướng cảm xúc**: Dashboard hiển thị phân bố cảm xúc theo thời gian

#### 2. **Tạo Nhiệm vụ Thông minh (AI Task Generation)**

- **Tạo nhiệm vụ dựa trên ngữ cảnh**:
  - Phân tích đánh giá phát triển (Assessment)
  - Lịch sử hoàn thành nhiệm vụ
  - Sở thích, tính cách, điểm mạnh của trẻ
  - Điểm ưu tiên theo danh mục (Independence, Logic, Physical, Creativity, Social, Academic, IQ, EQ)
- **Tạo nhiệm vụ từ báo cáo cảm xúc**:
  - Phân tích báo cáo cảm xúc tự động
  - Tạo nhiệm vụ phù hợp để hỗ trợ phát triển cảm xúc
- **Tự động hóa**: Hệ thống có thể tự động tạo nhiệm vụ định kỳ dựa trên nhu cầu

#### 3. **Báo cáo Phát triển Tự động (AI-Generated Reports)**

- **Phân tích toàn diện**:
  - Phân tích hoàn thành nhiệm vụ
  - Phân tích cảm xúc và xu hướng
  - Điểm mạnh và cần cải thiện
- **Gợi ý hành động**:
  - Hoạt động được đề xuất
  - Lời khuyên cho phụ huynh
  - Hỗ trợ cảm xúc cụ thể
- **Tự động tạo báo cáo hàng tuần**: Scheduler tự động tạo báo cáo cho tất cả trẻ em

#### 4. **Phân tích Đánh giá Phát triển (Assessment Analysis)**

- **Đánh giá 5 kỹ năng**:
  - Independence (Độc lập)
  - Emotional Intelligence (Trí tuệ cảm xúc)
  - Discipline (Kỷ luật)
  - Social (Xã hội)
  - Logic (Logic)
- **Scoring thông minh**: Naver AI phân tích câu trả lời và đưa ra điểm số 0-100 với giải thích
- **Tạo initial_traits**: Lưu kết quả vào database để sử dụng cho các tính năng AI khác

#### 5. **Tương tác Avatar thông minh (Smart Avatar Interaction)**

- **Chat với Robot**: Trẻ em có thể chat với Avatar 3D Robot
- **Phản hồi AI**: Sử dụng Naver AI để tạo phản hồi tự nhiên và phù hợp
- **Ghi nhận tương tác**: Tất cả tương tác được lưu lại với cảm xúc được phát hiện

### 🎮 Tích hợp Unity & 3D

- **3D Robot Avatar**:
  - Render bằng React Three Fiber
  - Tương tác với chuột (xoay, nhìn theo)
  - Animation và hiệu ứng
- **Unity Integration**:
  - Nhiệm vụ có thể tích hợp với Unity games
  - Unity types: LIFE, CHOICE, TALK
  - Minigames 3D tương tác

### 📊 Analytics & Dashboard

- **Completion Line Chart**: Biểu đồ xu hướng hoàn thành nhiệm vụ theo tuần
- **Emotion Pie Chart**: Phân bố cảm xúc với labels hiển thị bên ngoài
- **Category Progress Rings**: Tiến độ theo từng danh mục nhiệm vụ
- **Stats Cards**: Thống kê tổng quan (nhiệm vụ, phần thưởng, cấp độ)
- **Activity Timeline**: Timeline hoạt động gần đây

## 📦 Cài đặt

### Yêu cầu

- Python 3.10+
- Node.js 18+
- MongoDB 5.0+
- CLOVA X - Naver Key

### Backend Setup

```bash
# Clone repository
git clone https://github.com/bonxom/Kiddy-Mate.git
cd Kiddy-Mate/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL=mongodb://localhost:27017
# - DATABASE_NAME=kiddymate
# - NAVER_API_KEY=your_naver_key
# - JWT_SECRET_KEY=your_secret_key

# Initialize database
python seed.py  # Optional: seed demo data

# Run server
uvicorn main:app --reload
```

Server sẽ chạy tại `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
# VITE_API_BASE_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## ⚙️ Cấu hình

### Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_URL=mongodb://localhost:27017
DATABASE_NAME=kiddymate

# API Keys
NAVER_API_KEY=sk-...

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Server
ENVIRONMENT=development
```

#### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🚀 Sử dụng

### 1. Đăng ký và Onboarding

1. **Đăng ký tài khoản Phụ huynh**
2. **Hoàn thành Onboarding**:
   - Thông tin phụ huynh
   - Thông tin trẻ em
   - Đánh giá phát triển (Assessment) - AI sẽ phân tích và tạo initial_traits
3. **Hệ thống tự động tạo nhiệm vụ ban đầu** dựa trên đánh giá

### 2. Quản lý Nhiệm vụ (Phụ huynh)

- **Xem Dashboard**: Xem thống kê và phân tích
- **Gán nhiệm vụ**:
  - Chọn từ thư viện nhiệm vụ
  - Tùy chỉnh tên, phần thưởng, danh mục
  - Gán cho trẻ
- **Xác thực nhiệm vụ**: Xem và phê duyệt nhiệm vụ trẻ đã hoàn thành
- **Tạo nhiệm vụ từ báo cáo**: AI phân tích cảm xúc và tạo nhiệm vụ phù hợp

### 3. Tương tác với Avatar (Trẻ em)

- **Đăng nhập bằng tài khoản trẻ**
- **Chat với Robot**:
  - Nhập text hoặc sử dụng speech-to-text
  - Robot phản hồi bằng AI (text-to-speech)
  - Hệ thống tự động phát hiện cảm xúc từ tin nhắn

### 4. Xem Báo cáo (Phụ huynh)

- **Tạo báo cáo**: Nhấn "Generate Report" để AI tạo báo cáo phát triển
- **Xem phân tích**:
  - Phân tích cảm xúc
  - Điểm mạnh và cần cải thiện
  - Gợi ý hoạt động
- **Tạo nhiệm vụ từ báo cáo**: AI tự động tạo nhiệm vụ dựa trên insights

## 🎯 Tính năng nổi bật

### 1. Phân tích Cảm xúc Thông minh

- Phát hiện cảm xúc từ text input
- Suy luận cảm xúc từ hoạt động nhiệm vụ
- Phân tích xu hướng cảm xúc theo thời gian
- Visualize bằng Emotion Pie Chart

### 2. Tạo Nhiệm vụ AI

- Tạo nhiệm vụ dựa trên đánh giá phát triển
- Tạo nhiệm vụ từ báo cáo cảm xúc
- Tự động hóa tạo nhiệm vụ định kỳ
- Tối ưu hóa theo danh mục và ưu tiên

### 3. Báo cáo Tự động

- AI phân tích toàn diện
- Gợi ý hành động cụ thể
- Tự động tạo báo cáo hàng tuần
- Insights sâu sắc về phát triển

### 4. Tương tác 3D Avatar

- Robot 3D tương tác
- Chat thông minh với AI
- Text-to-speech & Speech-to-text
- Ghi nhận và phân tích tương tác

---

**Made with ❤️ for child development**
