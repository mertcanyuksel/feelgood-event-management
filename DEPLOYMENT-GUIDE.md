# FEELGOOD Event Management System - Deployment Guide

## 📋 Sunucu Gereksinimleri

- **OS:** Windows Server 2016+ / Linux
- **Node.js:** v18+ (LTS önerilir)
- **NPM:** v9+
- **PM2:** Global olarak kurulu
- **Database:** MSSQL Server erişimi
- **RAM:** Minimum 2GB
- **Port:** 2025 (Backend), 2026 (Frontend)

---

## 🚀 Adım 1: Sunucuya Dosyaları Kopyalama

### Windows:
```powershell
# FTP, SCP veya dosya paylaşımı ile kopyalayın
# Örnek hedef: C:\inetpub\feelgood
```

### Linux:
```bash
# SCP ile kopyalama
scp -r /Users/mertcanyuksel/event-management-system user@server:/var/www/feelgood
```

---

## 🔧 Adım 2: Node.js ve PM2 Kurulumu

### Windows:
```powershell
# Node.js indir ve kur: https://nodejs.org
# Sonra PM2'yi kur
npm install -g pm2
npm install -g serve
```

### Linux:
```bash
# Node.js kur (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kur
sudo npm install -g pm2
sudo npm install -g serve
```

---

## ⚙️ Adım 3: .env Dosyalarını Düzenle

### Backend (.env)
Dosya: `backend/.env`

```env
# MSSQL Configuration
DB_SERVER=192.168.1.82
DB_DATABASE=FEELGOOD
DB_USER=feelgood_user
DB_PASSWORD=FeelGood@2024!Secure
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Server
PORT=2025
NODE_ENV=production
CLIENT_URL=http://SUNUCU_IP:2026

# Auth
SESSION_SECRET=event_management_secret_key_2024_CHANGE_THIS
```

**ÖNEMLİ:**
- `SUNUCU_IP` → Sunucunuzun IP adresi ile değiştirin
- `SESSION_SECRET` → Güçlü bir secret key belirleyin
- `NODE_ENV` → production olarak ayarlayın

### Frontend (.env)
Dosya: `frontend/.env`

```env
REACT_APP_API_URL=http://SUNUCU_IP:2025/api
PORT=2026
```

**ÖNEMLİ:**
- `SUNUCU_IP` → Sunucunuzun IP adresi ile değiştirin

---

## 📦 Adım 4: Dependencies Kurulumu

```bash
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install
```

---

## 🏗️ Adım 5: Frontend Build

```bash
cd frontend
npm run build

# Build klasörü oluşturuldu: frontend/build
```

---

## 🎯 Adım 6: PM2 Ecosystem Dosyasını Düzenle

Dosya: `ecosystem.config.js`

**ÖNEMLİ:** `cwd` (working directory) pathlerini sunucunuzdaki gerçek path ile değiştirin:

```javascript
module.exports = {
  apps: [
    {
      name: 'feelgood-backend',
      script: './backend/server.js',
      cwd: 'C:/inetpub/feelgood',  // Windows
      // cwd: '/var/www/feelgood',  // Linux
      env: {
        NODE_ENV: 'production',
        PORT: 2025
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'feelgood-frontend',
      script: 'serve',
      args: '-s build -l 2026',
      cwd: 'C:/inetpub/feelgood/frontend',  // Windows
      // cwd: '/var/www/feelgood/frontend',  // Linux
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
```

---

## 🚀 Adım 7: PM2 ile Başlatma

```bash
# Proje klasörüne git
cd C:\inetpub\feelgood  # Windows
# cd /var/www/feelgood  # Linux

# PM2 ile başlat
pm2 start ecosystem.config.js

# Durumu kontrol et
pm2 list

# Logları kontrol et
pm2 logs

# Backend logları
pm2 logs feelgood-backend

# Frontend logları
pm2 logs feelgood-frontend
```

---

## 🔥 Adım 8: Windows Firewall (Sadece Windows)

```powershell
# PowerShell (Yönetici olarak)
New-NetFirewallRule -DisplayName "Feelgood Backend" -Direction Inbound -LocalPort 2025 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Feelgood Frontend" -Direction Inbound -LocalPort 2026 -Protocol TCP -Action Allow
```

---

## 🎬 Adım 9: Otomatik Başlatma (Sistem Açılışında)

### Windows:
```powershell
pm2 startup
# Komutu çalıştırın ve çıkan komutu kopyalayıp çalıştırın
pm2 save
```

### Linux:
```bash
pm2 startup systemd
# Çıkan komutu sudo ile çalıştırın
pm2 save
```

---

## 🌐 Adım 10: Erişim Testi

### Backend API:
```
http://SUNUCU_IP:2025/api/health
```

### Frontend:
```
http://SUNUCU_IP:2026
```

### Login:
- Username: `admin`
- Password: Backend'de oluşturduğunuz kullanıcı

---

## 📊 PM2 Yönetim Komutları

```bash
# Durumu görüntüle
pm2 list
pm2 status

# Logları izle
pm2 logs
pm2 logs feelgood-backend --lines 100

# Yeniden başlat
pm2 restart feelgood-backend
pm2 restart feelgood-frontend
pm2 restart all

# Durdur
pm2 stop feelgood-backend
pm2 stop all

# Sil
pm2 delete feelgood-backend
pm2 delete all

# Monitoring
pm2 monit

# Process detayları
pm2 describe feelgood-backend
```

---

## 🔄 Güncelleme Yaparken

```bash
# 1. Backend güncellemesi
cd backend
pm2 stop feelgood-backend
# Dosyaları güncelle
npm install --production
pm2 restart feelgood-backend

# 2. Frontend güncellemesi
cd frontend
pm2 stop feelgood-frontend
# Dosyaları güncelle
npm install
npm run build
pm2 restart feelgood-frontend

# 3. Logları kontrol et
pm2 logs
```

---

## 🛠️ Sorun Giderme

### Port zaten kullanımda
```bash
# Windows
netstat -ano | findstr :2025
netstat -ano | findstr :2026
taskkill /PID <PID> /F

# Linux
lsof -i :2025
lsof -i :2026
kill -9 <PID>
```

### PM2 process çalışmıyor
```bash
pm2 logs feelgood-backend --err
pm2 describe feelgood-backend
```

### Database bağlantı hatası
- `.env` dosyasındaki DB bilgilerini kontrol edin
- Firewall'da 1433 portunun açık olduğundan emin olun
- SQL Server'da kullanıcı izinlerini kontrol edin

### Frontend API'ye erişemiyor
- `.env` dosyasında `REACT_APP_API_URL` doğru mu?
- Build'i tekrar alın: `npm run build`
- Browser console'da network hatalarını kontrol edin

---

## 📝 Kullanıcı Oluşturma

```bash
cd backend
node scripts/createUser.js admin admin123 "System Administrator"
node scripts/createUser.js mertcan mertcan123 "Mertcan Yüksel"
```

---

## 🔐 Güvenlik Önerileri

1. **Güçlü SESSION_SECRET kullanın**
2. **Database şifrelerini değiştirin**
3. **Firewall kurallarını aktif edin**
4. **HTTPS kullanın** (Nginx/Apache reverse proxy ile)
5. **Düzenli yedek alın**
6. **PM2 loglarını düzenli kontrol edin**

---

## 📞 Destek

Sorun yaşarsanız:
1. `pm2 logs` komutunu çalıştırın
2. Hata mesajlarını kontrol edin
3. `.env` dosyalarını gözden geçirin
4. Database bağlantısını test edin

---

## ✅ Deployment Checklist

- [ ] Node.js kuruldu
- [ ] PM2 kuruldu
- [ ] serve kuruldu
- [ ] Dosyalar sunucuya kopyalandı
- [ ] `.env` dosyaları düzenlendi (IP adresleri güncellendi)
- [ ] Backend dependencies kuruldu
- [ ] Frontend dependencies kuruldu
- [ ] Frontend build alındı
- [ ] `ecosystem.config.js` path'leri güncellendi
- [ ] PM2 ile başlatıldı
- [ ] Firewall portları açıldı
- [ ] Otomatik başlatma ayarlandı (`pm2 startup` + `pm2 save`)
- [ ] API erişimi test edildi
- [ ] Frontend erişimi test edildi
- [ ] Admin kullanıcısı oluşturuldu
- [ ] Login testi yapıldı

---

**🎉 Başarıyla deploy edildi!**
