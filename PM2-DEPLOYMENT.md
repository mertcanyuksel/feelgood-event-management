# PM2 ile Deployment Kılavuzu

## 1. PM2 Kurulumu

```bash
# Global PM2 kur
npm install -g pm2

# PM2 versiyonu kontrol et
pm2 --version
```

## 2. Backend Deployment

```bash
# Backend klasörüne git
cd /Users/mertcanyuksel/event-management-system/backend

# Backend'i PM2 ile başlat
pm2 start server.js --name "feelgood-backend" --watch

# Veya .env ile
pm2 start server.js --name "feelgood-backend" --env production
```

## 3. Frontend Build & Deployment

### Option A: Static Serve ile (Önerilen - En Kolay)

```bash
# Frontend klasörüne git
cd /Users/mertcanyuksel/event-management-system/frontend

# Production build al
npm run build

# Serve kur (global)
npm install -g serve

# Build klasörünü PM2 ile serve et
pm2 serve build 3000 --name "feelgood-frontend" --spa
```

### Option B: React Development Server ile

```bash
cd /Users/mertcanyuksel/event-management-system/frontend

# PM2 ile development server başlat
pm2 start npm --name "feelgood-frontend" -- start
```

## 4. PM2 Komutları

```bash
# Tüm process'leri listele
pm2 list

# Logları izle
pm2 logs

# Backend logları
pm2 logs feelgood-backend

# Frontend logları
pm2 logs feelgood-frontend

# Process'i durdur
pm2 stop feelgood-backend
pm2 stop feelgood-frontend

# Process'i restart et
pm2 restart feelgood-backend
pm2 restart feelgood-frontend

# Process'i sil
pm2 delete feelgood-backend
pm2 delete feelgood-frontend

# Tüm process'leri durdur
pm2 stop all

# Tüm process'leri sil
pm2 delete all

# Process detaylarını gör
pm2 show feelgood-backend

# PM2 dashboard aç (monitoring)
pm2 monit
```

## 5. Sistem Başlangıcında Otomatik Başlatma

```bash
# PM2 startup script oluştur
pm2 startup

# Mevcut process'leri kaydet
pm2 save

# Artık sistem her başladığında PM2 ve process'ler otomatik başlayacak
```

## 6. Ecosystem File (Önerilen)

`ecosystem.config.js` oluştur:

```javascript
module.exports = {
  apps: [
    {
      name: 'feelgood-backend',
      script: './backend/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'feelgood-frontend',
      script: 'serve',
      args: '-s frontend/build -l 3000',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

Ecosystem ile başlatma:

```bash
# Tüm uygulamaları başlat
pm2 start ecosystem.config.js

# Durdur
pm2 stop ecosystem.config.js

# Restart
pm2 restart ecosystem.config.js
```

## 7. Production Checklist

- [ ] `.env` dosyasını production değerleriyle güncelle
- [ ] `NODE_ENV=production` ayarla
- [ ] Frontend build al (`npm run build`)
- [ ] Backend'i PM2 ile başlat
- [ ] Frontend'i PM2 ile serve et
- [ ] `pm2 save` ile kaydet
- [ ] `pm2 startup` ile otomatik başlatma ayarla
- [ ] Logları kontrol et (`pm2 logs`)
- [ ] Database bağlantısını test et

## 8. Güncelleme Yaparken

```bash
# 1. Backend güncellemesi
cd backend
git pull  # veya dosyaları kopyala
pm2 restart feelgood-backend

# 2. Frontend güncellemesi
cd frontend
git pull  # veya dosyaları kopyala
npm run build
pm2 restart feelgood-frontend
```

## 9. Sorun Giderme

```bash
# Hata loglarını gör
pm2 logs feelgood-backend --err

# Process detaylarını gör
pm2 describe feelgood-backend

# PM2'yi tamamen temizle ve yeniden başlat
pm2 kill
pm2 start ecosystem.config.js
```

## 10. Port Bilgileri

- Backend: http://localhost:5001
- Frontend: http://localhost:3000
- API: http://localhost:5001/api

## Notlar

- PM2, Windows, macOS ve Linux'ta çalışır
- Otomatik restart yapar (crash durumunda)
- Log yönetimi ve rotation var
- Memory ve CPU izleme var (`pm2 monit`)
- Cluster mode destekler (multiple instances)
