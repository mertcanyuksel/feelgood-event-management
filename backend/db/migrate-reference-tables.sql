-- CRM_365'ten referans tablolarını (dropdown verileri) FEELGOOD'a aktar
-- Önce bu scripti çalıştırın, sonra migrate-from-crm.sql'i çalıştırın

USE FEELGOOD;
GO

-- 1. uzm_budgetBase tablosunu aktar
PRINT 'Aktarılıyor: uzm_budgetBase...';

INSERT INTO uzm_budgetBase (
    uzm_budgetId,
    uzm_name,
    is_active
)
SELECT DISTINCT
    UBB.uzm_budgetId,
    UBB.uzm_name,
    1 AS is_active
FROM CRM_365.dbo.uzm_budgetBase UBB
WHERE NOT EXISTS (
    SELECT 1 FROM uzm_budgetBase WHERE uzm_budgetId = UBB.uzm_budgetId
);

SELECT COUNT(*) AS 'uzm_budgetBase_Kayit_Sayisi' FROM uzm_budgetBase;
GO

-- 2. uzm_salutationBase tablosunu aktar
PRINT 'Aktarılıyor: uzm_salutationBase...';

INSERT INTO uzm_salutationBase (
    uzm_salutationId,
    uzm_name,
    is_active
)
SELECT DISTINCT
    USB.uzm_salutationId,
    USB.uzm_name,
    1 AS is_active
FROM CRM_365.dbo.uzm_salutationBase USB
WHERE NOT EXISTS (
    SELECT 1 FROM uzm_salutationBase WHERE uzm_salutationId = USB.uzm_salutationId
);

SELECT COUNT(*) AS 'uzm_salutationBase_Kayit_Sayisi' FROM uzm_salutationBase;
GO

-- 3. uzm_businesscard tablosunu aktar
PRINT 'Aktarılıyor: uzm_businesscard...';

INSERT INTO uzm_businesscard (
    uzm_businesscardId,
    uzm_name,
    is_active
)
SELECT DISTINCT
    UBC.uzm_businesscardId,
    UBC.uzm_name,
    1 AS is_active
FROM CRM_365.dbo.uzm_businesscard UBC
WHERE NOT EXISTS (
    SELECT 1 FROM uzm_businesscard WHERE uzm_businesscardId = UBC.uzm_businesscardId
);

SELECT COUNT(*) AS 'uzm_businesscard_Kayit_Sayisi' FROM uzm_businesscard;
GO

PRINT '✅ Tüm referans tabloları aktarıldı!';
PRINT 'Şimdi migrate-from-crm.sql dosyasını çalıştırabilirsiniz.';
GO
