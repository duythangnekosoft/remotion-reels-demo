# 📌 TIÊU CHÍ BẮT BUỘC KHI SẢN XUẤT VIDEO REMOTION REELS

Tài liệu này được **ghim cố định** làm kim chỉ nam cho toàn bộ quá trình phát triển, biên tập và xuất video trên hệ thống Remotion Reels.

---

## 1. Thử thách quyết định thời lượng (100% Hoàn Thành Thử Thách)
* **Tuyệt đối không cắt ngang video khi thử thách chưa xong** để ép vào thời lượng tùy tiện.
* Video chỉ được phép kết thúc khi đã hoàn tất mục tiêu:
  * **Brick Breaker:** Bóng phải phá sạch 100% gạch (toàn bộ 3,076 viên) rồi mới hiển thị màn hình vinh danh.
  * **Marble Race:** Các viên bi đua vượt chướng ngại vật, bi về đích chạm vạch và hiển thị Podium vinh danh quán quân.
  * **Territory Conquest:** Một màu/phe phải chiếm trọn vẹn 100% lãnh thổ bản đồ.
  * **Lucky Plinko:** Bóng nảy ASMR rơi trúng ô Jackpot **$1,000,000**.
  * **Quiz / Trivia:** Đọc hết câu hỏi, chạy hết bộ đếm 10 giây, hé lộ đáp án và đọc giải thích.
* Thời lượng video dài hay ngắn sẽ linh động theo độ dài hoàn thành của thử thách đó.

---

## 2. 100% Text Canvas Bằng Tiếng Anh
* Toàn bộ text hiển thị trên video (tiêu đề, câu hỏi, 4 đáp án A/B/C/D, bảng xếp hạng, tin nhắn chat, pop-up chiến thắng...) phải là **chuẩn tiếng Anh bản xứ (US English)**.
* Không chèn chữ tiếng Việt lên khung hình video.

---

## 3. Thời lượng tối ưu cho Reels/Shorts (Tối thiểu >= 30s)
* Tránh video quá ngắn dưới 30 giây.
* Thời lượng lý tưởng cho các dòng video ngắn giữ chân người xem là từ **30s – 45s+** (các video đố vui tri thức từ **60s – 104s**).

---

## 4. Tinh gọn & Độc bản (Mỗi thể loại 1 Video Master chuẩn)
* Không tạo hàng loạt tập giống nhau gây rối mắt.
* Mỗi thư mục trong Remotion Studio chỉ chứa **duy nhất 1 Video đại diện chuẩn nhất** (loại bỏ các bản duplicate `*-Ep1`).

---

## 5. Âm thanh & Lồng tiếng đồng bộ tuyệt đối (Zero Speech Cutoff)
* Voiceover đọc tự nhiên, chuẩn giọng đọc Mỹ.
* Khung thời gian chữ và sự kiện hiển thị phải bám sát chính xác thời lượng file âm thanh thực tế (`audioDurations.json` đo từ header WAV).
* Không bao giờ để âm thanh bị cắt cụt đuôi câu hoặc nói đè lên nhau.

---

## 6. Danh mục thể loại Viral thịnh hành
Hệ thống tập trung vào 12 dòng nội dung thịnh hành:
1. `01-Marble-Race`: Đua bi cơ học Grand Prix
2. `02-Territory-Conquest`: Chiến thuật chiếm 100% bản đồ
3. `03-Plinko-ASMR`: Thả bóng nảy ASMR trúng $1,000,000
4. `04-Would-You-Rather`: Song đấu lựa chọn cân não
5. `05-Last-Marble`: Tuyệt phẩm vật lý cơ học ASMR
6. `06-Kinetic-Games`: Đấu trường bóng nảy, phá gạch, nhân đôi bóng
7. `07-Data-Races`: Đua top vốn hóa và bảng xếp hạng tỷ phú
8. `08-AITAH-Chat-Drama`: Tin nhắn iMessage tâm sự drama
9. `09-Bible-Trivia`: Đố vui Kinh Thánh
10. `10-80s-90s-Nostalgia`: Đố vui hoài niệm thập niên 80-90
11. `11-US-Crazy-Laws`: Đố vui luật kỳ quặc 50 bang nước Mỹ
12. `12-US-Geography-IQ`: Thử tài địa lý nước Mỹ
*(Đã loại bỏ hoàn toàn game SingularitySiege)*

---

## 7. Phân mục & Menu xuất video tiện lợi
* Tích hợp sẵn `Render_Menu.bat` xuất từng video lẻ hoặc xuất trọn bộ chỉ với 1 phím bấm.
* Đồng bộ 100% giữa môi trường làm việc và thư mục ngoài Desktop.

