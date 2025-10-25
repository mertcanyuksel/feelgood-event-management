const sql = require('mssql');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Database configuration for setup (without database specified for initial connection)
const setupConfig = {
  server: process.env.DB_SERVER || 'localhost',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Password',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

const dbName = process.env.DB_DATABASE || 'EventManagementDB';

async function setupDatabase() {
  let pool;

  try {
    console.log('🚀 Starting database setup...\n');

    // Connect to master database
    console.log('📡 Connecting to MSSQL server...');
    pool = await sql.connect(setupConfig);
    console.log('✅ Connected to MSSQL server\n');

    // Create database if not exists
    console.log(`📦 Creating database: ${dbName}`);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
      BEGIN
        CREATE DATABASE ${dbName}
        PRINT 'Database created'
      END
      ELSE
        PRINT 'Database already exists'
    `);
    console.log(`✅ Database ${dbName} ready\n`);

    // Close connection and reconnect to the specific database
    await pool.close();

    const dbConfig = {
      ...setupConfig,
      database: dbName
    };

    pool = await sql.connect(dbConfig);
    console.log(`✅ Connected to ${dbName}\n`);

    // Execute schema script
    console.log('📋 Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Split by GO statements and execute each batch
    const batches = schemaSQL.split(/\nGO\n|\nGO$/gi).filter(batch => batch.trim());

    for (const batch of batches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }

    console.log('✅ Schema created successfully\n');

    // Insert seed data
    console.log('🌱 Inserting seed data...\n');

    // 1. Create default admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.request()
      .input('username', sql.NVarChar, 'admin')
      .input('password_hash', sql.NVarChar, hashedPassword)
      .input('full_name', sql.NVarChar, 'System Administrator')
      .query(`
        INSERT INTO users (username, password_hash, full_name)
        VALUES (@username, @password_hash, @full_name)
      `);
    console.log('✅ Admin user created (username: admin, password: admin123)\n');

    // 2. Insert Budget reference data
    console.log('💰 Inserting budget data...');
    const budgets = [
      'Bütçe A - Yurtiçi Organizasyonlar',
      'Bütçe B - Yurtdışı Organizasyonlar',
      'Bütçe C - Kurumsal Etkinlikler',
      'Bütçe D - Eğitim Programları',
      'Bütçe E - Dijital Kampanyalar',
      'Bütçe F - Sponsorluk',
      'Bütçe G - Fuarlar ve Kongre',
      'Bütçe H - VIP Organizasyonlar',
      'Bütçe I - Tedarikçi İlişkileri',
      'Bütçe J - Genel Giderler'
    ];

    const budgetIds = [];
    for (const budget of budgets) {
      const result = await pool.request()
        .input('name', sql.NVarChar, budget)
        .query(`
          INSERT INTO uzm_budgetBase (uzm_name)
          OUTPUT INSERTED.uzm_budgetId
          VALUES (@name)
        `);
      budgetIds.push(result.recordset[0].uzm_budgetId);
    }
    console.log(`✅ Inserted ${budgets.length} budget records\n`);

    // 3. Insert Salutation (Message) reference data
    console.log('💬 Inserting salutation data...');
    const salutations = [
      'Sayın İlgili, etkinliğimize davetlisiniz.',
      'Değerli Katılımcı, konferansımızda sizleri aramızda görmekten mutluluk duyarız.',
      'Merhaba, ürün lansmanımıza özel davetiyeniz ektedir.',
      'Sevgili Ortağımız, yıl sonu değerlendirme toplantımıza bekliyoruz.',
      'Sayın Yetkili, fuarımız için özel davetiye.',
      'Dear Guest, you are cordially invited to our international summit.',
      'Hello, please find your VIP invitation enclosed.',
      'Greetings, we are pleased to invite you to our annual gala.',
      'Dear Partner, your presence is requested at our business forum.',
      'Hi, exclusive invitation to our product showcase event.'
    ];

    const salutationIds = [];
    for (const salutation of salutations) {
      const result = await pool.request()
        .input('name', sql.NVarChar, salutation)
        .query(`
          INSERT INTO uzm_salutationBase (uzm_name)
          OUTPUT INSERTED.uzm_salutationId
          VALUES (@name)
        `);
      salutationIds.push(result.recordset[0].uzm_salutationId);
    }
    console.log(`✅ Inserted ${salutations.length} salutation records\n`);

    // 4. Insert Business Card reference data
    console.log('🎴 Inserting business card data...');
    const businessCards = [
      'Standart Kartvizit',
      'Premium Kartvizit (Lamine)',
      'VIP Kartvizit (Özel Tasarım)',
      'Dijital Kartvizit (QR Kodlu)',
      'Katlanabilir Kartvizit',
      'Broşür',
      'Katalog',
      'Davetiye Kartı',
      'Hediye Çeki',
      'Katılımcı Rozeti',
      'Sertifika',
      'Teşekkür Kartı',
      'Promosyon Kartı',
      'Bilgi Föyü',
      'Program Kitapçığı'
    ];

    const businessCardIds = [];
    for (const card of businessCards) {
      const result = await pool.request()
        .input('name', sql.NVarChar, card)
        .query(`
          INSERT INTO uzm_businesscard (uzm_name)
          OUTPUT INSERTED.uzm_businesscardId
          VALUES (@name)
        `);
      businessCardIds.push(result.recordset[0].uzm_businesscardId);
    }
    console.log(`✅ Inserted ${businessCards.length} business card records\n`);

    // 5. Sample data arrays
    const turkishNames = [
      { firstName: 'Ahmet', lastName: 'Yılmaz', company: 'ABC Teknoloji A.Ş.', title: 'Genel Müdür' },
      { firstName: 'Ayşe', lastName: 'Demir', company: 'XYZ Danışmanlık Ltd.', title: 'İş Geliştirme Müdürü' },
      { firstName: 'Mehmet', lastName: 'Kaya', company: 'Mega Holding', title: 'Pazarlama Direktörü' },
      { firstName: 'Fatma', lastName: 'Çelik', company: 'Güven Sigorta', title: 'Bölge Müdürü' },
      { firstName: 'Ali', lastName: 'Şahin', company: 'Şahin İnşaat', title: 'Proje Koordinatörü' },
      { firstName: 'Zeynep', lastName: 'Aydın', company: 'Aydın Tekstil', title: 'Satın Alma Müdürü' },
      { firstName: 'Mustafa', lastName: 'Öztürk', company: 'Öztürk Otomotiv', title: 'Genel Müdür Yardımcısı' },
      { firstName: 'Emine', lastName: 'Arslan', company: 'Arslan Gıda', title: 'İhracat Müdürü' },
      { firstName: 'Hüseyin', lastName: 'Polat', company: 'Polat Enerji', title: 'Operasyon Müdürü' },
      { firstName: 'Hatice', lastName: 'Kurt', company: 'Kurt Kimya', title: 'Satış Müdürü' },
      { firstName: 'İbrahim', lastName: 'Yıldız', company: 'Yıldız Elektronik', title: 'Teknik Müdür' },
      { firstName: 'Elif', lastName: 'Koç', company: 'Koç Danışmanlık', title: 'İnsan Kaynakları Müdürü' },
      { firstName: 'Murat', lastName: 'Özdemir', company: 'Özdemir Lojistik', title: 'Operasyon Koordinatörü' },
      { firstName: 'Merve', lastName: 'Doğan', company: 'Doğan Medya', title: 'İçerik Müdürü' },
      { firstName: 'Osman', lastName: 'Kara', company: 'Kara Mühendislik', title: 'Proje Müdürü' }
    ];

    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya'];
    const districts = ['Kadıköy', 'Beşiktaş', 'Çankaya', 'Konak', 'Nilüfer', 'Muratpaşa', 'Seyhan', 'Selçuklu'];
    const neighborhoods = ['Merkez', 'Atatürk', 'Cumhuriyet', 'Yenişehir', 'Bahçelievler', 'Kültür', 'İstiklal'];

    // 6. Insert Event records (100+ records directly with all fields)
    console.log('📅 Inserting event data (this may take a moment)...');

    const totalEvents = 100;
    for (let i = 0; i < totalEvents; i++) {
      const contact = turkishNames[i % turkishNames.length];
      const city = cities[i % cities.length];
      const district = districts[i % districts.length];
      const neighborhood = neighborhoods[i % neighborhoods.length];

      const budgetId = budgetIds[i % budgetIds.length];
      const salutationId = salutationIds[i % salutationIds.length];
      const bc1 = businessCardIds[i % businessCardIds.length];
      const bc2 = businessCardIds[(i + 1) % businessCardIds.length];
      const bc3 = i % 2 === 0 ? businessCardIds[(i + 2) % businessCardIds.length] : null;
      const bc4 = i % 3 === 0 ? businessCardIds[(i + 3) % businessCardIds.length] : null;
      const bc5 = i % 5 === 0 ? businessCardIds[(i + 4) % businessCardIds.length] : null;
      const nationality = (i % 4 === 0) ? 2 : 1; // Every 4th is international

      const address = `${neighborhood} Mahallesi, ${i + 1}. Sokak No: ${(i * 3) + 5}`;
      const country = nationality === 2 ? ['Germany', 'France', 'USA', 'UK'][i % 4] : 'Türkiye';
      const intCity = ['Berlin', 'Paris', 'New York', 'London'][i % 4];
      const finalCity = nationality === 2 ? intCity : city;
      const postalCode = `${34000 + (i * 100)}`;

      await pool.request()
        .input('budgetId', sql.UniqueIdentifier, budgetId)
        .input('nationality', sql.Int, nationality)
        .input('address', sql.NVarChar, address)
        .input('country', sql.NVarChar, country)
        .input('city', sql.NVarChar, finalCity)
        .input('county', sql.NVarChar, district)
        .input('state', sql.NVarChar, neighborhood)
        .input('postal', sql.NVarChar, postalCode)
        .input('firstName', sql.NVarChar, contact.firstName)
        .input('lastName', sql.NVarChar, contact.lastName)
        .input('company', sql.NVarChar, contact.company)
        .input('jobTitle', sql.NVarChar, contact.title)
        .input('salutationId', sql.UniqueIdentifier, salutationId)
        .input('bc1', sql.UniqueIdentifier, bc1)
        .input('bc2', sql.UniqueIdentifier, bc2)
        .input('bc3', sql.UniqueIdentifier, bc3)
        .input('bc4', sql.UniqueIdentifier, bc4)
        .input('bc5', sql.UniqueIdentifier, bc5)
        .input('createdBy', sql.NVarChar, 'admin')
        .query(`
          INSERT INTO uzm_event (
            uzm_budgetid, uzm_nationality,
            uzm_adress, uzm_CountryidName, uzm_city, uzm_county,
            uzm_businessstate, uzm_zippostalcode,
            FirstName, LastName, Company, JobTitle,
            uzm_salutationid, uzm_BusinessCard1, uzm_BusinessCard2,
            uzm_BusinessCard3, uzm_BusinessCard4, uzm_BusinessCard5,
            created_by, statecode
          )
          VALUES (
            @budgetId, @nationality,
            @address, @country, @city, @county,
            @state, @postal,
            @firstName, @lastName, @company, @jobTitle,
            @salutationId, @bc1, @bc2, @bc3, @bc4, @bc5,
            @createdBy, 0
          )
        `);
    }

    console.log(`✅ Inserted ${totalEvents} event records\n`);

    // 7. Insert some audit log samples
    console.log('📝 Inserting sample audit logs...');
    await pool.request().query(`
      INSERT INTO audit_log (table_name, record_id, action_type, action_by)
      VALUES
        ('users', '1', 'INSERT', 'SYSTEM'),
        ('uzm_budgetBase', 'sample-id', 'INSERT', 'SYSTEM'),
        ('uzm_event', 'sample-id', 'INSERT', 'admin')
    `);
    console.log('✅ Audit logs inserted\n');

    console.log('🎉 Database setup completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Database: ${dbName}`);
    console.log(`   - Admin user: admin / admin123`);
    console.log(`   - Budgets: ${budgets.length}`);
    console.log(`   - Salutations: ${salutations.length}`);
    console.log(`   - Business Cards: ${businessCards.length}`);
    console.log(`   - Contacts: ${contactIds.length}`);
    console.log(`   - Events: ${totalEvents}`);
    console.log('\n✅ Ready to start the application with: npm run dev\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Run setup
setupDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
