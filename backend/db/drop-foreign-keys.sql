-- Foreign Key Constraint'leri Kaldır
USE FEELGOOD;
GO

-- uzm_event tablosundaki tüm foreign key'leri kaldır
DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql = @sql + 'ALTER TABLE uzm_event DROP CONSTRAINT ' + name + ';' + CHAR(13)
FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('uzm_event');

IF LEN(@sql) > 0
BEGIN
    PRINT 'Foreign key constraint''ler kaldırılıyor...';
    EXEC sp_executesql @sql;
    PRINT '✓ Tüm foreign key constraint''ler kaldırıldı';
END
ELSE
BEGIN
    PRINT '✓ Foreign key constraint bulunamadı (zaten yok)';
END

GO

-- Şimdi migrate-from-crm.sql'i çalıştırabilirsiniz
