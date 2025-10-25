const { getConnection, sql } = require('../db/connection');

/**
 * Log an action to the audit_log table
 * @param {string} tableName - The table name where action occurred
 * @param {string} recordId - The ID of the affected record
 * @param {string} fieldName - The field name that changed (optional for INSERT/DELETE)
 * @param {string} oldValue - The old value (for UPDATE)
 * @param {string} newValue - The new value (for INSERT/UPDATE)
 * @param {string} actionType - INSERT, UPDATE, or DELETE
 * @param {string} actionBy - Username of who performed the action
 */
async function logAudit(tableName, recordId, fieldName, oldValue, newValue, actionType, actionBy) {
  try {
    const pool = await getConnection();

    await pool.request()
      .input('tableName', sql.NVarChar, tableName)
      .input('recordId', sql.NVarChar, recordId)
      .input('fieldName', sql.NVarChar, fieldName || null)
      .input('oldValue', sql.NVarChar, oldValue || null)
      .input('newValue', sql.NVarChar, newValue || null)
      .input('actionType', sql.NVarChar, actionType)
      .input('actionBy', sql.NVarChar, actionBy)
      .query(`
        INSERT INTO audit_log (
          table_name, record_id, field_name, old_value, new_value, action_type, action_by
        )
        VALUES (
          @tableName, @recordId, @fieldName, @oldValue, @newValue, @actionType, @actionBy
        )
      `);

    console.log(`📝 Audit logged: ${actionType} on ${tableName}(${recordId}) by ${actionBy}`);
  } catch (error) {
    console.error('❌ Failed to log audit:', error);
    // Don't throw - logging should not break the main operation
  }
}

/**
 * Log multiple field changes for an UPDATE operation
 */
async function logMultipleChanges(tableName, recordId, changes, actionBy) {
  const promises = changes.map(change =>
    logAudit(
      tableName,
      recordId,
      change.fieldName,
      change.oldValue,
      change.newValue,
      'UPDATE',
      actionBy
    )
  );

  await Promise.all(promises);
}

module.exports = {
  logAudit,
  logMultipleChanges
};
