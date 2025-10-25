-- =============================================
-- Create uzm_users Table
-- Uygulama login için kullanıcı tablosu
-- =============================================

USE FEELGOOD;
GO

-- Tablo varsa sil (dikkatli!)
-- DROP TABLE IF EXISTS uzm_users;
-- GO

-- uzm_users tablosunu oluştur
CREATE TABLE uzm_users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_login DATETIME NULL,
    CONSTRAINT CK_uzm_users_username_length CHECK (LEN(username) >= 3)
);
GO

-- Index oluştur
CREATE INDEX IX_uzm_users_username ON uzm_users(username);
CREATE INDEX IX_uzm_users_is_active ON uzm_users(is_active);
GO

PRINT 'uzm_users tablosu başarıyla oluşturuldu!';
GO

-- Tablo yapısını kontrol et
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'uzm_users'
ORDER BY ORDINAL_POSITION;
GO
