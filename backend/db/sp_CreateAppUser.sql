-- =============================================
-- Stored Procedure: sp_CreateAppUser
-- Description: Uygulama giriş için yeni kullanıcı oluşturur (uzm_users tablosuna)
-- NOT: Password'ler bcrypt ile hash'lenmiş olarak verilmelidir
-- =============================================

USE FEELGOOD;
GO

CREATE OR ALTER PROCEDURE sp_CreateAppUser
    @username NVARCHAR(50),
    @password_hash NVARCHAR(255),
    @full_name NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Kullanıcı adı zaten var mı kontrol et
        IF EXISTS (SELECT 1 FROM uzm_users WHERE username = @username)
        BEGIN
            SELECT
                'ERROR' AS Status,
                'Bu kullanıcı adı zaten mevcut.' AS Message,
                NULL AS UserId;
            RETURN;
        END

        -- Yeni kullanıcı ekle (password_hash ile)
        INSERT INTO uzm_users (username, password_hash, full_name, created_at, is_active)
        VALUES (@username, @password_hash, @full_name, GETDATE(), 1);

        -- Başarılı mesajı
        SELECT
            'SUCCESS' AS Status,
            'Kullanıcı başarıyla oluşturuldu.' AS Message,
            SCOPE_IDENTITY() AS UserId,
            @username AS Username;

        PRINT 'Kullanıcı oluşturuldu: ' + @username;

    END TRY
    BEGIN CATCH
        -- Hata mesajı
        SELECT
            'ERROR' AS Status,
            ERROR_MESSAGE() AS Message,
            NULL AS UserId,
            NULL AS Username;

        PRINT 'HATA: ' + ERROR_MESSAGE();
    END CATCH
END
GO

-- =============================================
-- Kullanım Örnekleri - BCRYPT HASH'Lİ ŞİFRELER
-- =============================================
-- Şifreler bcrypt ile hash'lenmiş (10 rounds):
-- admin123  -> $2a$10$xN5JhJp6YO1YqFJ1wZ0YcOL8sVJm8hqP.V5kK9nQXZGJ1gPJZKN2S
-- mertcan123 -> $2a$10$8vQJGZ9X7L1nF5xPz0QqYOzN6M3jK9xR5tY2wP1vN8L0qM4jK7Nh6
-- user123    -> $2a$10$QYn9K5L8W2Px0M7zN4R1YeJ6nK8M5L9X3tP1wR2Q7N0Y5K8M6L9W4

-- Admin kullanıcısı oluştur (şifre: admin123)
EXEC sp_CreateAppUser
    @username = 'admin',
    @password_hash = '$2a$10$xN5JhJp6YO1YqFJ1wZ0YcOL8sVJm8hqP.V5kK9nQXZGJ1gPJZKN2S',
    @full_name = 'System Administrator';
GO

-- Başka bir kullanıcı oluştur (şifre: mertcan123)
EXEC sp_CreateAppUser
    @username = 'mertcan',
    @password_hash = '$2a$10$8vQJGZ9X7L1nF5xPz0QqYOzN6M3jK9xR5tY2wP1vN8L0qM4jK7Nh6',
    @full_name = 'Mertcan Yüksel';
GO

-- Test kullanıcısı (şifre: user123)
EXEC sp_CreateAppUser
    @username = 'user1',
    @password_hash = '$2a$10$QYn9K5L8W2Px0M7zN4R1YeJ6nK8M5L9X3tP1wR2Q7N0Y5K8M6L9W4',
    @full_name = 'Test User';
GO

-- Mevcut kullanıcıları kontrol et
SELECT
    user_id,
    username,
    full_name,
    created_at,
    is_active
FROM uzm_users
ORDER BY created_at DESC;
GO
