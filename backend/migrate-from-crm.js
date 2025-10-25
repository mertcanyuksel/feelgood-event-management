require('dotenv').config();
const sql = require('mssql');

// CRM_365 veritabanı config
const crmConfig = {
  server: process.env.DB_SERVER,
  database: 'CRM_365',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  }
};

// FEELGOOD veritabanı config
const feelgoodConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE, // FEELGOOD
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  }
};

async function migrateData() {
  let crmPool, feelgoodPool;

  try {
    console.log('🚀 CRM_365 -> FEELGOOD veri aktarımı başlatılıyor...\n');

    // CRM_365'e bağlan
    console.log('📡 CRM_365 veritabanına bağlanılıyor...');
    crmPool = await sql.connect(crmConfig);
    console.log('✅ CRM_365 bağlantısı başarılı\n');

    // Ayrı bir bağlantı ile FEELGOOD'a bağlan
    console.log('📡 FEELGOOD veritabanına bağlanılıyor...');
    feelgoodPool = new sql.ConnectionPool(feelgoodConfig);
    await feelgoodPool.connect();
    console.log('✅ FEELGOOD bağlantısı başarılı\n');

    // 1. Referans tablolarını aktar
    console.log('📦 ADIM 1: Referans tabloları aktarılıyor...\n');

    // uzm_budgetBase
    console.log('  - uzm_budgetBase aktarılıyor...');
    const budgets = await crmPool.request().query(`
      SELECT DISTINCT uzm_budgetId, uzm_name
      FROM uzm_budgetBase
    `);

    for (const budget of budgets.recordset) {
      await feelgoodPool.request()
        .input('budgetId', sql.UniqueIdentifier, budget.uzm_budgetId)
        .input('name', sql.NVarChar, budget.uzm_name)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM uzm_budgetBase WHERE uzm_budgetId = @budgetId)
          BEGIN
            INSERT INTO uzm_budgetBase (uzm_budgetId, uzm_name, is_active)
            VALUES (@budgetId, @name, 1)
          END
        `);
    }
    console.log(`    ✅ ${budgets.recordset.length} bütçe kaydı aktarıldı\n`);

    // uzm_salutationBase
    console.log('  - uzm_salutationBase aktarılıyor...');
    const salutations = await crmPool.request().query(`
      SELECT DISTINCT uzm_salutationId, uzm_name
      FROM uzm_salutationBase
    `);

    for (const salutation of salutations.recordset) {
      await feelgoodPool.request()
        .input('salutationId', sql.UniqueIdentifier, salutation.uzm_salutationId)
        .input('name', sql.NVarChar, salutation.uzm_name)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM uzm_salutationBase WHERE uzm_salutationId = @salutationId)
          BEGIN
            INSERT INTO uzm_salutationBase (uzm_salutationId, uzm_name, is_active)
            VALUES (@salutationId, @name, 1)
          END
        `);
    }
    console.log(`    ✅ ${salutations.recordset.length} mesaj kaydı aktarıldı\n`);

    // uzm_businesscard
    console.log('  - uzm_businesscard aktarılıyor...');
    const businessCards = await crmPool.request().query(`
      SELECT DISTINCT uzm_businesscardId, uzm_name
      FROM uzm_businesscard
    `);

    for (const card of businessCards.recordset) {
      await feelgoodPool.request()
        .input('cardId', sql.UniqueIdentifier, card.uzm_businesscardId)
        .input('name', sql.NVarChar, card.uzm_name)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM uzm_businesscard WHERE uzm_businesscardId = @cardId)
          BEGIN
            INSERT INTO uzm_businesscard (uzm_businesscardId, uzm_name, is_active)
            VALUES (@cardId, @name, 1)
          END
        `);
    }
    console.log(`    ✅ ${businessCards.recordset.length} kartvizit kaydı aktarıldı\n`);

    // 2. Event kayıtlarını aktar
    console.log('📦 ADIM 2: Event kayıtları aktarılıyor...\n');

    const events = await crmPool.request().query(`
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

          -- Address fields
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
          C.JobTitle

      FROM Contact C
      INNER JOIN uzm_event UE ON UE.uzm_contactid = C.ContactId
      WHERE
          UE.uzm_eventtypeid = 'C89A605F-7F52-F011-8BAA-005056A1F1F4'
          AND UE.statecode = 0
    `);

    console.log(`  📊 ${events.recordset.length} kayıt bulundu, aktarılıyor...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const event of events.recordset) {
      try {
        await feelgoodPool.request()
          .input('contactId', sql.NVarChar, event.uzm_contactid)
          .input('addressType', sql.Int, event.uzm_addresstype)
          .input('budgetId', sql.UniqueIdentifier, event.uzm_budgetid)
          .input('salutationId', sql.UniqueIdentifier, event.uzm_salutationid)
          .input('businessCard1', sql.UniqueIdentifier, event.uzm_BusinessCard1)
          .input('businessCard2', sql.UniqueIdentifier, event.uzm_BusinessCard2)
          .input('businessCard3', sql.UniqueIdentifier, event.uzm_BusinessCard3)
          .input('businessCard4', sql.UniqueIdentifier, event.uzm_BusinessCard4)
          .input('businessCard5', sql.UniqueIdentifier, event.uzm_BusinessCard5)
          .input('eventTypeId', sql.UniqueIdentifier, event.uzm_eventtypeid)
          .input('stateCode', sql.Int, event.statecode)
          .input('nationality', sql.Int, event.uzm_nationality)
          .input('address', sql.NVarChar, event.uzm_adress)
          .input('country', sql.NVarChar, event.uzm_CountryidName)
          .input('city', sql.NVarChar, event.uzm_city)
          .input('county', sql.NVarChar, event.uzm_county)
          .input('businessState', sql.NVarChar, event.uzm_businessstate)
          .input('zipPostalCode', sql.NVarChar, event.uzm_zippostalcode)
          .input('firstName', sql.NVarChar, event.FirstName)
          .input('lastName', sql.NVarChar, event.LastName)
          .input('company', sql.NVarChar, event.Company)
          .input('jobTitle', sql.NVarChar, event.JobTitle)
          .query(`
            INSERT INTO uzm_event (
              uzm_contactid, uzm_addresstype,
              uzm_budgetid, uzm_salutationid,
              uzm_BusinessCard1, uzm_BusinessCard2, uzm_BusinessCard3,
              uzm_BusinessCard4, uzm_BusinessCard5,
              uzm_eventtypeid, statecode, uzm_nationality,
              uzm_adress, uzm_CountryidName, uzm_city, uzm_county,
              uzm_businessstate, uzm_zippostalcode,
              FirstName, LastName, Company, JobTitle,
              created_date, modified_date, is_deleted
            ) VALUES (
              @contactId, @addressType,
              @budgetId, @salutationId,
              @businessCard1, @businessCard2, @businessCard3,
              @businessCard4, @businessCard5,
              @eventTypeId, @stateCode, @nationality,
              @address, @country, @city, @county,
              @businessState, @zipPostalCode,
              @firstName, @lastName, @company, @jobTitle,
              GETDATE(), GETDATE(), 0
            )
          `);

        successCount++;

        if (successCount % 10 === 0) {
          process.stdout.write(`  ⏳ ${successCount} kayıt aktarıldı...\r`);
        }
      } catch (err) {
        errorCount++;
        console.error(`  ❌ Hata (${event.FirstName} ${event.LastName}):`, err.message);
      }
    }

    console.log(`\n  ✅ ${successCount} kayıt başarıyla aktarıldı`);
    if (errorCount > 0) {
      console.log(`  ⚠️  ${errorCount} kayıt aktarılamadı\n`);
    }

    // 3. Sonuç özeti
    console.log('\n📊 ÖZET:\n');

    const summary = await feelgoodPool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM uzm_budgetBase) AS budget_count,
        (SELECT COUNT(*) FROM uzm_salutationBase) AS salutation_count,
        (SELECT COUNT(*) FROM uzm_businesscard) AS businesscard_count,
        (SELECT COUNT(*) FROM uzm_event) AS event_count
    `);

    console.table(summary.recordset[0]);

    console.log('\n✨ Veri aktarımı tamamlandı!\n');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (crmPool) {
      await crmPool.close();
    }
    if (feelgoodPool) {
      await feelgoodPool.close();
    }
  }
}

// Script'i çalıştır
migrateData();
