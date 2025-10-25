# User Creation Script

Uygulama girişi için kullanıcı oluşturma scripti.

## Kullanım

```bash
cd /Users/mertcanyuksel/event-management-system/backend
node scripts/createUser.js <username> <password> [fullname]
```

## Örnekler

### Basit kullanıcı (sadece username ve password)
```bash
node scripts/createUser.js admin admin123
```

### Tam isim ile kullanıcı
```bash
node scripts/createUser.js mertcan mertcan123 "Mertcan Yüksel"
```

### Başka örnekler
```bash
node scripts/createUser.js user1 password123 "Test User"
node scripts/createUser.js hillside hillside2024 "Hillside Admin"
```

## Özellikler

- ✅ Şifreyi otomatik olarak bcrypt ile hash'ler (10 rounds)
- ✅ Duplicate username kontrolü yapar
- ✅ uzm_users tablosuna ekler
- ✅ is_active = 1 olarak ayarlar
- ✅ Detaylı success/error mesajları verir

## Çıktı Örneği

```
🔐 Kullanıcı oluşturuluyor...
Username: admin
✅ Password hash'lendi (bcrypt, 10 rounds)
✅ Database bağlantısı kuruldu

✅ Kullanıcı başarıyla oluşturuldu!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User ID: 1
Username: admin
Full Name: System Administrator
Password Hash: $2a$10$xN5JhJp6YO1YqFJ1wZ0...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 Giriş bilgileri:
   Username: admin
   Password: admin123
```

## Hata Durumları

### Kullanıcı zaten mevcut
```
❌ HATA: Bu kullanıcı adı zaten mevcut!
```

### Database bağlantı hatası
```
❌ HATA: Connection failed
```

## Not

- Script çalışırken backend sunucusunun çalışıyor olması gerekmez
- Database bağlantısı `.env` dosyasından alınır
- Oluşturulan kullanıcılarla hemen giriş yapabilirsiniz
