-- CRM_365'ten FEELGOOD'a TAM VERİ AKTARIMI
-- Bu script hem referans tablolarını hem de event kayıtlarını aktarır

USE FEELGOOD;
GO

PRINT '========================================';
PRINT 'CRM_365 -> FEELGOOD Veri Aktarımı';
PRINT '========================================';
PRINT '';

-- ============================================
-- ADIM 1: REFERANS TABLOLARINI AKTAR
-- ============================================

PRINT 'ADIM 1: Referans Tabloları Aktarılıyor...';
PRINT '';

-- 1.1 uzm_budgetBase
PRINT '  >> uzm_budgetBase aktarılıyor...';

INSERT INTO uzm_budgetBase (uzm_budgetId, uzm_name, is_active)
SELECT DISTINCT
    UBB.uzm_budgetId,
    UBB.uzm_name,
    1 AS is_active
FROM CRM_365.dbo.uzm_budgetBase UBB
WHERE NOT EXISTS (
    SELECT 1 FROM uzm_budgetBase WHERE uzm_budgetId = UBB.uzm_budgetId
);

DECLARE @budgetCount INT = @@ROWCOUNT;
PRINT '     ✓ ' + CAST(@budgetCount AS VARCHAR) + ' bütçe kaydı aktarıldı';
PRINT '';

-- 1.2 uzm_salutationBase
PRINT '  >> uzm_salutationBase aktarılıyor...';

INSERT INTO uzm_salutationBase (uzm_salutationId, uzm_name, is_active)
SELECT DISTINCT
    USB.uzm_salutationId,
    USB.uzm_name,
    1 AS is_active
FROM CRM_365.dbo.uzm_salutationBase USB
WHERE NOT EXISTS (
    SELECT 1 FROM uzm_salutationBase WHERE uzm_salutationId = USB.uzm_salutationId
);

DECLARE @salutationCount INT = @@ROWCOUNT;
PRINT '     ✓ ' + CAST(@salutationCount AS VARCHAR) + ' mesaj kaydı aktarıldı';
PRINT '';

-- 1.3 uzm_businesscard
PRINT '  >> uzm_businesscard aktarılıyor...';

INSERT INTO uzm_businesscard (uzm_businesscardId, uzm_name, is_active)
SELECT DISTINCT
    UBC.uzm_businesscardId,
    UBC.uzm_name,
    1 AS is_active
FROM CRM_365.dbo.uzm_businesscard UBC
WHERE NOT EXISTS (
    SELECT 1 FROM uzm_businesscard WHERE uzm_businesscardId = UBC.uzm_businesscardId
);

DECLARE @businesscardCount INT = @@ROWCOUNT;
PRINT '     ✓ ' + CAST(@businesscardCount AS VARCHAR) + ' kartvizit kaydı aktarıldı';
PRINT '';

PRINT 'ADIM 1 TAMAMLANDI: Tüm referans tabloları aktarıldı';
PRINT '';
PRINT '';

-- ============================================
-- ADIM 2: EVENT KAYITLARINI AKTAR
-- ============================================

PRINT 'ADIM 2: Event Kayıtları Aktarılıyor...';
PRINT '';

INSERT INTO uzm_event (
    -- Legacy/Reference fields
    uzm_contactid,
    uzm_addresstype,

    -- Foreign Keys
    uzm_budgetid,
    uzm_salutationid,
    uzm_BusinessCard1,
    uzm_BusinessCard2,
    uzm_BusinessCard3,
    uzm_BusinessCard4,
    uzm_BusinessCard5,

    -- Event type and status
    uzm_eventtypeid,
    statecode,

    -- Nationality
    uzm_nationality,

    -- Address fields (CASE logic çözüldü, düz değer olarak kaydediliyor)
    uzm_adress,
    uzm_CountryidName,
    uzm_city,
    uzm_county,
    uzm_businessstate,
    uzm_zippostalcode,

    -- Contact information
    FirstName,
    LastName,
    Company,
    JobTitle,

    -- Audit fields
    created_date,
    modified_date,
    is_deleted
)
SELECT
    -- Legacy/Reference fields
    C.ContactId AS uzm_contactid,
    UE.uzm_addresstype,

    -- Foreign Keys
    UE.uzm_budgetid,
    UE.uzm_salutationid,
    UE.uzm_BusinessCard1,
    UE.uzm_BusinessCard2,
    UE.uzm_BusinessCard3,
    UE.uzm_BusinessCard4,
    UE.uzm_BusinessCard5,

    -- Event type and status
    UE.uzm_eventtypeid,
    UE.statecode,

    -- Nationality
    UE.uzm_nationality,

    -- Address fields - CASE logic burada çözülüyor
    CASE
        WHEN UE.uzm_addresstype = 1 THEN C.uzm_addressline1
        WHEN UE.uzm_addresstype = 2 THEN C.uzm_addressline2
        WHEN UE.uzm_addresstype = 3 THEN UE.uzm_adress
    END AS uzm_adress,

    CASE
        WHEN UE.uzm_addresstype = 1 THEN C.uzm_country1idName
        WHEN UE.uzm_addresstype = 2 THEN C.uzm_country2idName
        WHEN UE.uzm_addresstype = 3 THEN UE.uzm_CountryidName
    END AS uzm_CountryidName,

    CASE
        WHEN UE.uzm_addresstype = 1 THEN C.new_bcityid
        WHEN UE.uzm_addresstype = 2 THEN C.new_cityid
        WHEN UE.uzm_addresstype = 3 THEN UE.uzm_city
    END AS uzm_city,

    CASE
        WHEN UE.uzm_addresstype = 1 THEN C.new_bcontactcitysub
        WHEN UE.uzm_addresstype = 2 THEN C.new_contactcitysub
        WHEN UE.uzm_addresstype = 3 THEN UE.uzm_county
    END AS uzm_county,

    CASE
        WHEN UE.uzm_addresstype = 1 THEN C.new_businesscountrystate
        WHEN UE.uzm_addresstype = 2 THEN C.new_contactcountrystate
        WHEN UE.uzm_addresstype = 3 THEN UE.uzm_businessstate
    END AS uzm_businessstate,

    CASE
        WHEN UE.uzm_addresstype = 1 THEN C.uzm_postalcode1
        WHEN UE.uzm_addresstype = 2 THEN C.uzm_postalcode2
        WHEN UE.uzm_addresstype = 3 THEN UE.uzm_zippostalcode
    END AS uzm_zippostalcode,

    -- Contact information
    C.FirstName,
    C.LastName,
    C.Company,
    C.JobTitle,

    -- Audit fields
    GETDATE() AS created_date,
    GETDATE() AS modified_date,
    0 AS is_deleted

FROM CRM_365.dbo.Contact C
INNER JOIN CRM_365.dbo.uzm_event UE ON UE.uzm_contactid = C.ContactId
WHERE
    UE.uzm_eventtypeid = 'C89A605F-7F52-F011-8BAA-005056A1F1F4'
    AND UE.statecode = 0;

DECLARE @eventCount INT = @@ROWCOUNT;
PRINT '     ✓ ' + CAST(@eventCount AS VARCHAR) + ' event kaydı aktarıldı';
PRINT '';

PRINT 'ADIM 2 TAMAMLANDI: Event kayıtları aktarıldı';
PRINT '';
PRINT '';

-- ============================================
-- ÖZET RAPOR
-- ============================================

PRINT '========================================';
PRINT 'VERİ AKTARIM ÖZETI';
PRINT '========================================';
PRINT '';

PRINT 'Referans Tabloları:';
PRINT '  • uzm_budgetBase      : ' + CAST((SELECT COUNT(*) FROM uzm_budgetBase) AS VARCHAR) + ' kayıt';
PRINT '  • uzm_salutationBase  : ' + CAST((SELECT COUNT(*) FROM uzm_salutationBase) AS VARCHAR) + ' kayıt';
PRINT '  • uzm_businesscard    : ' + CAST((SELECT COUNT(*) FROM uzm_businesscard) AS VARCHAR) + ' kayıt';
PRINT '';

PRINT 'Event Tablosu:';
PRINT '  • uzm_event           : ' + CAST((SELECT COUNT(*) FROM uzm_event) AS VARCHAR) + ' kayıt';
PRINT '';

PRINT '========================================';
PRINT '✓ VERİ AKTARIMI BAŞARIYLA TAMAMLANDI!';
PRINT '========================================';
PRINT '';

GO

-- İlk 10 event kaydını göster
PRINT 'İlk 10 Event Kaydı:';
PRINT '';

SELECT TOP 10
    uzm_eventId,
    uzm_contactid,
    CASE WHEN uzm_nationality = 2 THEN 'YURTDIŞI' ELSE 'YURTİÇİ' END AS GONDERIM_TURU,
    FirstName AS AD,
    LastName AS SOYAD,
    Company AS SIRKET,
    uzm_adress AS ADRES,
    uzm_city AS SEHIR,
    created_date
FROM uzm_event
ORDER BY created_date DESC;

GO
