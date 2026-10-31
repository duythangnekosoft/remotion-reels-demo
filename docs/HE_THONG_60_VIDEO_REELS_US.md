# 🚀 HỆ THỐNG KHO 60 VIDEO TỰ ĐỘNG HÓA FACEBOOK REELS US (10 EPISODES / CHỦ ĐỀ)

Hệ thống được phát triển theo kiến trúc **Data-Driven Video Engine** trên nền tảng Remotion (React + TypeScript), tích hợp sẵn **60 tập video hoàn chỉnh (10 tập cho mỗi chủ đề, bao gồm chủ đề mới Kinetic ASMR Physics)** nhắm trực tiếp vào thị hiếu người dùng Mỹ để tối đa hóa doanh thu từ Facebook Performance Bonus & Monetization.

---

## 📚 KHO DỮ LIỆU NỘI DUNG 60 TẬP (CONTENT DATABASE)

Mỗi chủ đề sở hữu 10 tập kịch bản hoặc mô phỏng độc lập kèm âm thanh chuẩn phòng thu, hiệu ứng và hook giữ chân người xem:

| Chủ đề (#) | Thư mục & Mã Composition Song Ngữ | Số tập | Thời lượng | Định dạng & Điểm mạnh thuật toán FB Reels | File dữ liệu nguồn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Fake iMessage Drama (AITAH)** | `05-ChatDrama-TamSuAITAH`<br>`ChatDrama-Ep1-Tap1` .. `Tap10` | **10 video** | 45.0s | **Vua tranh luận & bình luận**: 10 câu chuyện drama gia đình/công việc kịch tính, kết thúc bằng bảng bình chọn A/B. | [`src/data/chatDramaEpisodes.ts`](../src/data/chatDramaEpisodes.ts) |
| **2. Bible & Ancient Scripture** | `01-Bible-KinhThanh`<br>`BibleQuiz-Ep1-Tap1` .. `Tap10` | **10 video** | 80.0s | **Vua chia sẻ (Shares)**: 50 câu hỏi Kinh Thánh chọn lọc, 5 câu/video, 10s đếm ngược suy nghĩ, phong cách vàng cổ kính. | [`src/data/bibleEpisodes.ts`](../src/data/bibleEpisodes.ts) |
| **3. 80s & 90s American Nostalgia** | `02-Nostalgia-HoaiNiem-80s90s`<br>`NostalgiaQuiz-Ep1-Tap1` .. `Tap10` | **10 video** | 80.0s | **RPM cao nhất (Gen X/Boomers)**: 50 câu hỏi hoài niệm văn hóa Mỹ thập niên 80-90, kích thích hoài niệm tuổi thơ. | [`src/data/nostalgiaEpisodes.ts`](../src/data/nostalgiaEpisodes.ts) |
| **4. US State Secrets & Crazy Laws** | `03-CrazyLaws-LuatKyQuac`<br>`CrazyLaws-Ep1-Tap1` .. `Tap10` | **10 video** | 80.0s | **Kích thích tự hào tiểu bang**: 50 đạo luật kỳ quặc nhất trên khắp 50 bang Hoa Kỳ, phong cách hồ sơ vụ án cảnh sát. | [`src/data/crazyLawsEpisodes.ts`](../src/data/crazyLawsEpisodes.ts) |
| **5. US Geography & IQ Trivia** | `04-Geography-DiaLyMy`<br>`GeographyQuiz-Ep1-Tap1` .. `Tap10` | **10 video** | 80.0s | **Thử thách trí tuệ IQ**: 50 câu đố bờ biển, thủ phủ bang, danh lam thắng cảnh, dòng sông và địa lý nước Mỹ. | [`src/data/geographyEpisodes.ts`](../src/data/geographyEpisodes.ts) |
| **6. Kinetic ASMR Singularity Siege** | `06-Singularity-VatLyASMR`<br>`SingularitySiege-Ep1-Tap1` .. `Tap10` | **10 video** | 45s - 100s | **Vua Retention & ASMR Thôi miên**: Mô phỏng vật lý hấp dẫn 108 tinh thể cộng hưởng 4 tầng, âm thanh chuông pha lê ASMR, công thức pacing 3 giai đoạn (165 frames). | [`src/data/singularity/`](../src/data/singularity/) |
| **7. Data & Bar Chart Races** | `07-DataRaces-DuaTopSoLieu`<br>`BarChartRaceTech-CongNghe`<br>`BillionairesRace-TyPhu` | **2 video**<br>+ 2 thumb | 20.0s | **Vua Đồ Họa So Sánh**: Biểu đồ chạy đua vốn hóa Big Tech & top tỷ phú thế giới 2000-2026. | [`src/BarChartRace/raceData.ts`](../src/BarChartRace/raceData.ts) |

---

## 🌐 HỆ THỐNG CHÚ THÍCH SONG NGỮ ANH - VIỆT TRÊN WEB

Nhằm giúp dễ dàng đối chiếu và quản lý nhiều Page mà không bị nhầm lẫn giữa các chủ đề:

1. **Thanh Sidebar Remotion Studio**: Tên các Folder và Composition đều được đặt song ngữ Anh - Việt:
   - `01-Bible-KinhThanh` (`BibleQuiz-Ep1-Tap1` ... `BibleQuiz-Ep10-Tap10`)
   - `02-Nostalgia-HoaiNiem-80s90s` (`NostalgiaQuiz-Ep1-Tap1` ... `NostalgiaQuiz-Ep10-Tap10`)
   - `03-CrazyLaws-LuatKyQuac` (`CrazyLaws-Ep1-Tap1` ... `CrazyLaws-Ep10-Tap10`)
   - `04-Geography-DiaLyMy` (`GeographyQuiz-Ep1-Tap1` ... `GeographyQuiz-Ep10-Tap10`)
   - `05-ChatDrama-TamSuAITAH` (`ChatDrama-Ep1-Tap1` ... `ChatDrama-Ep10-Tap10`)
   - `06-Singularity-VatLyASMR` (`SingularitySiege-Ep1-Tap1` ... `SingularitySiege-Ep10-Tap10`)
   - `07-DataRaces-DuaTopSoLieu` (`BarChartRaceTech-CongNghe`, `BillionairesRace-TyPhu`)

2. **Huy hiệu Chú Thích Thông Minh trên Canvas Preview (`StudioBilingualBadge`)**:
   - Khi xem trước trên web [http://localhost:3100](http://localhost:3100), góc trên cùng màn hình hiển thị trực tiếp bảng chú thích:
     * `🇻🇳 TIẾNG VIỆT: Đố Vui Kinh Thánh (Tập 1/10)`
     * `🇺🇸 ENGLISH: Bible & Scripture Trivia • Episode 1`
   - **Tự động ẩn khi xuất MP4**: Khi chạy lệnh render xuất file cho Facebook Reels US (`isRendering === true`), huy hiệu này hoàn toàn tự động ẩn đi, đảm bảo video xuất ra là 100% tiếng Anh bản ngữ cho khán giả Mỹ.

3. **Trang Cẩm Nang Tra Cứu Toàn Diện Song Ngữ (`guide.html`)**:
   - Mở trực tiếp tại: 👉 [http://localhost:3100/guide.html](http://localhost:3100/guide.html)
   - Liệt kê toàn bộ 60 tập chi tiết, có nút bấm 1 click để copy lệnh xuất bản cho từng tập.

---

## 🌌 CHỦ ĐỀ: KINETIC ASMR SINGULARITY SIEGE (ORBITAL RINGS)

Được chuyển giao nguyên vẹn từ kỹ năng đỉnh cao của bộ `01_Page1_Singularity_OrbitalRings`:
- **Vật lý thực (Deterministic Physics Engine)**: 3 sao băng quỹ đạo (comets) bay dưới trường hấp dẫn trung tâm và lực đẩy Deflector Cross.
- **108 Lõi Tinh Thể Lục Giác (Hexagonal Crystals)** xếp thành 4 vành đai:
  - Vành 1 (R=410, 36 lõi, Cyan `#00F0FF`)
  - Vành 2 (R=330, 30 lõi, Green `#39FF14`)
  - Vành 3 (R=250, 24 lõi, Gold `#FFD700`)
  - Vành 4 (R=170, 18 lõi, Magenta `#FF007F`)
- **Âm thanh ASMR Đồng Bộ Tuyệt Đối**: 27 âm sắc chuông pha lê tần số cao (`crystal_0.wav` đến `crystal_9.wav`), tiếng va chạm vành đai (`wall_bounce.wav`), súng cao tốc (`slingshot.wav`), mốc phá vỡ (`milestone.wav`), và vụ nổ sụp đổ hố đen (`singularity_collapse.wav`).
- **Chuẩn Pacing Formula 3 Giai Đoạn (165 frames @ 30fps)**:
  - **Giai đoạn 1 (60 frames / 2.0s)**: Quan sát vật lý lắng đọng (các hạt tan dần, sao băng lướt trong khoảng không đã dọn sạch).
  - **Giai đoạn 2 (15 frames / 0.5s)**: Bảng kết quả SSS+ xuất hiện mượt mà (Cubic Ease-Out scale 0.82 -> 1.0).
  - **Giai đoạn 3 (90 frames / 3.0s)**: Dừng bảng kết quả hiển thị thông số: Thời gian dọn sạch, 108/108 (100%), Vận tốc cực đại, CTA.
- **Danh sách 10 Seeds độc lập**:
  - Tập 1: Seed `10031` (2019 frames ~ 67.3s)
  - Tập 2: Seed `10042` (3002 frames ~ 100.1s)
  - Tập 3: Seed `10055` (1376 frames ~ 45.9s)
  - Tập 4: Seed `10068` (1841 frames ~ 61.4s)
  - Tập 5: Seed `10077` (2891 frames ~ 96.4s)
  - Tập 6: Seed `10083` (2072 frames ~ 69.1s)
  - Tập 7: Seed `10091` (2097 frames ~ 69.9s)
  - Tập 8: Seed `10104` (2348 frames ~ 78.3s)
  - Tập 9: Seed `10118` (2410 frames ~ 80.3s)
  - Tập 10: Seed `10129` (2536 frames ~ 84.5s)

---

## 🎙️ BỘ 310 VOICEOVER TIẾNG ANH MỸ BẢN XỨ (OFFLINE SAPI)

Đã khởi tạo tự động toàn bộ **310 tệp âm thanh giọng đọc tiếng Anh Mỹ chất lượng cao** trong thư mục `public/audio/`:
- `public/audio/chat/ep1_m1.wav` ... `ep10_m7.wav` (Giọng nữ Zira và nam David đối thoại sống động)
- `public/audio/bible/ep1_q1.wav` ... `ep10_outro.wav`
- `public/audio/nostalgia/ep1_q1.wav` ... `ep10_outro.wav`
- `public/audio/laws/ep1_q1.wav` ... `ep10_outro.wav`
- `public/audio/geography/ep1_q1.wav` ... `ep10_outro.wav`

---

## ⚙️ CÔNG CỤ XUẤT BẢN HÀNG LOẠT (FLEET RENDER ENGINE)

Tất cả lệnh render đều tự động tạo song song **file video MP4** và **file ảnh Thumbnail 1080x1920** tương ứng vào thư mục `out/`:

### 1. Xuất trọn bộ 10 video của từng chủ đề:
```bash
# Xuất 10 video Kinetic ASMR Singularity Siege (Chủ đề mới):
npm run render:singularity

# Xuất 10 video iMessage Drama:
npm run render:chat

# Xuất 10 video Kinh Thánh:
npm run render:bible

# Xuất 10 video Hoài niệm 80s/90s:
npm run render:nostalgia

# Xuất 10 video Luật kỳ quặc:
npm run render:laws

# Xuất 10 video Địa lý Mỹ:
npm run render:geography
```

### 2. Xuất lẻ 1 tập bất kỳ:
```bash
node scripts/render-fleet.js --topic=singularity --ep=1
node scripts/render-fleet.js --topic=chat --ep=3
```

### 3. Xuất toàn bộ 60 video của tất cả các chủ đề:
```bash
npm run render:fleet
```

---

## 🔗 KẾT NỐI VỚI REELS STUDIO PRO (PORT 5200)

Thư mục `out/` của dự án này được tích hợp trực tiếp vào **Reels Studio Pro** (`c:\Users\Admin\.gemini\antigravity-ide\scratch\antidetect-manager`). Khi bạn render video xong, Reels Studio Pro sẽ tự động quét thư mục `out/` và sẵn sàng xếp lịch đăng bài lên 10 Fanpage Facebook US thông qua Meta Graph API v25.0.

