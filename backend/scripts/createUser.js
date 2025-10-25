/**
 * User Creation Script
 * Kullanım: node scripts/createUser.js <username> <password> [fullname]
 * Örnek: node scripts/createUser.js admin admin123 "System Administrator"
 */

const bcrypt = require('bcryptjs');
const { getConnection, sql } = require('../db/connection');

async function createUser(username, password, fullName = null) {
  try {
    console.log('\n🔐 Kullanıcı oluşturuluyor...');
    console.log(`Username: ${username}`);

    // Password'ü hash'le
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log(`✅ Password hash'lendi (bcrypt, ${saltRounds} rounds)`);

    // Database'e bağlan
    const pool = await getConnection();
    console.log('✅ Database bağlantısı kuruldu');

    // Kullanıcı zaten var mı kontrol et
    const checkResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT user_id FROM uzm_users WHERE username = @username');

    if (checkResult.recordset.length > 0) {
      console.error('❌ HATA: Bu kullanıcı adı zaten mevcut!');
      process.exit(1);
    }

    // Kullanıcıyı ekle
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password_hash', sql.NVarChar, passwordHash)
      .input('full_name', sql.NVarChar, fullName)
      .query(`
        INSERT INTO uzm_users (username, password_hash, full_name, created_at, is_active)
        VALUES (@username, @password_hash, @full_name, GETDATE(), 1);
        SELECT SCOPE_IDENTITY() AS user_id;
      `);

    const userId = result.recordset[0].user_id;

    console.log('\n✅ Kullanıcı başarıyla oluşturuldu!');
    console.log('━'.repeat(50));
    console.log(`User ID: ${userId}`);
    console.log(`Username: ${username}`);
    console.log(`Full Name: ${fullName || 'N/A'}`);
    console.log(`Password Hash: ${passwordHash.substring(0, 30)}...`);
    console.log('━'.repeat(50));
    console.log(`\n🔑 Giriş bilgileri:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    process.exit(1);
  }
}

// Command line arguments'ları al
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n📖 Kullanım:');
  console.log('   node scripts/createUser.js <username> <password> [fullname]');
  console.log('\n📝 Örnekler:');
  console.log('   node scripts/createUser.js admin admin123');
  console.log('   node scripts/createUser.js mertcan mertcan123 "Mertcan Yüksel"');
  console.log('   node scripts/createUser.js user1 password123 "Test User"\n');
  process.exit(1);
}

const [username, password, fullName] = args;

// Kullanıcıyı oluştur
createUser(username, password, fullName);
