# AWS Bedrock AI Chatbot 🤖☁️

![Mô tả ảnh: Giao diện Chatbot](<img width="1913" height="908" alt="image" src="https://github.com/user-attachments/assets/7a69619d-78bc-4047-ab51-31e0200485ba" />
) 
*(Gợi ý: Bạn có thể chụp màn hình giao diện app của bạn và thay link ảnh vào đây)


## 📖 Giới thiệu dự án
Đây là một ứng dụng Full-stack Chatbot tích hợp trực tiếp với các mô hình ngôn ngữ lớn (LLMs) thông qua **Amazon Bedrock**. Dự án minh họa quy trình xây dựng một trợ lý ảo từ việc thiết kế giao diện người dùng (UI) đến xử lý luồng dữ liệu API Backend một cách bảo mật và hiệu quả.

Dự án này được xây dựng nhằm ứng dụng các kỹ năng về **AI Integration, Data Processing, và Cloud Services**, quản lý an toàn thông tin xác thực (credentials) và triển khai thực tế (deployment).

### ✨ Các tính năng nổi bật
* **Tích hợp LLM Đa Dạng:** Giao tiếp mượt mà với các mô hình như Gemma 3, DeepSeek thông qua chuẩn thư viện `@aws-sdk/client-bedrock-runtime` (Converse API).
* **Kiến trúc Bảo mật:** Không gọi API trực tiếp từ Client. Toàn bộ logic giao tiếp với AWS và API Keys được bảo vệ an toàn ở tầng Backend (Node.js).
* **Xử lý Dữ liệu Thời gian thực:** Chuyển đổi và định dạng luồng dữ liệu (JSON payloads) giữa Client và AWS Bedrock.
* **Giao diện Hiện đại:** Dark mode chuyên nghiệp, tối ưu trải nghiệm người dùng (UX/UI).

---

## 🛠️ Công nghệ sử dụng
* **Frontend:** HTML5, CSS3, Vanilla JavaScript.
* **Backend:** Node.js, Express.js.
* **Cloud & AI:** AWS Bedrock (GPT OSS 120B), AWS IAM.
* **Deployment:** Render (Hosting Backend & Web).

---

## 🚀 Trải nghiệm trực tiếp (Live Demo)
Bạn có thể dùng thử ứng dụng ngay tại đây: 
👉 **https://aws-bedrock-chatbot-oh7b.onrender.com/**

---

## 💻 Hướng dẫn Cài đặt & Chạy trên máy cá nhân (Local)

### 1. Yêu cầu hệ thống
* Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18+).
* Có tài khoản AWS và đã lấy `Access Key ID` & `Secret Access Key` có quyền truy cập Amazon Bedrock.

### 2. Cài đặt chi tiết
**Bước 1:** Clone repository này về máy
```bash
git clone [https://github.com/](https://github.com/)[Tên-GitHub-Của-Bạn]/[Tên-Repo-Của-Bạn].git
cd [Tên-Repo-Của-Bạn]
