-- CRM_365 veritabanından FEELGOOD veritabanına veri aktarımı
-- Önce FEELGOOD veritabanına bağlanın, sonra bu sorguyu çalıştırın

USE FEELGOOD;
GO

-- Verileri CRM_365'ten FEELGOOD.uzm_event tablosuna aktar
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

    -- Address fields (flattened - artık CASE ile değil direkt kaydedilecek)
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

    -- Address fields - CASE logic'i burada çözülüyor ve düz değer olarak kaydediliyor
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
INNER JOIN CRM_365.dbo.uzm_budgetBase UBB ON UBB.uzm_budgetId = UE.uzm_budgetid
LEFT JOIN CRM_365.dbo.uzm_salutationBase USB ON USB.uzm_salutationId = UE.uzm_salutationid
LEFT JOIN CRM_365.dbo.uzm_businesscard UBC1 ON UBC1.uzm_businesscardId = UE.uzm_BusinessCard1
LEFT JOIN CRM_365.dbo.uzm_businesscard UBC2 ON UBC2.uzm_businesscardId = UE.uzm_BusinessCard2
LEFT JOIN CRM_365.dbo.uzm_businesscard UBC3 ON UBC3.uzm_businesscardId = UE.uzm_BusinessCard3
LEFT JOIN CRM_365.dbo.uzm_businesscard UBC4 ON UBC4.uzm_businesscardId = UE.uzm_BusinessCard4
LEFT JOIN CRM_365.dbo.uzm_businesscard UBC5 ON UBC5.uzm_businesscardId = UE.uzm_BusinessCard5
WHERE
    UE.uzm_eventtypeid = 'C89A605F-7F52-F011-8BAA-005056A1F1F4'
    AND UE.statecode = 0;

GO

-- Aktarılan kayıt sayısını kontrol et
SELECT COUNT(*) AS 'Aktarilan_Kayit_Sayisi' FROM uzm_event;
GO

-- İlk 10 kaydı göster
SELECT TOP 10
    uzm_eventId,
    uzm_contactid,
    FirstName,
    LastName,
    Company,
    uzm_adress,
    uzm_city
FROM uzm_event
ORDER BY created_date DESC;
GO
