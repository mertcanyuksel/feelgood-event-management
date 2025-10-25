const { getConnection, sql } = require('../db/connection');
const { logAudit, logMultipleChanges } = require('../utils/logger');

/**
 * Get all events - NO pagination, returns ALL data for Excel-like filtering
 */
const getEvents = async (req, res) => {
  try {
    const pool = await getConnection();

    // Simple WHERE clause
    const whereClause = `
      WHERE UE.uzm_eventtypeid = 'C89A605F-7F52-F011-8BAA-005056A1F1F4'
      AND UE.statecode = 0
    `;

    // Get ALL data - No pagination
    const dataQuery = `
      SELECT
        UE.uzm_eventId,
        UBB.uzm_name AS BUTCE,
        CASE
          WHEN UE.uzm_nationality = 2 THEN 'YURTDIŞI'
          ELSE 'YURTİÇİ'
        END AS GONDERIM_TURU,
        UE.uzm_adress AS ADRES,
        UE.uzm_CountryidName AS ULKE,
        UE.uzm_city AS SEHIR,
        UE.uzm_county AS ILCE,
        UE.uzm_businessstate AS SEMT,
        UE.uzm_zippostalcode AS POSTA_KODU,
        UE.FirstName AS AD,
        UE.LastName AS SOYAD,
        UE.Company AS SIRKET,
        UE.JobTitle AS UNVAN,
        USB.uzm_name AS MESAJ,
        UBC1.uzm_name AS KARTVIZIT1,
        UBC2.uzm_name AS KARTVIZIT2,
        UBC3.uzm_name AS KARTVIZIT3,
        UBC4.uzm_name AS KARTVIZIT4,
        UBC5.uzm_name AS KARTVIZIT5,
        UE.uzm_contactid,
        UE.is_modified,
        UE.is_deleted,
        UE.created_date,
        UE.modified_date,
        UE.modified_by
      FROM uzm_event UE
      INNER JOIN uzm_budgetBase UBB ON UBB.uzm_budgetId = UE.uzm_budgetid
      LEFT JOIN uzm_salutationBase USB ON USB.uzm_salutationId = UE.uzm_salutationid
      LEFT JOIN uzm_businesscard UBC1 ON UBC1.uzm_businesscardId = UE.uzm_BusinessCard1
      LEFT JOIN uzm_businesscard UBC2 ON UBC2.uzm_businesscardId = UE.uzm_BusinessCard2
      LEFT JOIN uzm_businesscard UBC3 ON UBC3.uzm_businesscardId = UE.uzm_BusinessCard3
      LEFT JOIN uzm_businesscard UBC4 ON UBC4.uzm_businesscardId = UE.uzm_BusinessCard4
      LEFT JOIN uzm_businesscard UBC5 ON UBC5.uzm_businesscardId = UE.uzm_BusinessCard5
      ${whereClause}
      ORDER BY UBB.uzm_name ASC
    `;

    const dataResult = await pool.request().query(dataQuery);

    res.json({
      success: true,
      data: dataResult.recordset,
      total: dataResult.recordset.length
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

/**
 * Get a single event by ID for editing
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool.request()
      .input('eventId', sql.UniqueIdentifier, id)
      .query(`
        SELECT
          UE.*,
          UBB.uzm_budgetId,
          USB.uzm_salutationId
        FROM uzm_event UE
        LEFT JOIN uzm_budgetBase UBB ON UBB.uzm_budgetId = UE.uzm_budgetid
        LEFT JOIN uzm_salutationBase USB ON USB.uzm_salutationId = UE.uzm_salutationid
        WHERE UE.uzm_eventId = @eventId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

/**
 * Create a new event
 */
const createEvent = async (req, res) => {
  try {
    const {
      budgetId,
      nationality,
      contactId,
      addressType,
      address,
      country,
      city,
      county,
      state,
      postalCode,
      salutationId,
      businessCard1,
      businessCard2,
      businessCard3,
      businessCard4,
      businessCard5,
      firstName,
      lastName,
      company,
      jobTitle
    } = req.body;

    const username = req.session.user?.username || 'system';
    const pool = await getConnection();

    // Validation
    if (!budgetId || !nationality || !salutationId || !businessCard1) {
      return res.status(400).json({
        success: false,
        message: 'BÜTÇE, GÖNDERİM TÜRÜ, MESAJ ve en az 1 KARTVİZİT zorunludur'
      });
    }

    // Insert new event with all fields directly in uzm_event table
    const result = await pool.request()
      .input('contactId', sql.NVarChar, contactId || null)
      .input('addressType', sql.Int, addressType ? parseInt(addressType) : 3)
      .input('budgetId', sql.UniqueIdentifier, budgetId)
      .input('nationality', sql.Int, parseInt(nationality))
      .input('address', sql.NVarChar, address || null)
      .input('country', sql.NVarChar, country || null)
      .input('city', sql.NVarChar, city || null)
      .input('county', sql.NVarChar, county || null)
      .input('state', sql.NVarChar, state || null)
      .input('postalCode', sql.NVarChar, postalCode || null)
      .input('firstName', sql.NVarChar, firstName || null)
      .input('lastName', sql.NVarChar, lastName || null)
      .input('company', sql.NVarChar, company || null)
      .input('jobTitle', sql.NVarChar, jobTitle || null)
      .input('salutationId', sql.UniqueIdentifier, salutationId)
      .input('bc1', sql.UniqueIdentifier, businessCard1)
      .input('bc2', sql.UniqueIdentifier, businessCard2 || null)
      .input('bc3', sql.UniqueIdentifier, businessCard3 || null)
      .input('bc4', sql.UniqueIdentifier, businessCard4 || null)
      .input('bc5', sql.UniqueIdentifier, businessCard5 || null)
      .input('createdBy', sql.NVarChar, username)
      .query(`
        INSERT INTO uzm_event (
          uzm_contactid,
          uzm_addresstype,
          uzm_budgetid,
          uzm_nationality,
          uzm_adress,
          uzm_CountryidName,
          uzm_city,
          uzm_county,
          uzm_businessstate,
          uzm_zippostalcode,
          FirstName,
          LastName,
          Company,
          JobTitle,
          uzm_salutationid,
          uzm_BusinessCard1,
          uzm_BusinessCard2,
          uzm_BusinessCard3,
          uzm_BusinessCard4,
          uzm_BusinessCard5,
          created_by,
          statecode,
          uzm_eventtypeid
        )
        OUTPUT INSERTED.uzm_eventId
        VALUES (
          @contactId,
          @addressType,
          @budgetId,
          @nationality,
          @address,
          @country,
          @city,
          @county,
          @state,
          @postalCode,
          @firstName,
          @lastName,
          @company,
          @jobTitle,
          @salutationId,
          @bc1,
          @bc2,
          @bc3,
          @bc4,
          @bc5,
          @createdBy,
          0,
          'C89A605F-7F52-F011-8BAA-005056A1F1F4'
        )
      `);

    const newEventId = result.recordset[0].uzm_eventId;

    // Log audit
    await logAudit('uzm_event', newEventId, null, null, JSON.stringify(req.body), 'INSERT', username);

    console.log(`✅ New event created: ${newEventId} by ${username}`);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: newEventId
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

/**
 * Update an existing event
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      budgetId,
      nationality,
      contactId,
      addressType,
      address,
      country,
      city,
      county,
      state,
      postalCode,
      firstName,
      lastName,
      company,
      jobTitle,
      salutationId,
      businessCard1,
      businessCard2,
      businessCard3,
      businessCard4,
      businessCard5,
      isDeleted
    } = req.body;

    const username = req.session.user?.username || 'system';
    const pool = await getConnection();

    // Fetch old values for audit
    const oldDataResult = await pool.request()
      .input('eventId', sql.UniqueIdentifier, id)
      .query('SELECT * FROM uzm_event WHERE uzm_eventId = @eventId');

    if (oldDataResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const oldData = oldDataResult.recordset[0];

    // Update event (all fields including person info)
    await pool.request()
      .input('eventId', sql.UniqueIdentifier, id)
      .input('contactId', sql.NVarChar, contactId || null)
      .input('addressType', sql.Int, addressType ? parseInt(addressType) : 3)
      .input('budgetId', sql.UniqueIdentifier, budgetId)
      .input('nationality', sql.Int, parseInt(nationality))
      .input('address', sql.NVarChar, address || null)
      .input('country', sql.NVarChar, country || null)
      .input('city', sql.NVarChar, city || null)
      .input('county', sql.NVarChar, county || null)
      .input('state', sql.NVarChar, state || null)
      .input('postalCode', sql.NVarChar, postalCode || null)
      .input('firstName', sql.NVarChar, firstName || null)
      .input('lastName', sql.NVarChar, lastName || null)
      .input('company', sql.NVarChar, company || null)
      .input('jobTitle', sql.NVarChar, jobTitle || null)
      .input('salutationId', sql.UniqueIdentifier, salutationId)
      .input('bc1', sql.UniqueIdentifier, businessCard1)
      .input('bc2', sql.UniqueIdentifier, businessCard2 || null)
      .input('bc3', sql.UniqueIdentifier, businessCard3 || null)
      .input('bc4', sql.UniqueIdentifier, businessCard4 || null)
      .input('bc5', sql.UniqueIdentifier, businessCard5 || null)
      .input('isModified', sql.Bit, isDeleted ? oldData.is_modified : 1)
      .input('isDeleted', sql.Bit, isDeleted ? 1 : 0)
      .input('modifiedBy', sql.NVarChar, username)
      .query(`
        UPDATE uzm_event
        SET
          uzm_contactid = @contactId,
          uzm_addresstype = @addressType,
          uzm_budgetid = @budgetId,
          uzm_nationality = @nationality,
          uzm_adress = @address,
          uzm_CountryidName = @country,
          uzm_city = @city,
          uzm_county = @county,
          uzm_businessstate = @state,
          uzm_zippostalcode = @postalCode,
          FirstName = @firstName,
          LastName = @lastName,
          Company = @company,
          JobTitle = @jobTitle,
          uzm_salutationid = @salutationId,
          uzm_BusinessCard1 = @bc1,
          uzm_BusinessCard2 = @bc2,
          uzm_BusinessCard3 = @bc3,
          uzm_BusinessCard4 = @bc4,
          uzm_BusinessCard5 = @bc5,
          is_modified = @isModified,
          is_deleted = @isDeleted,
          modified_date = GETDATE(),
          modified_by = @modifiedBy
        WHERE uzm_eventId = @eventId
      `);

    // Log changes
    const changes = [];

    // Compare each field and log if changed
    const fieldsToCheck = [
      { name: 'uzm_budgetid', oldVal: oldData.uzm_budgetid, newVal: budgetId },
      { name: 'uzm_nationality', oldVal: oldData.uzm_nationality, newVal: nationality },
      { name: 'uzm_adress', oldVal: oldData.uzm_adress, newVal: address },
      { name: 'uzm_city', oldVal: oldData.uzm_city, newVal: city },
      { name: 'is_deleted', oldVal: oldData.is_deleted, newVal: isDeleted ? 1 : 0 }
    ];

    fieldsToCheck.forEach(field => {
      if (field.oldVal != field.newVal) {
        changes.push({
          fieldName: field.name,
          oldValue: String(field.oldVal || ''),
          newValue: String(field.newVal || '')
        });
      }
    });

    if (changes.length > 0) {
      await logMultipleChanges('uzm_event', id, changes, username);
    }

    if (isDeleted) {
      await logAudit('uzm_event', id, 'is_deleted', '0', '1', 'DELETE', username);
    }

    console.log(`✅ Event updated: ${id} by ${username}`);

    res.json({
      success: true,
      message: 'Event updated successfully'
    });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

/**
 * Get reference data for dropdowns
 */
const getBudgets = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT uzm_budgetId as id, uzm_name as name
      FROM uzm_budgetBase
      WHERE is_active = 1
      ORDER BY uzm_name
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets'
    });
  }
};

const getSalutations = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT uzm_salutationId as id, uzm_name as name
      FROM uzm_salutationBase
      WHERE is_active = 1
      ORDER BY uzm_name
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching salutations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salutations'
    });
  }
};

const getBusinessCards = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT uzm_businesscardId as id, uzm_name as name
      FROM uzm_businesscard
      WHERE is_active = 1
      ORDER BY uzm_name
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching business cards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching business cards'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  getBudgets,
  getSalutations,
  getBusinessCards
};
