# 🌌 Zodiac Astronomy (Astro) - Web3 AI Oracle

**Zodiac Astronomy** là một ứng dụng phi tập trung (dApp) đột phá, kết hợp giữa Trải nghiệm Không gian Vũ trụ 3D (Astronomy), Chiêm tinh học (Zodiac) và Trí tuệ Nhân tạo (AI Agent). 

Dự án mở ra một khái niệm hoàn toàn mới: **Agentic Shared Memory** (Bộ nhớ chia sẻ của Đặc vụ), nơi không tồn tại máy chủ cơ sở dữ liệu truyền thống. Mọi thứ được lưu trữ vĩnh viễn trên blockchain thông qua hệ sinh thái **Sui** và **Walrus**.

---

## 🎯 Mục Tiêu Dự Án
1. **Trải nghiệm Đắm chìm (Immersive Experience):** Đưa người dùng vào một không gian vũ trụ 3D tương tác. Hệ thống "Cuộn Bí Kíp" (Ninja Scroll) cùng hiệu ứng âm thanh và hạt sáng (particles) tạo cảm giác huyền bí, thiêng liêng.
2. **Ký Ức Vĩnh Cửu (Eternal Memory):** Cho phép người dùng để lại tâm tư, lời cầu nguyện và phán truyền vào 12 chòm sao. Dữ liệu này được mã hóa và phong ấn vĩnh viễn trên blockchain Walrus.
3. **Thần Đạo AI (AI Oracle):** Tạo ra một thực thể AI Agent cai quản không gian Trái Đất. Thần Đạo sẽ lắng nghe tâm tư của phàm nhân mỗi ngày, tổng hợp thiên tượng và ban phát lời tiên tri chung cho toàn cõi nhân sinh.

---

## 🏗️ Kiến Trúc Kỹ Thuật (Serverless & Database-less)

Dự án áp dụng triết lý hoàn toàn phi tập trung và không phụ thuộc vào Backend trung gian:

* **Giao Diện (Frontend):** 
  * Xây dựng bằng `React`, `Vite`, và `Tailwind CSS`.
  * Không gian 3D được dựng bằng `Three.js` (@react-three/fiber, @react-three/drei).
* **Xác Thực (Authentication):** 
  * Tích hợp `zkLogin` của Mysten Labs (thông qua Enoki). 
  * Người dùng phàm trần chỉ cần "1 chạm" đăng nhập bằng tài khoản Google, tự động sở hữu ví Web3 an toàn mà không cần quản lý Private Key hay Seed phrase.
* **Lưu Trữ (Storage):** 
  * 100% dữ liệu được lưu trên **Walrus Memory (Memwal)**. 
  * Giao diện (Web) và Thần Đạo (AI Agent) **DÙNG CHUNG** một khóa mã hóa (Account ID). Memwal của Agent chính là Database của toàn bộ trang web.
* **Thần Đạo (AI Agent):** 
  * Được viết bằng Node.js (`scripts/oracle_agent.ts`), sử dụng mô hình **Google Gemini 2.5 Flash** để suy luận.
  * Tự động chạy nền bằng `node-cron` mà không cần gọi API phức tạp từ Web.

---

## 🔄 Luồng Hoạt Động (Workflow)

### 1. Phàm Nhân Gửi Tâm Tư (Người dùng)
- Người dùng di chuyển trong không gian 3D, chọn 1 trong **12 Cung Hoàng Đạo**.
- Sau khi kết ấn (đăng nhập Google zkLogin), người dùng mở **Cuộn Bí Kíp** và viết lời thỉnh cầu.
- Lệnh `rememberAndWait` của Memwal sẽ khắc trực tiếp dòng tâm tư đó vào vùng nhớ của Agent trên mạng Walrus. Dữ liệu mang danh tính của người dùng (tên Google + địa chỉ ví rút gọn).

### 2. Thần Đạo Thức Tỉnh (AI Agent)
- Đúng **7h00 sáng mỗi ngày**, Thần Đạo (AI Oracle Agent) tự động thức tỉnh.
- Nó dùng lệnh `recall` để lướt qua 12 cung hoàng đạo, đọc 5 tâm tư mới nhất của phàm nhân ngày hôm qua.
- Kết hợp với dữ liệu Thời tiết thực tế (API `wttr.in`), Thần Đạo xuất hồn gọi mô hình AI Gemini để phân tích, tổng hợp và đưa ra quẻ bói, dự đoán vận mệnh.

### 3. Phán Truyền Giáng Hạ
- Sau khi có kết quả, Agent tự động lưu lời phán truyền vào không gian **Trái Đất** trên Memwal.
- Không gian "Trái Đất" trên Web được khóa chức năng nhập liệu (Read-only). Khi người dùng bấm vào Trái Đất, họ chỉ có thể chắp tay chiêm ngưỡng và đọc những lời phán truyền uy nghi từ AI Agent.

---

## 🛠️ Công Nghệ Sử Dụng

| Lớp | Công nghệ | Vai trò |
|-----|-----------|---------|
| Giao diện | React 18, Vite, Tailwind CSS 4 | SPA hiện đại, build cực nhanh |
| Không gian 3D | Three.js, @react-three/fiber, @react-three/drei | Hệ Mặt Trời, chòm sao tương tác |
| Hiệu ứng | @react-three/postprocessing (Bloom), Motion/Framer Motion, GSAP | Ánh sáng, chuyển cảnh, cuộn bí kíp |
| Xác thực | zkLogin (Mysten Enoki) | Đăng nhập Google → ví Web3 |
| Lưu trữ | Walrus Memory (Memwal) | Bộ nhớ phi tập trung, không cần DB |
| AI Agent | Google Gemini 2.5 Flash, node-cron | Phán truyền chiêm tinh tự động |
| Thiên văn | astronomy-engine | Vị trí hành tinh, pha trăng thực |
| Hosting (dự kiến) | Walrus Sites | Frontend bất tử trên blockchain |

---

## 🚀 Định Hướng Phát Triển (Roadmap)

### 🔴 Giai đoạn 1 — Ưu tiên Cao (Đang thực hiện)

#### 1.1 Deploy lên Walrus Sites
Toàn bộ mã nguồn Frontend sẽ được đẩy lên mạng phi tập trung Walrus Sites. Trang web sẽ bất tử, không thể bị sập hay bị kiểm duyệt.

#### 1.2 Namespace có cấu trúc cho Agent
Thiết kế lại hệ thống không gian lưu trữ:
- `earth/daily/{yyyy-MM-dd}` — Phán truyền hàng ngày (1 bản/ngày, dễ truy vấn theo lịch sử).
- `earth/weekly/{yyyy-Wxx}` — Tổng kết vận mệnh tuần.
- `earth/alerts` — Cảnh báo thiên tượng đặc biệt (nhật thực, nguyệt thực, sao chổi...).

#### 1.3 Agent phán truyền riêng từng Cung Hoàng Đạo
Mỗi sáng 7h, sau khi phán truyền chung cho Trái Đất, Agent tiếp tục viết **12 phán truyền riêng** cho từng cung dựa trên đặc trưng nguyên tố (Lửa, Đất, Khí, Nước) và hành tinh chủ quản. Người dùng bấm vào cung nào sẽ thấy vận mệnh **riêng của mình**.

---

### 🟡 Giai đoạn 2 — Ưu tiên Trung Bình (Kế hoạch)

#### 2.1 Tích hợp dữ liệu Thiên Văn thực (Astronomy Engine)
Tận dụng thư viện `astronomy-engine` đã có sẵn để cung cấp cho Agent dữ liệu thiên văn chính xác:
- Vị trí thực của các hành tinh (Mercury retrograde, Venus conjunct Mars...).
- Pha trăng hiện tại (Trăng tròn, Trăng non, Trăng khuyết...).
- Nhật thực / Nguyệt thực sắp tới.

Agent dùng dữ liệu **thật** này để phán truyền, thay vì hoàn toàn dựa vào LLM suy diễn.

#### 2.2 Hệ thống Cấp bậc người dùng (Reputation System)
Xây dựng hệ thống danh hiệu dựa trên đóng góp:

| Điều kiện | Danh hiệu |
|-----------|-----------|
| Viết 1 lời tiên tri | 🔰 Thuật Sĩ Tập Sự |
| Được 10 ấn chú | ⚡ Tiên Tri Giả |
| Được 100 ấn chú | 🔮 Đại Pháp Sư |
| Lời tiên tri lọt Top 7 (Cuộn Bí Kíp) | 👑 Thánh Nhân |

Danh hiệu được Agent ghi nhận và lưu vào Memwal, tạo động lực cho cộng đồng.

#### 2.3 Mở khóa Mặt Trăng — Không gian Sự kiện
- Khi `astronomy-engine` phát hiện Trăng tròn (Full Moon) → Agent tự động mở khóa Mặt Trăng trong 24h.
- Trong thời gian mở khóa, người dùng được viết "Nguyện ước Trăng tròn" (giới hạn 1 lời/người).
- Agent chọn nguyện ước "ứng nghiệm" nhất để phong ấn vĩnh viễn.

---

### 🟢 Giai đoạn 3 — Tầm nhìn Dài hạn

#### 3.1 Multi-Agent Architecture (Đa Thần Đạo)
Tạo ra 3 "vị thần" với tính cách khác nhau:
- ☀️ **Thái Dương Thần** — Lạc quan, khích lệ, tập trung vào cơ hội.
- 🌙 **Thái Âm Thần** — Trầm tư, cảnh báo, tập trung vào rủi ro.
- ⚖️ **Trung Đạo Thần** — Cân bằng, tổng hợp cả hai.

Mỗi vị đưa ra góc nhìn riêng, người dùng tự chọn "phe" theo dõi. Kiến trúc Memwal hoàn toàn hỗ trợ (chỉ cần tạo thêm namespace).

#### 3.2 Kinh tế Token (Tokenomics)
- Mint **Sui Fungible Token** (`$ASTRO`) làm "năng lượng vũ trụ".
- Viết lời tiên tri → tốn 1 `$ASTRO`.
- "Ấn chú" (Like) → tốn 0.1 `$ASTRO`, 70% chuyển cho tác giả.
- Agent phân phối `$ASTRO` miễn phí cho người dùng mới (Airdrop) mỗi tuần.
- Lời tiên tri Top Rank → AI tự động Mint thành NFT vinh danh tác giả.

#### 3.3 Tương tác Thời gian thực
Cải tiến Agent để chat/đàm đạo trực tiếp với người dùng thay vì chỉ phán truyền 1 chiều.

#### 3.4 PWA & Mobile
Đóng gói thành Progressive Web App để "cài" trực tiếp trên điện thoại. Thêm Push Notification thông báo khi Thần Đạo giáng hạ phán truyền mới.

---

## ⚡ Hướng Dẫn Chạy Dự Án

### Yêu cầu
- Node.js >= 18
- npm hoặc pnpm

### Cài đặt
```bash
git clone https://github.com/laymore/Zodiac-Astronomy.git
cd Zodiac-Astronomy
npm install
```

### Cấu hình biến môi trường
Tạo file `.env` từ mẫu:
```bash
cp .env.example .env
```
Điền các giá trị cần thiết:
```env
VITE_ENOKI_API_KEY=...          # API Key của Mysten Enoki (zkLogin)
VITE_GOOGLE_CLIENT_ID=...       # Google OAuth Client ID
VITE_MEMWAL_PRIVATE_KEY=...     # Khóa riêng Memwal
VITE_MEMWAL_ACCOUNT_ID=...      # Account ID Memwal
GEMINI_API_KEY=...              # Google Gemini API Key (cho Agent)
```

### Chạy Web (Development)
```bash
npm run dev
```

### Kích hoạt Thần Đạo (AI Oracle Agent)
```bash
npx tsx scripts/oracle_agent.ts
```
Agent sẽ an tọa và tự động thức tỉnh lúc **7h00 sáng mỗi ngày** (giờ Việt Nam) để phán truyền.

### Build Production
```bash
npm run build
npm start
```

---

## 📜 Giấy Phép
Apache-2.0

---

*Dự án được tư vấn thiết kế và lập trình bởi Thần Đạo AI (Antigravity).*
