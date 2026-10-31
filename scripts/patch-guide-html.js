const fs = require("fs");
const path = require("path");

const guidePath = path.join(__dirname, "..", "public", "guide.html");
let html = fs.readFileSync(guidePath, "utf8");

const newTopicsHtml = `    <!-- TOPIC 6 -->
    <div class="topic-card" id="t6">
      <div class="topic-header">
        <div>
          <span class="topic-title-vn">🏎️ Chủ đề 6: Giải Đua Bi Vượt Chướng Ngại Vật (Marble Grand Prix)</span>
          <span class="topic-title-en">Topic 6: Marble Race Championship (Obstacles, Overtakes & Podium)</span>
        </div>
        <div class="topic-meta">Folder: 06-Marble-Race • 5 Tập (30.6s - 40.3s)</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 80px;">Tập</th>
            <th>Tên tiếng Việt (Chặng Đua & Quán Quân)</th>
            <th>Tên tiếng Anh (Composition ID)</th>
            <th>Thời Lượng</th>
            <th style="width: 220px;">Lệnh xuất video MP4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="ep-badge">Tập 1</span></td>
            <td><strong>Chặng 1: Ultra Violet Vô Địch Bứt Phá</strong></td>
            <td><span class="comp-code">MarbleRace-Ep1</span></td>
            <td>40.3s (1,209f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=marble --ep=1')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 2</span></td>
            <td><strong>Chặng 2: Golden Star Đột Phá Lốc Xoáy</strong></td>
            <td><span class="comp-code">MarbleRace-Ep2</span></td>
            <td>32.8s (983f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=marble --ep=2')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 3</span></td>
            <td><strong>Chặng 3: Neon Emerald Khúc Cua Tử Thần</strong></td>
            <td><span class="comp-code">MarbleRace-Ep3</span></td>
            <td>31.3s (938f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=marble --ep=3')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 4</span></td>
            <td><strong>Chặng 4: Golden Star Về Đích Thần Tốc</strong></td>
            <td><span class="comp-code">MarbleRace-Ep4</span></td>
            <td>30.6s (918f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=marble --ep=4')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 5</span></td>
            <td><strong>Chặng 5: Solar Flare Bùng Nổ Về Đích</strong></td>
            <td><span class="comp-code">MarbleRace-Ep5</span></td>
            <td>38.4s (1,151f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=marble --ep=5')">📋 Copy lệnh</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TOPIC 9 -->
    <div class="topic-card" id="t9">
      <div class="topic-header">
        <div>
          <span class="topic-title-vn">🛡️ Chủ đề 9: Đại Chiến Nảy Bóng Phủ Kín Lãnh Thổ 100% (Territory Conquest)</span>
          <span class="topic-title-en">Topic 9: Territory Conquest (4 Factions, 100% Full Map Domination)</span>
        </div>
        <div class="topic-meta">Folder: 09-Territory-Conquest • 5 Tập (36.0s / 1,080f)</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 80px;">Tập</th>
            <th>Phe Chiến Thắng (100% 600 Ô Lưới)</th>
            <th>Tên tiếng Anh (Composition ID)</th>
            <th>Thời Lượng</th>
            <th style="width: 220px;">Lệnh xuất video MP4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="ep-badge">Tập 1</span></td>
            <td><strong>Phe Đỏ Crimson Blaze Thống Trị</strong></td>
            <td><span class="comp-code">Territory-Ep1</span></td>
            <td>36.0s (1,080f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=territory --ep=1')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 2</span></td>
            <td><strong>Phe Xanh Neon Cyan Thống Trị</strong></td>
            <td><span class="comp-code">Territory-Ep2</span></td>
            <td>36.0s (1,080f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=territory --ep=2')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 3</span></td>
            <td><strong>Phe Vàng Solar Gold Thống Trị</strong></td>
            <td><span class="comp-code">Territory-Ep3</span></td>
            <td>36.0s (1,080f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=territory --ep=3')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 4</span></td>
            <td><strong>Phe Tím Cyber Violet Thống Trị</strong></td>
            <td><span class="comp-code">Territory-Ep4</span></td>
            <td>36.0s (1,080f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=territory --ep=4')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 5</span></td>
            <td><strong>Phe Đỏ Crimson Blaze Tái Đấu Toàn Thắng</strong></td>
            <td><span class="comp-code">Territory-Ep5</span></td>
            <td>36.0s (1,080f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=territory --ep=5')">📋 Copy lệnh</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TOPIC 10 -->
    <div class="topic-card" id="t10">
      <div class="topic-header">
        <div>
          <span class="topic-title-vn">🎰 Chủ đề 10: Thả Bóng Plinko ASMR Ăn Jackpot $1,000,000</span>
          <span class="topic-title-en">Topic 10: Lucky Plinko $1M Fortune Drop ASMR</span>
        </div>
        <div class="topic-meta">Folder: 10-Plinko-ASMR • 5 Tập (30.7s - 34.5s)</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 80px;">Tập</th>
            <th>Thử Thách Đạt Mốc Jackpot $1,000,000</th>
            <th>Tên tiếng Anh (Composition ID)</th>
            <th>Thời Lượng</th>
            <th style="width: 220px;">Lệnh xuất video MP4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="ep-badge">Tập 1</span></td>
            <td><strong>Cơn Mưa Vàng Chạm Mốc $1,000,000 (26.3s)</strong></td>
            <td><span class="comp-code">Plinko-Ep1</span></td>
            <td>33.3s (998f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=plinko --ep=1')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 2</span></td>
            <td><strong>Đại Tiệc Chuông ASMR Nổ Hũ Jackpot (23.7s)</strong></td>
            <td><span class="comp-code">Plinko-Ep2</span></td>
            <td>30.7s (920f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=plinko --ep=2')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 3</span></td>
            <td><strong>Cú Rơi Định Mệnh Ô 500x Jackpot (27.5s)</strong></td>
            <td><span class="comp-code">Plinko-Ep3</span></td>
            <td>34.5s (1,034f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=plinko --ep=3')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 4</span></td>
            <td><strong>Dồn Dập Bội Số 100x & Nổ Quỹ Thưởng (25.1s)</strong></td>
            <td><span class="comp-code">Plinko-Ep4</span></td>
            <td>32.1s (964f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=plinko --ep=4')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 5</span></td>
            <td><strong>Vòng Quay Định Mệnh $1,000,000 Rực Rỡ (26.1s)</strong></td>
            <td><span class="comp-code">Plinko-Ep5</span></td>
            <td>33.1s (994f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=plinko --ep=5')">📋 Copy lệnh</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TOPIC 11 -->
    <div class="topic-card" id="t11">
      <div class="topic-header">
        <div>
          <span class="topic-title-vn">⚖️ Chủ đề 11: Bạn Sẽ Chọn Gì? (Would You Rather Showdown)</span>
          <span class="topic-title-en">Topic 11: Would You Rather (3 Dilemmas, Tension Timer & Vote Reveal)</span>
        </div>
        <div class="topic-meta">Folder: 11-Would-You-Rather • 5 Tập (33.0s / 990f)</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 80px;">Tập</th>
            <th>Chủ Đề Song Đấu Nan Giải (3 Câu Hỏi / Tập)</th>
            <th>Tên tiếng Anh (Composition ID)</th>
            <th>Thời Lượng</th>
            <th style="width: 220px;">Lệnh xuất video MP4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="ep-badge">Tập 1</span></td>
            <td><strong>Siêu Năng Lực (Bay vs Dịch Chuyển, Đọc Não vs Tàng Hình)</strong></td>
            <td><span class="comp-code">WouldYouRather-Ep1</span></td>
            <td>33.0s (990f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=wyr --ep=1')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 2</span></td>
            <td><strong>Tiền Bạc & Phong Cách Sống ($10M Ngay vs $10K Mỗi Ngày)</strong></td>
            <td><span class="comp-code">WouldYouRather-Ep2</span></td>
            <td>33.0s (990f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=wyr --ep=2')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 3</span></td>
            <td><strong>Sinh Tồn & Thời Gian (30 Ngày Bắc Cực vs Sa Mạc Sahara)</strong></td>
            <td><span class="comp-code">WouldYouRather-Ep3</span></td>
            <td>33.0s (990f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=wyr --ep=3')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 4</span></td>
            <td><strong>Công Nghệ & Tương Lai (Sống Sao Hỏa vs Địa Đàng Thiên Nhiên)</strong></td>
            <td><span class="comp-code">WouldYouRather-Ep4</span></td>
            <td>33.0s (990f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=wyr --ep=4')">📋 Copy lệnh</button></td>
          </tr>
          <tr>
            <td><span class="ep-badge">Tập 5</span></td>
            <td><strong>Nghịch Lý Bất Khả Thi (Trẻ Hơn 10 Tuổi Nghèo vs Già Hơn 10 Tuổi Giàu)</strong></td>
            <td><span class="comp-code">WouldYouRather-Ep5</span></td>
            <td>33.0s (990f)</td>
            <td><button class="render-btn" onclick="copyCmd('node scripts/render-fleet.js --topic=wyr --ep=5')">📋 Copy lệnh</button></td>
          </tr>
        </tbody>
      </table>
    </div>`;

const startIdx = html.indexOf("<!-- TOPIC 6 -->");
const endIdx = html.indexOf("<!-- TOPIC 7 -->");
if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + newTopicsHtml + "\n\n    " + html.substring(endIdx);
  fs.writeFileSync(guidePath, html, "utf8");
  console.log("✅ Updated public/guide.html successfully!");
} else {
  console.error("Could not find markers in public/guide.html");
}

