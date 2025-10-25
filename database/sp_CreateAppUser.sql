-- =============================================
-- Stored Procedure: sp_CreateAppUser
-- Description: Uygulama giriş için yeni kullanıcı oluşturur (uzm_users tablosuna)
-- =============================================

USE FEELGOOD;
GO

CREATE OR ALTER PROCEDURE sp_CreateAppUser
    @username NVARCHAR(50),
    @password NVARCHAR(255),
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

        -- Yeni kullanıcı ekle
        INSERT INTO uzm_users (username, password, full_name, created_at)
        VALUES (@username, @password, @full_name, GETDATE());

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
-- Kullanım Örnekleri:
-- =============================================

-- Admin kullanıcısı oluştur
EXEC sp_CreateAppUser
    @username = 'admin',
    @password = 'admin123',
    @full_name = 'System Administrator';
GO

-- Başka bir kullanıcı oluştur
EXEC sp_CreateAppUser
    @username = 'mertcan',
    @password = 'mertcan123',
    @full_name = 'Mertcan Yüksel';
GO

-- Test kullanıcısı
EXEC sp_CreateAppUser
    @username = 'user1',
    @password = 'user123',
    @full_name = 'Test User';
GO

-- Mevcut kullanıcıları kontrol et
SELECT
    user_id,
    username,
    full_name,
    created_at
FROM uzm_users
ORDER BY created_at DESC;
GO
