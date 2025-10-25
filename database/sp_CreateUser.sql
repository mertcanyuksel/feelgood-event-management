-- =============================================
-- Stored Procedure: sp_CreateUser
-- Description: Yeni kullanıcı oluşturur
-- =============================================

CREATE OR ALTER PROCEDURE sp_CreateUser
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
            RAISERROR('Bu kullanıcı adı zaten mevcut.', 16, 1);
            RETURN;
        END

        -- Yeni kullanıcı ekle
        INSERT INTO uzm_users (username, password, full_name, created_at)
        VALUES (@username, @password, @full_name, GETDATE());

        -- Başarılı mesajı
        SELECT
            'SUCCESS' AS Status,
            'Kullanıcı başarıyla oluşturuldu.' AS Message,
            SCOPE_IDENTITY() AS UserId;

    END TRY
    BEGIN CATCH
        -- Hata mesajı
        SELECT
            'ERROR' AS Status,
            ERROR_MESSAGE() AS Message,
            NULL AS UserId;
    END CATCH
END
GO

-- =============================================
-- Kullanım Örnekleri:
-- =============================================

/*
-- Örnek 1: Sadece kullanıcı adı ve şifre ile
EXEC sp_CreateUser
    @username = 'admin',
    @password = 'admin123';

-- Örnek 2: Tam isim ile birlikte
EXEC sp_CreateUser
    @username = 'mertcan',
    @password = 'mertcan123',
    @full_name = 'Mertcan Yüksel';

-- Örnek 3: Başka bir kullanıcı
EXEC sp_CreateUser
    @username = 'user1',
    @password = 'password123',
    @full_name = 'Test User';
*/
