# Quick Start Guide

## 🚀 5 Dakikada Başla

### 1️⃣ MSSQL Server Hazırla

#### Windows (SQL Server Express)
```bash
# SQL Server Express indir ve kur
# https://www.microsoft.com/en-us/sql-server/sql-server-downloads

# Yükleme sırasında:
# - Mixed Mode Authentication seç
# - sa şifresi belirle (örn: YourStrong@Password)
```

#### macOS (Docker ile)
```bash
# Docker ile MSSQL çalıştır
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Password" \
  -p 1433:1433 --name mssql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

#### Linux (Docker ile)
```bash
# Docker ile MSSQL çalıştır
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Password" \
  -p 1433:1433 --name mssql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 2️⃣ Projeyi Kur

```bash
# 1. Bağımlılıkları yükle
npm run install-all

# 2. Veritabanını oluştur ve seed data ekle
npm run setup

# 3. Uygulamayı başlat
npm run dev
```

### 3️⃣ Uygulamayı Aç

Tarayıcıda http://localhost:3000 adresine git

**Giriş bilgileri:**
- Kullanıcı Adı: `admin`
- Şifre: `admin123`

---

## ⚙️ Konfigürasyon (Opsiyonel)

Eğer farklı MSSQL ayarları kullanıyorsanız:

### backend/.env dosyasını düzenle:

```env
DB_SERVER=localhost        # MSSQL server adresi
DB_DATABASE=EventManagementDB
DB_USER=sa                 # Kullanıcı adı
DB_PASSWORD=YourStrong@Password  # ŞİFRENİZİ BURAYA
DB_PORT=1433
```

---

## 🎯 İlk Adımlar

1. **Login yap** → admin / admin123
2. **"Yeni Kayıt Ekle"** butonuna tıkla
3. Zorunlu alanları doldur:
   - BÜTÇE seç
   - GÖNDERİM TÜRÜ seç (Yurtiçi/Yurtdışı)
   - MESAJ seç
   - KARTVİZİT 1 seç
4. **Kaydet** butonuna tıkla
5. Yeni kaydı tabloda gör
6. Bir satıra **çift tıkla** ve düzenle
7. Adres alanını değiştir ve kaydet
8. Satırın **SARI** renge döndüğünü gör
9. Başka bir satıra çift tıkla ve **"Sil"** checkbox'ını işaretle
10. Satırın **KIRMIZI** renge döndüğünü gör

---

## ❌ Sık Karşılaşılan Hatalar

### Hata: "Cannot connect to MSSQL server"

**Çözüm:**
```bash
# 1. MSSQL Server'ın çalıştığını kontrol et
# Windows: services.msc → SQL Server (MSSQLSERVER)
# Docker: docker ps

# 2. Port 1433'ün açık olduğunu kontrol et
netstat -an | grep 1433

# 3. Firewall'ı kontrol et
```

### Hata: "Login failed for user 'sa'"

**Çözüm:**
- SQL Server Management Studio ile bağlan
- Security → Logins → sa → sağ tık → Properties
- Status → Login: Enabled olarak ayarla
- Server Properties → Security → SQL Server and Windows Authentication mode seç

### Hata: "Port 5000 already in use"

**Çözüm:**
```bash
# backend/.env dosyasında PORT değiştir
PORT=5001
```

---

## 📝 Komutlar

```bash
# Tüm bağımlılıkları yükle
npm run install-all

# Veritabanını kur (DİKKAT: Mevcut veriyi siler!)
npm run setup

# Hem backend hem frontend başlat
npm run dev

# Sadece backend başlat
npm run server

# Sadece frontend başlat
npm run client

# Production build
npm run build
```

---

## 🔍 Test Et

### Backend API Test
```bash
# Health check
curl http://localhost:5000/api/health

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Frontend Test
1. http://localhost:3000 aç
2. admin / admin123 ile giriş yap
3. Tabloda kayıtları gör
4. Yeni kayıt ekle
5. Düzenle
6. Sil checkbox ile işaretle

---

## 🆘 Yardım

Sorun mu yaşıyorsun?

1. README.md dosyasındaki "Sorun Giderme" bölümüne bak
2. Console'daki hata mesajlarını kontrol et
3. Backend loglarını kontrol et
4. MSSQL bağlantı ayarlarını doğrula

---

## ✅ Başarılı Kurulum Kontrol Listesi

- [ ] Node.js ve npm yüklü
- [ ] MSSQL Server çalışıyor
- [ ] `npm run install-all` başarılı
- [ ] `npm run setup` başarılı (admin user created)
- [ ] `npm run dev` çalışıyor
- [ ] http://localhost:3000 açılıyor
- [ ] admin/admin123 ile giriş yapılabiliyor
- [ ] Tabloda 100+ kayıt görünüyor
- [ ] Yeni kayıt eklenebiliyor
- [ ] Düzenleme yapılabiliyor
- [ ] Renklendirme çalışıyor

---

**🎉 Hazırsın! İyi çalışmalar!**
