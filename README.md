# 🔥 Remotion Facebook Reels US - Fleet Video Engine (60 Episodes)

Bộ mã nguồn sản xuất video tự động chất lượng cao bằng **Remotion + React + TypeScript** được thiết kế chuẩn tỉ lệ dọc **9:16 (1080x1920)**, 60fps / 30fps mượt mà, tối ưu thuật toán giữ chân người xem (Retention & Viral Engagement) cho **Facebook Reels US**, **TikTok US**, và **YouTube Shorts US**.

---

## 📚 Tổng Quan Kho Dữ Liệu 60 Video (7 Chủ Đề)

| Chủ đề | Thư mục Composition | Số tập | Thời lượng | Đặc trưng thuật toán |
| :--- | :--- | :--- | :--- | :--- |
| **1. Fake iMessage Drama (AITAH)** | `05-ChatDrama-TamSuAITAH` | 10 video | Khoảng 67–86s | Vua cmt / tranh luận ý kiến |
| **2. Bible & Ancient Scripture** | `01-Bible-KinhThanh` | 10 video | Khoảng 101–105s | Vua chia sẻ (Shares), tôn giáo US |
| **3. 80s & 90s American Nostalgia** | `02-Nostalgia-HoaiNiem-80s90s`| 10 video | Khoảng 104–110s | RPM cao nhất, văn hóa US 80s/90s |
| **4. US State Secrets & Crazy Laws** | `03-CrazyLaws-LuatKyQuac` | 10 video | Khoảng 104–111s | Kích thích tự hào bang, luật kỳ lạ |
| **5. US Geography & IQ Trivia** | `04-Geography-DiaLyMy` | 10 video | Khoảng 97–113s | Thử thách IQ, kiến thức địa lý |
| **6. Kinetic ASMR Singularity Siege** | `06-Singularity-VatLyASMR` | 10 video | 45-100s | Vua giữ chân, vật lý thôi miên |
| **7. Data & Bar Chart Races** | `07-DataRaces-DuaTopSoLieu` | 2 video | 20.0s | Đồ họa so sánh Big Tech & Tỷ phú |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
remotion-reels-demo/
├── docs/
│   └── HE_THONG_60_VIDEO_REELS_US.md  # Cẩm nang chi tiết toàn bộ 60 tập & thông số
├── public/
│   ├── audio/                         # 310 file giọng đọc US bản xứ (SAPI TTS)
│   ├── sounds/                        # SFX âm thanh ASMR, crystal bells, tick, ding
│   └── guide.html                     # Bảng tra cứu 60 tập trực quan có nút copy lệnh
├── scripts/
│   └── render-fleet.js                # Công cụ render hàng loạt MP4 + Thumbnail
├── src/
│   ├── Root.tsx                       # Đăng ký 60 compositions song ngữ Anh - Việt
│   ├── StudioBilingualBadge.tsx       # Huy hiệu xem trước song ngữ (ẩn khi render)
│   ├── data/                          # Toàn bộ dữ liệu 60 tập (Bible, Nostalgia, Singularity,...)
│   ├── BibleQuiz/                     # Template Đố vui Kinh Thánh
│   ├── NostalgiaQuiz/                 # Template Hoài niệm Mỹ 80s-90s
│   ├── CrazyLawsQuiz/                 # Template Luật kỳ quặc 50 bang
│   ├── ChatDrama/                     # Template Drama tin nhắn AITAH
│   ├── SingularitySiege/              # Template Kinetic ASMR Orbital Rings
│   ├── BarChartRace/                  # Template Đua số liệu công nghệ
│   └── BillionairesRace/              # Template Đua tài sản tỷ phú
├── out/                               # Thư mục xuất video MP4 & ảnh bìa Thumbnail
├── package.json
└── tsconfig.json
```

---

## 🚀 Khởi Động & Xem Trước (Preview)

### Mở Remotion Studio (Port 3100)
```bash
npm start
# Truy cập giao diện trực quan: http://localhost:3100
```
- Thanh Sidebar đã được nhóm theo từng chủ đề song ngữ Anh - Việt.
- Bảng tra cứu trực quan 1 click: [http://localhost:3100/guide.html](http://localhost:3100/guide.html).

---

## ⚙️ Lệnh Xuất Video Hàng Loạt (Render Fleet)

Tất cả lệnh render đều tự động xuất song song **video MP4** và **ảnh bìa Thumbnail 1080x1920**:

```bash
# Xuất 10 video ASMR Singularity Siege
npm run render:singularity

# Xuất 10 video iMessage Drama
npm run render:chat

# Xuất 10 video Kinh Thánh
npm run render:bible

# Xuất 10 video Hoài niệm thập niên 80s/90s
npm run render:nostalgia

# Xuất 10 video Luật kỳ quặc 50 bang
npm run render:laws

# Xuất 10 video Địa lý Mỹ
npm run render:geography

# Xuất lẻ 1 tập bất kỳ (Ví dụ tập 1 của Singularity)
node scripts/render-fleet.js --topic=singularity --ep=1

# Xuất toàn bộ 60 video của tất cả các chủ đề
npm run render:fleet
```

---

## Kiểm chứng trước khi xuất video

```bash
npm test                 # Biên dịch TypeScript, kiểm tra 60 tập và chạy test hồi quy
npm run verify          # Kiểm tra dữ liệu/timeline của 60 tập từ source mới nhất
npm run test:regression # Test WAV hỏng, metadata sai và lỗi pipeline (chạy npm test lần đầu)
npm run audio:measure   # Đo lại WAV sau khi thay hoặc chỉnh sửa âm thanh
```

`build:tts` tự biên dịch dữ liệu trước khi tạo giọng đọc và đo lại WAV sau khi tạo xong.
`render:fleet`, các lệnh `render:<topic>` và `build:all` chạy kiểm chứng trước khi render;
nếu thất bại, pipeline dừng với exit code 1. Các lệnh `build:<topic>` xuất trực tiếp nên cần chạy `npm run verify` trước.
Thời lượng Quiz và Chat Drama tính theo WAV, không còn cố định 80/45 giây.
Thiếu metadata hoặc thời lượng không hợp lệ sẽ báo lỗi thay vì dùng giá trị đoán.

Kiểm tra tự động bao gồm 40 tập Quiz, 10 Chat Drama và 10 Singularity; hai Data Race là video riêng.
Kết quả kiểm tra dữ liệu/timeline không thay thế việc xem và nghe MP4.
Singularity tập 2 giữ trạng thái cuối trong 2 frame cuối vì dữ liệu có 3000 frame và video dài 3002 frame.

## 🔗 Liên Kết Tự Động Với Tool Đăng Reels (Port 5200)

Thư mục `out/` của dự án này liên kết trực tiếp với ứng dụng **Reels Studio Pro** (`antidetect-manager`):
- Mọi video kết xuất tại `out/` sẽ được nạp tự động vào kho Media của Tool.
- Tool sẽ tự động phân bổ và hẹn giờ xuất bản theo khung giờ vàng US qua Meta Graph API v25.0.
