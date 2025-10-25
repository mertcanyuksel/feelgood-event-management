# Troubleshooting Guide - Sorun Giderme Kılavuzu

## 🔍 Genel Kontrol Listesi

Herhangi bir sorunla karşılaştığınızda önce bunları kontrol edin:

- [ ] MSSQL Server çalışıyor mu?
- [ ] Node.js ve npm yüklü mü? (`node -v`, `npm -v`)
- [ ] `npm run install-all` komutu çalıştırıldı mı?
- [ ] `.env` dosyaları doğru yapılandırıldı mı?
- [ ] Port 5000 ve 3000 kullanımda mı?
- [ ] Firewall MSSQL'i engelliyor mu?

---

## 🚨 Backend Hataları

### 1. "Failed to connect to localhost:1433"

**Sebep:** MSSQL Server bağlantısı kurulamıyor.

**Çözümler:**

#### Windows:
```bash
# 1. SQL Server durumunu kontrol et
services.msc
# SQL Server (MSSQLSERVER) servisini bul ve başlat

# 2. TCP/IP protokolünü aç
# SQL Server Configuration Manager → SQL Server Network Configuration
# → Protocols for MSSQLSERVER → TCP/IP → Enable

# 3. SQL Server'ı yeniden başlat
net stop MSSQL$SQLEXPRESS
net start MSSQL$SQLEXPRESS
```

#### macOS/Linux (Docker):
```bash
# Docker container'ın durumunu kontrol et
docker ps -a

# Container çalışmıyorsa başlat
docker start mssql

# Logları kontrol et
docker logs mssql

# Yeni container başlat (gerekirse)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Password" \
  -p 1433:1433 --name mssql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

#### Bağlantıyı Test Et:
```bash
# telnet ile test
telnet localhost 1433

# netstat ile port kontrolü
netstat -an | grep 1433  # macOS/Linux
netstat -an | findstr 1433  # Windows
```

---

### 2. "Login failed for user 'sa'"

**Sebep:** SQL Server authentication sorunu.

**Çözüm:**

```sql
-- SQL Server Management Studio'da çalıştır:

-- 1. sa kullanıcısını aktifleştir
ALTER LOGIN sa ENABLE;
GO

-- 2. Şifreyi değiştir
ALTER LOGIN sa WITH PASSWORD = 'YourStrong@Password';
GO

-- 3. Mixed mode authentication'ı aç
-- Server Properties → Security → SQL Server and Windows Authentication mode
```

backend/.env dosyasını güncelle:
```env
DB_USER=sa
DB_PASSWORD=YourStrong@Password  # Yeni şifre
```

---

### 3. "Database 'EventManagementDB' already exists"

**Sebep:** Setup scripti tekrar çalıştırılmaya çalışılıyor.

**Çözümler:**

```bash
# Seçenek 1: Veritabanını sil ve yeniden oluştur
# SQL Server Management Studio'da EventManagementDB'yi sil
# Sonra tekrar çalıştır:
npm run setup

# Seçenek 2: Sadece seed data ekle (manuel)
# db/setup.js dosyasında veritabanı oluşturma kısmını yoruma al
```

---

### 4. "Port 5000 already in use"

**Sebep:** Port 5000 başka bir uygulama tarafından kullanılıyor.

**Çözümler:**

```bash
# Hangi process kullanıyor?
# macOS/Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000

# Process'i kapat
# macOS/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

**Veya farklı port kullan:**

backend/.env:
```env
PORT=5001
```

---

### 5. "Cannot find module 'mssql'"

**Sebep:** Backend bağımlılıkları yüklenmemiş.

**Çözüm:**
```bash
cd backend
npm install
```

---

### 6. "Session store error"

**Sebep:** Session secret eksik veya hatalı.

**Çözüm:**

backend/.env:
```env
SESSION_SECRET=your_very_secret_key_here_12345
```

Server'ı yeniden başlat:
```bash
npm run server
```

---

## 🎨 Frontend Hataları

### 1. "Cannot connect to backend"

**Sebep:** Backend çalışmıyor veya URL yanlış.

**Çözüm:**

```bash
# 1. Backend çalışıyor mu kontrol et
curl http://localhost:5000/api/health

# 2. Frontend .env dosyasını kontrol et
# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api

# 3. Her iki servisi de yeniden başlat
npm run dev
```

---

### 2. "Proxy error: Could not proxy request"

**Sebep:** Frontend, backend'e bağlanamıyor.

**Çözüm:**

```bash
# 1. Backend'in çalıştığından emin ol
cd backend
npm run dev

# 2. Frontend'i başka terminalde başlat
cd frontend
npm start

# 3. Proxy ayarını kontrol et
# frontend/package.json
"proxy": "http://localhost:5000"
```

---

### 3. "Module not found: Can't resolve 'axios'"

**Sebep:** Frontend bağımlılıkları yüklenmemiş.

**Çözüm:**
```bash
cd frontend
npm install
```

---

### 4. "React is not defined"

**Sebep:** React import eksik.

**Çözüm:**
Her component dosyasının başında:
```javascript
import React from 'react';
```

---

### 5. "White screen / Blank page"

**Sebep:** JavaScript hatası.

**Çözüm:**

```bash
# 1. Browser console'u aç (F12)
# Hata mesajlarını oku

# 2. React error boundary kontrolü
# Sayfayı yenile (Ctrl+R)

# 3. Cache temizle
# Browser'da Ctrl+Shift+Delete

# 4. Node modules'ları yeniden yükle
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 🔐 Authentication Hataları

### 1. "Unauthorized - 401"

**Sebep:** Session süresi dolmuş veya cookie yok.

**Çözüm:**
```bash
# 1. Logout yap ve tekrar login yap
# 2. Browser cookies'lerini kontrol et
# 3. withCredentials ayarını kontrol et

# frontend/src/services/api.js
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Bu satır olmalı
  ...
});
```

---

### 2. "Invalid username or password"

**Çözüm:**
```bash
# Varsayılan credentials:
Kullanıcı Adı: admin
Şifre: admin123

# Eğer değiştirdiyseniz, veritabanını kontrol edin:
SELECT * FROM users WHERE username = 'admin'

# Şifreyi resetlemek için:
cd backend
node db/setup.js  # Yeni admin user oluşturur
```

---

### 3. "CORS error"

**Sebep:** Backend CORS ayarları yanlış.

**Çözüm:**

backend/server.js:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend URL
  credentials: true
}));
```

---

## 📊 Veritabanı Hataları

### 1. "Invalid column name"

**Sebep:** Tablo yapısı güncel değil.

**Çözüm:**
```bash
# Veritabanını sıfırla
# SQL Server Management Studio'da:
DROP DATABASE EventManagementDB

# Yeniden oluştur
npm run setup
```

---

### 2. "Foreign key constraint error"

**Sebep:** İlişkili kayıt bulunamıyor.

**Çözüm:**
```sql
-- İlgili referans tablosunu kontrol et
SELECT * FROM uzm_budgetBase
SELECT * FROM uzm_salutationBase
SELECT * FROM uzm_businesscard

-- Seed data'nın yüklendiğinden emin ol
npm run setup
```

---

### 3. "Timeout expired"

**Sebep:** Query çok uzun sürüyor.

**Çözüm:**

backend/config/db.config.js:
```javascript
options: {
  connectionTimeout: 60000,  // 60 saniye
  requestTimeout: 60000
}
```

---

## 🐛 Genel Hatalar

### 1. "npm ERR! code ELIFECYCLE"

**Sebep:** Script hatası.

**Çözüm:**
```bash
# 1. Node modules temizle
rm -rf node_modules package-lock.json
npm install

# 2. Cache temizle
npm cache clean --force

# 3. Node.js versiyonunu kontrol et
node -v  # 16+ olmalı
```

---

### 2. "Permission denied"

**Sebep:** Dosya/klasör izin sorunu.

**Çözüm:**
```bash
# macOS/Linux
sudo chown -R $USER:$USER .
chmod -R 755 .

# Windows
# Klasöre sağ tık → Properties → Security
# Full control ver
```

---

### 3. "EADDRINUSE: address already in use"

**Sebep:** Port zaten kullanımda.

**Çözüm:**
```bash
# Process'i bul ve kapat
# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🧪 Test ve Debug

### Backend Debug

```bash
# 1. Console logları
cd backend
npm run dev
# Terminal'de logları izle

# 2. Postman ile test
POST http://localhost:5000/api/auth/login
Content-Type: application/json
{
  "username": "admin",
  "password": "admin123"
}

# 3. Health check
curl http://localhost:5000/api/health
```

---

### Frontend Debug

```bash
# 1. Browser Console (F12)
# Network tab → API isteklerini izle
# Console tab → JavaScript hatalarını gör

# 2. React DevTools
# Chrome extension yükle
# Component tree'yi incele

# 3. Redux DevTools (kullanılmıyor ama önerilir)
```

---

### Database Debug

```sql
-- Event'leri kontrol et
SELECT TOP 10 * FROM uzm_event

-- Kullanıcıları kontrol et
SELECT * FROM users

-- Audit log'u kontrol et
SELECT TOP 50 * FROM audit_log ORDER BY action_date DESC

-- Foreign key ilişkilerini kontrol et
SELECT
  fk.name AS ForeignKey,
  OBJECT_NAME(fk.parent_object_id) AS TableName,
  OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable
FROM sys.foreign_keys AS fk
```

---

## 📞 Hala Çözülmedi mi?

### Detaylı Log Toplama

```bash
# Backend logları
cd backend
npm run dev > backend.log 2>&1

# Frontend logları
cd frontend
npm start > frontend.log 2>&1

# MSSQL logları
# SQL Server Configuration Manager → SQL Server Services
# → SQL Server → Properties → Advanced → Dump Directory
```

---

### Sistem Bilgilerini Topla

```bash
# OS
uname -a  # macOS/Linux
systeminfo  # Windows

# Node.js
node -v
npm -v

# MSSQL
sqlcmd -S localhost -U sa -P YourStrong@Password -Q "SELECT @@VERSION"

# Port durumu
netstat -an | grep LISTEN  # macOS/Linux
netstat -an | findstr LISTENING  # Windows
```

---

### Temiz Kurulum

Hiçbir şey işe yaramazsa, baştan başla:

```bash
# 1. Projeyi sil
rm -rf event-management-system

# 2. Veritabanını sil
# SQL Server Management Studio'da:
DROP DATABASE EventManagementDB

# 3. Node cache temizle
npm cache clean --force

# 4. Baştan kur
git clone [repo-url]
cd event-management-system
npm run install-all
npm run setup
npm run dev
```

---

## ✅ Başarılı Kurulum Doğrulama

Her şey çalışıyor mu kontrol et:

```bash
# 1. Backend health check
curl http://localhost:5000/api/health
# Yanıt: {"success":true,"message":"Server is running"}

# 2. Database connection
curl http://localhost:5000/api/budgets
# Yanıt: Bütçe listesi (login gerekebilir)

# 3. Frontend erişim
# http://localhost:3000 tarayıcıda açılmalı

# 4. Login
# admin / admin123 ile giriş yapabilmeli

# 5. Tablo
# 100+ kayıt görünmeli
```

---

## 🔧 Önerilen Araçlar

### Geliştirme Araçları:
- **Postman** - API test için
- **SQL Server Management Studio (SSMS)** - Database yönetimi
- **VS Code** - Kod editörü
- **Chrome DevTools** - Frontend debug

### Monitoring:
- **Nodemon** - Backend auto-restart (zaten kurulu)
- **React DevTools** - Component debugging

---

## 📚 Ek Kaynaklar

### MSSQL:
- [SQL Server Express İndirme](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [SSMS İndirme](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
- [Docker MSSQL](https://hub.docker.com/_/microsoft-mssql-server)

### Node.js:
- [Node.js İndirme](https://nodejs.org/)
- [npm Documentation](https://docs.npmjs.com/)

### React:
- [React Documentation](https://react.dev/)
- [Create React App](https://create-react-app.dev/)

---

**Son Güncelleme:** 2024-10-24

**Sorunlar devam ediyorsa:**
- README.md'yi tekrar oku
- QUICKSTART.md'yi takip et
- PROJECT_SUMMARY.md'yi kontrol et

**Başarılar! 🚀**
