# 🌐 Hướng Dẫn Deploy Game Miễn Phí 100% Để Chơi Chung (Render.com)

Để bạn và người yêu có thể mở điện thoại, iPad hoặc máy tính ở bất kỳ đâu và vào chung phòng chơi mượt mà với nhau, nền tảng phù hợp và dễ nhất hiện nay là **Render.com** (miễn phí 100%, hỗ trợ WebSocket thời gian thực không giới hạn).

---

## 📌 Các bước triển khai (Chỉ mất 2 phút)

### Bước 1: Đăng nhập Render
1. Truy cập vào [https://render.com](https://render.com).
2. Nhấn **GET STARTED FOR FREE** (hoặc Sign In).
3. Chọn **Sign in with GitHub** (dùng chính tài khoản GitHub chứa repository game này).

### Bước 2: Tạo Web Service mới
1. Trên giao diện Render Dashboard, nhấn nút **New +** ở góc trên cùng bên phải.
2. Chọn **Web Service**.
3. Chọn **Build and deploy from a Git repository** -> Nhấn **Next**.
4. Tìm và chọn repository `NamRannn/game` (hoặc dán đường dẫn `https://github.com/NamRannn/game.git`). Nhấn **Connect**.

### Bước 3: Cấu hình thông tin dịch vụ
Điền các mục sau (rất đơn giản):
- **Name**: `snake-cute` (hoặc tên bất kỳ bạn thích, ví dụ: `snake-nam-va-ny`)
- **Region**: Chọn `Singapore` (để ping thấp nhất, chơi mượt nhất tại Việt Nam)
- **Branch**: `main`
- **Root Directory**: Để trống (mặc định)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Chọn gói **Free** ($0 / tháng)

### Bước 4: Khởi chạy (Deploy)
1. Kéo xuống dưới cùng và nhấn nút **Create Web Service**.
2. Render sẽ tự động tải mã nguồn từ GitHub, cài đặt và khởi động server. Quá trình này chỉ mất khoảng 1 phút.
3. Khi bạn thấy dòng chữ màu xanh lá cây: **Live** kèm đường link ở trên cùng (ví dụ: `https://snake-cute.onrender.com`), nghĩa là game đã chính thức hoạt động trên Internet!

---

## 🎮 Cách vào chơi cùng người yêu

1. Gửi đường link web của bạn (ví dụ: `https://snake-cute.onrender.com`) cho người yêu.
2. Một người bấm **Tạo Phòng (Mã 6 Số)**:
   - Bạn sẽ thấy mã phòng gồm 6 số (ví dụ: `829103`).
   - Chọn chế độ: **Cạnh Tranh (FFA)** hoặc **Cặp Đôi (Duo)**.
   - Bấm vào biểu tượng 📋 trên góc màn hình để copy link phòng gửi qua Messenger/Zalo.
3. Người yêu chỉ cần:
   - Mở link trực tiếp hoặc bấm **Nhập Mã Phòng** -> Điền 6 số -> Bấm **Vào Phòng Ngay**.
4. Hai người sẽ lập tức xuất hiện trong cùng một đấu trường, có tên và biểu tượng ❤️ trên đầu nhau để dễ nhận diện!

---

## 💡 Mẹo chơi mượt trên Điện Thoại & iPad
- **Tăng tốc (Boost)**: Đặt một ngón tay điều hướng, và **chạm giữ ngón tay thứ 2 bất kỳ vào màn hình** để phóng nhanh như Snake.io thật! Hoặc chạm vào nút `⚡ TỐC ĐỘ` ở góc phải.
- **Toàn màn hình**: Trên Safari (iPhone/iPad), nhấn vào nút chia sẻ và chọn **Thêm vào MH chính (Add to Home Screen)** để mở game ở chế độ toàn màn hình như một ứng dụng thực thụ không có thanh địa chỉ!

