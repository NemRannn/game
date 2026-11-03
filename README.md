# 🐍 SnakeCute.io — Game Rắn Săn Mồi Đáng Yêu Nhiều Người Chơi

> Game Snake.io siêu mượt, đồ họa hoạt hình dễ thương với đôi mắt to tròn biểu cảm, hỗ trợ hoàn hảo trên **Điện thoại (iOS/Android), iPad / Máy tính bảng và PC**.

---

## ✨ Điểm nổi bật & Tính năng

1. **Phòng chơi riêng biệt (Mã 6 số)**:
   - Tạo phòng nhận ngay mã 6 số ngẫu nhiên (ví dụ `582910`).
   - Bạn bè/người yêu chỉ cần nhập mã là vào chung trận ngay lập tức.
   - Hỗ trợ vào phòng trực tiếp qua đường link: `https://your-domain.onrender.com/?room=582910`.

2. **2 Chế độ chơi tùy chọn**:
   - ⚔️ **Cạnh Tranh Tự Do (FFA)**: Đua top bảng điểm, đâm vào thân bất kỳ ai đều nổ kẹo.
   - 💕 **Cặp Đôi Đồng Lòng (Duo Co-op)**: Hai bạn đi xuyên thân nhau an toàn, cùng săn bot AI!

3. **8 Bộ Skin Siêu Dễ Thương**:
   - 🐱 Mèo Kitty, 🐼 Gấu Panda, 🐶 Corgi Năng Động, 🦖 Khủng Long Bé, 🍓 Bé Dâu Tây, 🧋 Trà Sữa Trân Châu, 🌈 Cầu Vồng Pastel, 🐥 Gà Con Chíp Chíp.
   - Mắt to tròn chớp nháy, biểu cảm há hốc khi tăng tốc hoặc nguy hiểm, dizzy mắt xoay khi ngã.

4. **Hệ thống Điều khiển Đa nền tảng**:
   - **Điện thoại & iPad**: Chạm vuốt điều hướng + **chạm giữ ngón thứ 2 bất kỳ trên màn hình để Tăng Tốc** (chuẩn cảm giác Snake.io). Có thêm nút bấm Tăng Tốc trên màn hình cho người chơi 1 tay.
   - **PC**: Rê chuột theo hướng muốn đi + nhấn Phím Cách (Space) hoặc Nhấp chuột trái để Tăng Tốc.

5. **5 Vật phẩm bổ trợ xuất hiện trên bản đồ**:
   - 🧲 **Nam Châm (Magnet)**: Hút tất cả các hạt thức ăn lân cận.
   - ⚡ **Siêu Tốc (Speed Surge)**: Tăng tốc tối đa không hao hụt chiều dài.
   - 🛡️ **Khiên Bảo Vệ (Shield)**: Bất tử trước va chạm thân rắn khác trong thời gian ngắn.
   - 🌟 **x2 Điểm / Thân**: Mỗi viên kẹo ăn được nhân đôi kích thước và điểm số.
   - 🔍 **Kính Viễn Vọng (Vision)**: Mở rộng tầm nhìn toàn cảnh đấu trường.

6. **AI Bot Thông Minh**:
   - 60% Bot dạo chơi hiền lành, thu thập kẹo.
   - 40% Bot Thợ Săn thông minh: Biết quan sát đối thủ, phóng tốc độ ép góc cắt đầu.

---

## 🚀 Hướng Dẫn Deploy Miễn Phí Lên Render.com (1-Click)

Bạn có thể đưa game lên mạng Internet hoàn toàn miễn phí và có link chia sẻ ngay cho bạn bè:

1. Đăng ký/Đăng nhập tài khoản miễn phí tại [Render.com](https://render.com).
2. Nhấn nút **New +** ở góc phải trên -> Chọn **Web Service**.
3. Chọn **Build and deploy from a Git repository** -> Kết nối với tài khoản GitHub của bạn.
4. Chọn repository `game` (hoặc `https://github.com/NamRannn/game`).
5. Điền thông tin cơ bản:
   - **Name**: `snake-cute` (hoặc tên tùy thích)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan Type**: `Free` ($0/tháng)
6. Nhấn **Create Web Service**. Đợi 1–2 phút để Render tự động tải mã nguồn và khởi chạy.
7. Khi thấy trạng thái **Live**, bạn sẽ nhận được đường link (ví dụ: `https://snake-cute.onrender.com`). Gửi link đó cho bạn bè/người yêu để chơi cùng nhau ngay!

---

## 💻 Chạy Thử Trên Máy Cá Nhân (Local)

```bash
# Cài đặt thư viện
npm install

# Khởi chạy server
npm start

# Mở trình duyệt truy cập:
# http://localhost:3000
```

