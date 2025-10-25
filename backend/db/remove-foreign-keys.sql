-- Foreign Key Constraint'leri Kaldır
-- Tüm alanlar NULL olabilir

USE FEELGOOD;
GO

PRINT '========================================';
PRINT 'Foreign Key Constraint Temizleme';
PRINT '========================================';
PRINT '';

-- Mevcut foreign key constraint'leri bul ve kaldır
DECLARE @sql NVARCHAR(MAX) = '';

SELECT @sql = @sql + 'ALTER TABLE uzm_event DROP CONSTRAINT ' + name + ';' + CHAR(13)
FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('uzm_event');

IF LEN(@sql) > 0
BEGIN
    PRINT 'Foreign key constraint''ler kaldırılıyor...';
    PRINT @sql;
    EXEC sp_executesql @sql;
    PRINT '✓ Tüm foreign key constraint''ler kaldırıldı';
    PRINT '';
END
ELSE
BEGIN
    PRINT 'ℹ Foreign key constraint bulunamadı (zaten kaldırılmış)';
    PRINT '';
END

-- Sütunları nullable yap (NOT NULL olan varsa)
PRINT 'Sütunlar nullable yapılıyor...';
PRINT '';

-- budgetid nullable yap
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('uzm_event')
    AND name = 'uzm_budgetid'
    AND is_nullable = 0
)
BEGIN
    ALTER TABLE uzm_event ALTER COLUMN uzm_budgetid UNIQUEIDENTIFIER NULL;
    PRINT '✓ uzm_budgetid nullable yapıldı';
END

-- salutationid nullable yap
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('uzm_event')
    AND name = 'uzm_salutationid'
    AND is_nullable = 0
)
BEGIN
    ALTER TABLE uzm_event ALTER COLUMN uzm_salutationid UNIQUEIDENTIFIER NULL;
    PRINT '✓ uzm_salutationid nullable yapıldı';
END

-- BusinessCard sütunları zaten nullable olmalı ama kontrol edelim
DECLARE @cards TABLE (colname VARCHAR(50));
INSERT INTO @cards VALUES ('uzm_BusinessCard1'), ('uzm_BusinessCard2'), ('uzm_BusinessCard3'), ('uzm_BusinessCard4'), ('uzm_BusinessCard5');

DECLARE @colname VARCHAR(50);
DECLARE card_cursor CURSOR FOR SELECT colname FROM @cards;
OPEN card_cursor;
FETCH NEXT FROM card_cursor INTO @colname;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @checkSql NVARCHAR(MAX) = 'IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(''uzm_event'') AND name = ''' + @colname + ''' AND is_nullable = 0)
    BEGIN
        ALTER TABLE uzm_event ALTER COLUMN ' + @colname + ' UNIQUEIDENTIFIER NULL;
        PRINT ''✓ ' + @colname + ' nullable yapıldı'';
    END';

    EXEC sp_executesql @checkSql;
    FETCH NEXT FROM card_cursor INTO @colname;
END

CLOSE card_cursor;
DEALLOCATE card_cursor;

PRINT '';
PRINT '========================================';
PRINT '✓ İŞLEM TAMAMLANDI';
PRINT '========================================';
PRINT '';
PRINT 'Artık uzm_event tablosuna foreign key kontrolü olmadan veri ekleyebilirsiniz.';
PRINT '';

GO

-- Mevcut constraint'leri göster
SELECT
    'uzm_event' AS TableName,
    OBJECT_NAME(parent_object_id) AS ParentTable,
    name AS ConstraintName,
    type_desc AS ConstraintType
FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('uzm_event');

GO
